const fs = require('fs');
const path = require('path');

const CARD_TYPES_TO_FORMAT = {
    'exemplo': formatListContent,
    'dica': formatListContent,
    'atencao': formatListContent,
    'duvidas': formatFaqContent,
};

function toHtmlList(items) {
    if (!items || items.length === 0) return '';
    const listItems = items.map(item => `<li>${item.trim()}</li>`).join('');
    return `<ul class="card-list">${listItems}</ul>`;
}

function formatListContent(content) {
    const items = content.split(/•|\n\n•/g).filter(Boolean);
    const htmlItems = items.map(item => item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'));
    return toHtmlList(htmlItems);
}

function formatFaqContent(content) {
    const blocks = content.split(/\n\s*\n/).filter(Boolean);
    let html = '<div class="faq-container">';

    for (let i = 0; i < blocks.length; i += 2) {
        const question = blocks[i] ? blocks[i].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/❓/g, '').trim() : '';
        const answer = blocks[i+1] ? blocks[i+1].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/💡/g, '').trim() : '';

        if(question && answer) {
            html += `
                <div class="faq-item">
                    <p class="faq-question">❓ ${question}</p>
                    <p class="faq-answer">💡 ${answer}</p>
                </div>
            `;
        }
    }

    html += '</div>';
    return html;
}

function processarArquivo(caminhoArquivo) {
    try {
        console.log(`📝 Processando: ${path.basename(caminhoArquivo)}`);
        
        const conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
        const nomeVariavel = path.basename(caminhoArquivo, '.js');
        const sandbox = {};
        const script = conteudo.replace(`window.${nomeVariavel}`, 'sandbox.data');
        eval(script);

        const moduleData = sandbox.data;
        if (!moduleData || !Array.isArray(moduleData.cards)) {
            console.log(`ℹ️ Sem cards para processar em ${path.basename(caminhoArquivo)}`);
            return false;
        }

        let alteracoesFeitas = false;

        moduleData.cards.forEach(card => {
            if (CARD_TYPES_TO_FORMAT[card.type]) {
                // Evita re-processar se já for HTML
                if (card.content.trim().startsWith('<')) return;

                const formatter = CARD_TYPES_TO_FORMAT[card.type];
                const originalContent = card.content;
                const newContent = formatter(originalContent);

                if (originalContent !== newContent) {
                    console.log(`  🔄 Formatando card '${card.title}'...`);
                    card.content = newContent;
                    alteracoesFeitas = true;
                }
            }
        });

        if (alteracoesFeitas) {
            const novoCodigo = `window.${nomeVariavel} = ${JSON.stringify(moduleData, null, 2)};`;
            fs.writeFileSync(caminhoArquivo, novoCodigo, 'utf8');
            console.log(`✅ Cards formatados com sucesso em ${path.basename(caminhoArquivo)}`);
            return true;
        } else {
            console.log(`ℹ️ Nenhuma alteração de formatação necessária em ${path.basename(caminhoArquivo)}.`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Erro ao processar ${caminhoArquivo}:`, error);
        return false;
    }
}

function main() {
    console.log('🎨 INICIANDO FORMATAÇÃO DE CONTEÚDO DOS CARDS...\n');
    const pastaQuestoes = path.join(__dirname, '../public/data/browser/questoes-otimizadas');
    const arquivos = fs.readdirSync(pastaQuestoes).filter(f => f.endsWith('.js'));
    
    let arquivosAlterados = 0;
    
    arquivos.forEach(arquivo => {
        const caminhoCompleto = path.join(pastaQuestoes, arquivo);
        if (processarArquivo(caminhoCompleto)) {
            arquivosAlterados++;
        }
    });

    console.log(`\n📊 RESUMO DA FORMATAÇÃO:`);
    console.log(`- Arquivos processados: ${arquivos.length}`);
    console.log(`- Arquivos alterados: ${arquivosAlterados}`);
    console.log('\n🎯 Formatação de conteúdo dos cards concluída!');
}

if (require.main === module) {
    main();
} 