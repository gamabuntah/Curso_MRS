const fs = require('fs');
const path = require('path');

function formatDefaultCardContent(content) {
    if (!content || typeof content !== 'string' || content.trim().startsWith('<')) {
        return content;
    }

    if (content.includes('•')) {
        const parts = content.split('•').map(p => p.trim().replace(/\s+/g, ' ')).filter(Boolean);
        
        let html = '';
        let listItems;

        if (!content.trim().startsWith('•')) {
            const intro = parts.shift();
            html += `<p>${intro}</p>`;
            listItems = parts;
        } else {
            listItems = parts;
        }

        if (listItems.length > 0) {
            html += '<ul class="card-list default-list">';
            listItems.forEach(item => {
                let formattedItem = item.replace(/(\b[A-Z][a-zA-ZÀ-ú\s]+\b:)/g, '<strong>$1</strong>');
                formattedItem = formattedItem.replace(/(\b(ODS|Meta) \d+(\.\d+[a-z]?)?):/g, '<strong>$1</strong>');
                html += `<li>${formattedItem}</li>`;
            });
            html += '</ul>';
        }
        
        return html;
    } else {
        return content.split(/\n\s*\n/).map(p => `<p>${p.trim()}</p>`).join('');
    }
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
            return false;
        }

        let alteracoesFeitas = false;

        moduleData.cards.forEach(card => {
            if (card.type === 'default') {
                const originalContent = card.content;
                const newContent = formatDefaultCardContent(originalContent);

                if (originalContent !== newContent) {
                    console.log(`  🔄 Formatando card default '${card.title}'...`);
                    card.content = newContent;
                    alteracoesFeitas = true;
                }
            }
        });

        if (alteracoesFeitas) {
            const novoCodigo = `window.${nomeVariavel} = ${JSON.stringify(moduleData, null, 2)};`;
            fs.writeFileSync(caminhoArquivo, novoCodigo, 'utf8');
            console.log(`✅ Cards default formatados com sucesso em ${path.basename(caminhoArquivo)}`);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error(`❌ Erro ao processar ${caminhoArquivo}:`, error);
        return false;
    }
}

function main() {
    console.log('🎨 INICIANDO FORMATAÇÃO DE CONTEÚDO DOS CARDS COMUNS (DEFAULT)...\n');
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
    console.log('\n🎯 Formatação de conteúdo dos cards comuns concluída!');
}

if (require.main === module) {
    main();
} 