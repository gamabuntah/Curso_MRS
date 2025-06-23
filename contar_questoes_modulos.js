const fs = require('fs');

// Ler o arquivo consolidado
const conteudo = fs.readFileSync('MRS/Questoes_Av_Final_Padronizadas_COMPLETO.md', 'utf8');

// Contar questões por módulo
const modulos = {
    'Módulo 1': 0,
    'Módulo 2': 0,
    'Módulo 3': 0,
    'Módulo 4': 0,
    'Módulo 5': 0,
    'Módulo 6': 0,
    'Módulo 7': 0
};

// Procurar por padrões de módulo
const linhas = conteudo.split('\n');
let totalQuestoes = 0;

linhas.forEach(linha => {
    if (linha.includes(' - Módulo ')) {
        totalQuestoes++;
        
        // Extrair o número do módulo
        const match = linha.match(/Módulo (\d+):/);
        if (match) {
            const numeroModulo = parseInt(match[1]);
            if (numeroModulo >= 1 && numeroModulo <= 7) {
                modulos[`Módulo ${numeroModulo}`]++;
            }
        }
    }
});

// Exibir resultados
console.log('📊 CONTAGEM DE QUESTÕES POR MÓDULO');
console.log('=====================================\n');

Object.keys(modulos).forEach(modulo => {
    console.log(`${modulo}: ${modulos[modulo]} questões`);
});

console.log(`\n📋 TOTAL: ${totalQuestoes} questões`);

// Verificar se bate com o resumo do arquivo
const resumoMatch = conteudo.match(/Módulo 1.*?(\d+).*?Módulo 2.*?(\d+).*?Módulo 3.*?(\d+).*?Módulo 4.*?(\d+).*?Módulo 5.*?(\d+).*?Módulo 6.*?(\d+).*?Módulo 7.*?(\d+)/s);

if (resumoMatch) {
    console.log('\n📖 VERIFICAÇÃO COM O RESUMO DO ARQUIVO:');
    console.log('========================================');
    console.log(`Módulo 1: ${resumoMatch[1]} questões`);
    console.log(`Módulo 2: ${resumoMatch[2]} questões`);
    console.log(`Módulo 3: ${resumoMatch[3]} questões`);
    console.log(`Módulo 4: ${resumoMatch[4]} questões`);
    console.log(`Módulo 5: ${resumoMatch[5]} questões`);
    console.log(`Módulo 6: ${resumoMatch[6]} questões`);
    console.log(`Módulo 7: ${resumoMatch[7]} questões`);
} 