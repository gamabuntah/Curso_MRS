const fs = require('fs');
const path = require('path');

// Configuração
const dataPath = 'public/data';
const outputPath = 'public/data/browser';

// Criar pasta de saída se não existir
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

// Função para converter módulo para formato browser
function converterParaBrowser(arquivo) {
    const caminhoCompleto = path.join(dataPath, arquivo);
    const caminhoSaida = path.join(outputPath, arquivo);
    
    if (!fs.existsSync(caminhoCompleto)) {
        console.log(`❌ Arquivo não encontrado: ${arquivo}`);
        return;
    }
    
    try {
        let conteudo = fs.readFileSync(caminhoCompleto, 'utf8').trim();
        let nomeVariavel = arquivo.replace('.js', '');
        // Remove module.exports = ou const/let/var ... = do início
        conteudo = conteudo.replace(/^module\.exports\s*=\s*/, '');
        conteudo = conteudo.replace(/^(const|let|var)\s+\w+\s*=\s*/, '');
        // Remove ; no final, se houver
        conteudo = conteudo.replace(/;\s*$/, '');
        // Garante que o conteúdo seja um objeto JS
        conteudo = `window.${nomeVariavel} = ${conteudo};\n`;
        fs.writeFileSync(caminhoSaida, conteudo);
        console.log(`✅ Convertido: ${arquivo}`);
    } catch (erro) {
        console.error(`❌ Erro ao converter ${arquivo}:`, erro.message);
    }
}

// Lista de arquivos para converter
const arquivos = [
    'module1.js',
    'module2.js', 
    'module3.js',
    'module4.js',
    'module5.js',
    'module6.js',
    'module7.js',
    'avaliacaoFinal.js'
];

console.log('🔄 Convertendo módulos para formato browser...');

arquivos.forEach(arquivo => {
    converterParaBrowser(arquivo);
});

console.log('✅ Conversão concluída!');
console.log(`📁 Arquivos convertidos em: ${outputPath}`); 