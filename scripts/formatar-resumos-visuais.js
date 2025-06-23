const fs = require('fs');
const path = require('path');

function markdownTableToHtml(markdown) {
    const lines = markdown.trim().split('\n');
    if (lines.length < 2) return ''; // Precisa de cabeçalho e separador

    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
    const rows = lines.slice(2).map(line => line.split('|').map(cell => cell.trim()).filter(Boolean));

    let html = '<table class="summary-table">';
    
    // Cabeçalho
    html += '<thead><tr>';
    headers.forEach(header => {
        html += `<th>${header}</th>`;
    });
    html += '</tr></thead>';

    // Corpo
    html += '<tbody>';
    rows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            html += `<td>${cell}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';

    return html;
}

function processarResumoVisual(content) {
    if (!content || typeof content !== 'string') return content;
    
    const blocks = content.split(/\n\s*\n/); // Divide por linhas em branco
    let newContent = '';

    blocks.forEach(block => {
        if (block.includes('|')) {
            // É uma tabela
            newContent += markdownTableToHtml(block);
        } else {
            // É um título
            const title = block.replace(/[*#]/g, '').replace(/📚|🔄/g, '').trim();
            if (title) {
                newContent += `<h4>${title}</h4>`;
            }
        }
    });

    return newContent;
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
        if (!moduleData) {
            console.log(`⚠️ Não foi possível carregar os dados de ${caminhoArquivo}`);
            return false;
        }

        const cards = moduleData.cards;
        if (!cards || !Array.isArray(cards)) {
            console.log(`ℹ️ Sem cards para processar em ${caminhoArquivo}`);
            return false;
        }

        const resumoCard = cards.find(card => card.type === 'resumo visual');
        if (!resumoCard) {
            console.log(`ℹ️ Sem card 'Resumo Visual' em ${caminhoArquivo}`);
            return false;
        }

        const originalContent = resumoCard.content;
        const newContent = processarResumoVisual(originalContent);

        if (originalContent !== newContent) {
            resumoCard.content = newContent;
            const novoCodigo = `window.${nomeVariavel} = ${JSON.stringify(moduleData, null, 2)};`;
            fs.writeFileSync(caminhoArquivo, novoCodigo, 'utf8');
            console.log(`✅ 'Resumo Visual' formatado com sucesso em ${path.basename(caminhoArquivo)}`);
            return true;
        } else {
            console.log(`ℹ️ Nenhuma alteração necessária em ${path.basename(caminhoArquivo)}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Erro ao processar ${caminhoArquivo}:`, error);
        return false;
    }
}

function main() {
    console.log('🎨 INICIANDO FORMATAÇÃO DOS CARDS DE RESUMO VISUAL...\n');
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
    console.log('\n🎯 Formatação concluída!');
}

if (require.main === module) {
    main();
} 