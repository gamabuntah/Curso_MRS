const fs = require('fs');

// Ler o arquivo
const conteudo = fs.readFileSync('MRS/Questoes_Av_Final.md', 'utf8');

// Contar questões por padrão simples
const linhas = conteudo.split('\n');
let contadorQuestoes = 0;
const questoesEncontradas = [];

for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    
    // Padrões para identificar início de questões
    if (linha.match(/^\d+\.\s/) || 
        linha.match(/^Questão \d+:/) ||
        linha.match(/^Questões sobre o Módulo/)) {
        contadorQuestoes++;
        questoesEncontradas.push({
            linha: i + 1,
            texto: linha.substring(0, 100) + '...'
        });
    }
}

console.log(`📊 ANÁLISE DO ARQUIVO Questoes_Av_Final.md`);
console.log(`Total de linhas no arquivo: ${linhas.length}`);
console.log(`Questões identificadas: ${contadorQuestoes}\n`);

console.log('🔍 QUESTÕES ENCONTRADAS:');
questoesEncontradas.forEach((q, index) => {
    console.log(`${index + 1}. Linha ${q.linha}: ${q.texto}`);
});

// Verificar se há títulos de módulos
const modulos = [];
for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (linha.includes('Módulo') && linha.includes('PNSB')) {
        modulos.push({
            linha: i + 1,
            titulo: linha
        });
    }
}

console.log('\n📚 MÓDULOS IDENTIFICADOS:');
modulos.forEach((mod, index) => {
    console.log(`${index + 1}. Linha ${mod.linha}: ${mod.titulo}`);
});

// Verificar se há questões repetidas por texto
const textosQuestoes = [];
const duplicatas = [];

for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    
    // Se é uma linha que parece ser início de questão
    if (linha.match(/^\d+\.\s/) || linha.match(/^Questão \d+:/)) {
        const textoLimpo = linha.replace(/^\d+\.\s*/, '').replace(/^Questão \d+:\s*/, '').trim();
        
        if (textoLimpo.length > 10) {
            // Verificar se já existe
            const existente = textosQuestoes.find(t => t.texto === textoLimpo);
            if (existente) {
                duplicatas.push({
                    original: existente.linha,
                    duplicada: i + 1,
                    texto: textoLimpo
                });
            } else {
                textosQuestoes.push({
                    linha: i + 1,
                    texto: textoLimpo
                });
            }
        }
    }
}

console.log('\n🚨 QUESTÕES DUPLICADAS ENCONTRADAS:');
if (duplicatas.length === 0) {
    console.log('✅ Nenhuma questão duplicada foi encontrada!');
} else {
    duplicatas.forEach((dup, index) => {
        console.log(`${index + 1}. Questão duplicada:`);
        console.log(`   Original: linha ${dup.original}`);
        console.log(`   Duplicada: linha ${dup.duplicada}`);
        console.log(`   Texto: "${dup.texto.substring(0, 80)}..."`);
        console.log('');
    });
}

console.log(`\n📈 RESUMO:`);
console.log(`- Total de linhas: ${linhas.length}`);
console.log(`- Questões identificadas: ${contadorQuestoes}`);
console.log(`- Módulos encontrados: ${modulos.length}`);
console.log(`- Questões duplicadas: ${duplicatas.length}`);
console.log(`- Questões únicas: ${textosQuestoes.length}`); 