const fs = require('fs');

// Ler o arquivo
const conteudo = fs.readFileSync('MRS/Questoes_Av_Final.md', 'utf8');
const linhas = conteudo.split('\n');

// Extrair todas as questões com seus textos completos
const questoes = [];
let questaoAtual = null;
let textoQuestao = '';

for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    
    // Verificar se é início de nova questão
    if (linha.match(/^\d+\.\s/) || linha.match(/^Questão \d+:/)) {
        // Salvar questão anterior se existir
        if (questaoAtual) {
            questoes.push({
                numero: questaoAtual.numero,
                linha: questaoAtual.linha,
                texto: textoQuestao.trim(),
                textoLimpo: extrairTextoLimpo(textoQuestao)
            });
        }
        
        // Iniciar nova questão
        const numero = linha.match(/^(\d+)\./) ? linha.match(/^(\d+)\./)[1] : 
                      linha.match(/^Questão (\d+):/) ? linha.match(/^Questão (\d+):/)[1] : '?';
        
        questaoAtual = { numero: numero, linha: i + 1 };
        textoQuestao = linha;
    } else if (questaoAtual && linha) {
        // Continuar acumulando texto da questão atual
        textoQuestao += ' ' + linha;
    }
}

// Adicionar última questão
if (questaoAtual) {
    questoes.push({
        numero: questaoAtual.numero,
        linha: questaoAtual.linha,
        texto: textoQuestao.trim(),
        textoLimpo: extrairTextoLimpo(textoQuestao)
    });
}

function extrairTextoLimpo(texto) {
    // Remove numeração e alternativas, mantém apenas o enunciado
    return texto
        .replace(/^\d+\.\s*/, '')
        .replace(/^Questão \d+:\s*/, '')
        .replace(/\s*[a-d]\)\s.*$/s, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Verificar duplicatas
const duplicatas = [];
const similares = [];

for (let i = 0; i < questoes.length; i++) {
    for (let j = i + 1; j < questoes.length; j++) {
        const q1 = questoes[i];
        const q2 = questoes[j];
        
        // Verificar se são idênticas
        if (q1.textoLimpo === q2.textoLimpo && q1.textoLimpo.length > 20) {
            duplicatas.push({
                questao1: { numero: q1.numero, linha: q1.linha },
                questao2: { numero: q2.numero, linha: q2.linha },
                texto: q1.textoLimpo,
                tipo: 'IDÊNTICA'
            });
        }
        // Verificar similaridade
        else if (q1.textoLimpo.length > 20 && q2.textoLimpo.length > 20) {
            const similaridade = calcularSimilaridade(q1.textoLimpo, q2.textoLimpo);
            if (similaridade > 0.85) {
                similares.push({
                    questao1: { numero: q1.numero, linha: q1.linha, texto: q1.textoLimpo },
                    questao2: { numero: q2.numero, linha: q2.linha, texto: q2.textoLimpo },
                    similaridade: similaridade,
                    tipo: 'SIMILAR'
                });
            }
        }
    }
}

function calcularSimilaridade(texto1, texto2) {
    const palavras1 = texto1.toLowerCase().split(/\s+/);
    const palavras2 = texto2.toLowerCase().split(/\s+/);
    
    const palavrasComuns = palavras1.filter(palavra => palavras2.includes(palavra));
    const totalPalavras = Math.max(palavras1.length, palavras2.length);
    
    return palavrasComuns.length / totalPalavras;
}

// Exibir resultados
console.log(`📊 ANÁLISE COMPLETA DO ARQUIVO Questoes_Av_Final.md`);
console.log(`Total de questões encontradas: ${questoes.length}\n`);

if (duplicatas.length === 0 && similares.length === 0) {
    console.log('✅ Nenhuma questão duplicada ou muito similar foi encontrada!');
} else {
    if (duplicatas.length > 0) {
        console.log('🚨 QUESTÕES IDÊNTICAS ENCONTRADAS:');
        duplicatas.forEach((dup, index) => {
            console.log(`\n${index + 1}. Questões ${dup.questao1.numero} (linha ${dup.questao1.linha}) e ${dup.questao2.numero} (linha ${dup.questao2.linha}):`);
            console.log(`   Texto: "${dup.texto.substring(0, 100)}..."`);
        });
    }
    
    if (similares.length > 0) {
        console.log('\n⚠️ QUESTÕES MUITO SIMILARES ENCONTRADAS:');
        similares.forEach((sim, index) => {
            console.log(`\n${index + 1}. Questões ${sim.questao1.numero} (linha ${sim.questao1.linha}) e ${sim.questao2.numero} (linha ${sim.questao2.linha}) - ${Math.round(sim.similaridade * 100)}% similar:`);
            console.log(`   Questão ${sim.questao1.numero}: "${sim.questao1.texto.substring(0, 80)}..."`);
            console.log(`   Questão ${sim.questao2.numero}: "${sim.questao2.texto.substring(0, 80)}..."`);
        });
    }
}

// Estatísticas
console.log('\n📈 ESTATÍSTICAS FINAIS:');
console.log(`- Total de questões: ${questoes.length}`);
console.log(`- Questões idênticas: ${duplicatas.length}`);
console.log(`- Questões muito similares: ${similares.length}`);
console.log(`- Total de problemas encontrados: ${duplicatas.length + similares.length}`);

// Mostrar distribuição por módulos
const modulos = {};
questoes.forEach(q => {
    const modulo = q.linha < 200 ? 'Módulo 1' :
                   q.linha < 300 ? 'Módulo 2' :
                   q.linha < 400 ? 'Módulo 3' :
                   q.linha < 500 ? 'Módulo 4' :
                   q.linha < 600 ? 'Módulo 5' :
                   q.linha < 700 ? 'Módulo 6' : 'Módulo 7';
    
    modulos[modulo] = (modulos[modulo] || 0) + 1;
});

console.log('\n📚 DISTRIBUIÇÃO POR MÓDULOS:');
Object.entries(modulos).forEach(([modulo, quantidade]) => {
    console.log(`- ${modulo}: ${quantidade} questões`);
});

// Salvar relatório detalhado
const relatorio = {
    totalQuestoes: questoes.length,
    duplicatas: duplicatas,
    similares: similares,
    distribuicaoModulos: modulos,
    todasQuestoes: questoes.map(q => ({
        numero: q.numero,
        linha: q.linha,
        texto: q.textoLimpo
    }))
};

fs.writeFileSync('relatorio_final_questoes.json', JSON.stringify(relatorio, null, 2));
console.log('\n📄 Relatório detalhado salvo em: relatorio_final_questoes.json'); 