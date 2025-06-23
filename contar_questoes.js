// Script para contar questões de cada módulo
const fs = require('fs');
const path = require('path');

function contarQuestoes(arquivo) {
    try {
        if (!fs.existsSync(arquivo)) {
            console.log(`Arquivo não encontrado: ${arquivo}`);
            return 0;
        }
        const conteudo = fs.readFileSync(arquivo, 'utf8');
        const matches = conteudo.match(/answer:/g);
        return matches ? matches.length : 0;
    } catch (error) {
        console.error(`Erro ao ler ${arquivo}:`, error.message);
        return 0;
    }
}

const modulos = [
    'public/data/module1.js',
    'public/data/module2.js', 
    'public/data/module3.js',
    'public/data/module4.js',
    'public/data/module5.js',
    'public/data/module6.js',
    'public/data/module7.js',
    'public/data/module8.js'
];

console.log('=== CONTAGEM DE QUESTÕES POR MÓDULO ===\n');

let total = 0;
modulos.forEach((modulo, index) => {
    const count = contarQuestoes(modulo);
    total += count;
    console.log(`Módulo ${index + 1}: ${count} questões`);
});

console.log(`\nTotal: ${total} questões`);

// Verificar avaliação final
const avaliacaoFinal = contarQuestoes('public/data/avaliacaoFinal.js');
console.log(`Avaliação Final: ${avaliacaoFinal} questões`);

// Função para contar questões e verificar numeração
function contarQuestoes() {
    try {
        console.log('📊 Analisando questões no arquivo...');
        
        // Ler o arquivo
        const arquivo = 'MRS/Questoes_Av_Final_Padronizadas_COMPLETO_LIMPO.md';
        const conteudo = fs.readFileSync(arquivo, 'utf8');
        const linhas = conteudo.split('\n');
        
        const questoesEncontradas = [];
        const numerosEncontrados = [];
        
        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i].trim();
            
            // Verificar se é início de questão
            if (linha.match(/^## Questão \d+/)) {
                const match = linha.match(/^## Questão (\d+)/);
                if (match) {
                    const numero = parseInt(match[1]);
                    questoesEncontradas.push({
                        numero: numero,
                        linha: i + 1,
                        titulo: linha
                    });
                    numerosEncontrados.push(numero);
                }
            }
        }
        
        // Ordenar por número
        questoesEncontradas.sort((a, b) => a.numero - b.numero);
        numerosEncontrados.sort((a, b) => a - b);
        
        console.log(`\n📈 RESULTADO DA ANÁLISE:`);
        console.log(`Total de questões encontradas: ${questoesEncontradas.length}`);
        console.log(`Menor número: ${Math.min(...numerosEncontrados)}`);
        console.log(`Maior número: ${Math.max(...numerosEncontrados)}`);
        
        // Verificar numeração sequencial
        const numerosEsperados = [];
        for (let i = 1; i <= Math.max(...numerosEncontrados); i++) {
            numerosEsperados.push(i);
        }
        
        const numerosFaltando = numerosEsperados.filter(num => !numerosEncontrados.includes(num));
        const numerosExtras = numerosEncontrados.filter(num => num > questoesEncontradas.length);
        
        console.log(`\n🔍 VERIFICAÇÃO DE NUMERAÇÃO:`);
        if (numerosFaltando.length > 0) {
            console.log(`❌ Números faltando: ${numerosFaltando.join(', ')}`);
        } else {
            console.log(`✅ Nenhum número faltando na sequência`);
        }
        
        if (numerosExtras.length > 0) {
            console.log(`⚠️ Números extras/duplicados: ${numerosExtras.join(', ')}`);
        }
        
        console.log(`\n📋 LISTA DE QUESTÕES ENCONTRADAS:`);
        questoesEncontradas.forEach(questao => {
            console.log(`Questão ${questao.numero} (linha ${questao.linha})`);
        });
        
        // Verificar se há duplicatas
        const duplicatas = numerosEncontrados.filter((num, index) => numerosEncontrados.indexOf(num) !== index);
        if (duplicatas.length > 0) {
            console.log(`\n⚠️ DUPLICATAS ENCONTRADAS: ${[...new Set(duplicatas)].join(', ')}`);
        }
        
        return {
            total: questoesEncontradas.length,
            questoes: questoesEncontradas,
            numerosFaltando: numerosFaltando,
            duplicatas: [...new Set(duplicatas)]
        };
        
    } catch (error) {
        console.error('❌ Erro ao analisar questões:', error.message);
        return null;
    }
}

// Executar análise
const resultado = contarQuestoes();

if (resultado) {
    console.log(`\n📊 RESUMO FINAL:`);
    console.log(`Total de questões: ${resultado.total}`);
    console.log(`Números faltando: ${resultado.numerosFaltando.length > 0 ? resultado.numerosFaltando.join(', ') : 'Nenhum'}`);
    console.log(`Duplicatas: ${resultado.duplicatas.length > 0 ? resultado.duplicatas.join(', ') : 'Nenhuma'}`);
} 