const fs = require('fs');

// Função para extrair o texto da questão (sem numeração e alternativas)
function extrairTextoQuestao(texto) {
    // Remove numeração no início
    texto = texto.replace(/^\d+\.\s*/, '');
    
    // Remove a parte das alternativas (a partir de "a)" ou "A)")
    texto = texto.replace(/\s*[a-d]\)\s.*$/s, '');
    
    // Remove quebras de linha e espaços extras
    texto = texto.replace(/\s+/g, ' ').trim();
    
    return texto;
}

// Função para verificar similaridade entre textos
function calcularSimilaridade(texto1, texto2) {
    const palavras1 = texto1.toLowerCase().split(/\s+/);
    const palavras2 = texto2.toLowerCase().split(/\s+/);
    
    const palavrasComuns = palavras1.filter(palavra => palavras2.includes(palavra));
    const totalPalavras = Math.max(palavras1.length, palavras2.length);
    
    return palavrasComuns.length / totalPalavras;
}

// Ler o arquivo
const conteudo = fs.readFileSync('MRS/Questoes_Av_Final.md', 'utf8');

// Extrair todas as questões
const linhas = conteudo.split('\n');
const questoes = [];
let questaoAtual = '';
let numeroQuestao = 0;

for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    
    // Verificar se é início de uma nova questão (padrão: número + ponto + texto)
    if (/^\d+\.\s/.test(linha)) {
        if (questaoAtual) {
            questoes.push({
                numero: numeroQuestao,
                texto: extrairTextoQuestao(questaoAtual),
                linhaOriginal: questaoAtual
            });
        }
        numeroQuestao++;
        questaoAtual = linha;
    } else if (questaoAtual && linha) {
        // Continuar acumulando a questão atual
        questaoAtual += ' ' + linha;
    }
}

// Adicionar a última questão
if (questaoAtual) {
    questoes.push({
        numero: numeroQuestao,
        texto: extrairTextoQuestao(questaoAtual),
        linhaOriginal: questaoAtual
    });
}

console.log(`Total de questões encontradas: ${questoes.length}\n`);

// Verificar duplicatas
const duplicatas = [];
const similares = [];

for (let i = 0; i < questoes.length; i++) {
    for (let j = i + 1; j < questoes.length; j++) {
        const questao1 = questoes[i];
        const questao2 = questoes[j];
        
        // Verificar se são idênticas
        if (questao1.texto === questao2.texto) {
            duplicatas.push({
                questao1: questao1.numero,
                questao2: questao2.numero,
                texto: questao1.texto,
                tipo: 'IDÊNTICA'
            });
        }
        // Verificar se são muito similares (similaridade > 80%)
        else {
            const similaridade = calcularSimilaridade(questao1.texto, questao2.texto);
            if (similaridade > 0.8) {
                similares.push({
                    questao1: questao1.numero,
                    questao2: questao2.numero,
                    texto1: questao1.texto,
                    texto2: questao2.texto,
                    similaridade: similaridade,
                    tipo: 'SIMILAR'
                });
            }
        }
    }
}

// Exibir resultados
if (duplicatas.length === 0 && similares.length === 0) {
    console.log('✅ Nenhuma questão duplicada ou muito similar foi encontrada!');
} else {
    if (duplicatas.length > 0) {
        console.log('🚨 QUESTÕES IDÊNTICAS ENCONTRADAS:');
        duplicatas.forEach((dup, index) => {
            console.log(`\n${index + 1}. Questões ${dup.questao1} e ${dup.questao2}:`);
            console.log(`   Texto: "${dup.texto}"`);
        });
    }
    
    if (similares.length > 0) {
        console.log('\n⚠️ QUESTÕES MUITO SIMILARES ENCONTRADAS:');
        similares.forEach((sim, index) => {
            console.log(`\n${index + 1}. Questões ${sim.questao1} e ${sim.questao2} (${Math.round(sim.similaridade * 100)}% similar):`);
            console.log(`   Questão ${sim.questao1}: "${sim.texto1}"`);
            console.log(`   Questão ${sim.questao2}: "${sim.texto2}"`);
        });
    }
}

// Estatísticas
console.log('\n📊 ESTATÍSTICAS:');
console.log(`- Total de questões: ${questoes.length}`);
console.log(`- Questões idênticas: ${duplicatas.length}`);
console.log(`- Questões muito similares: ${similares.length}`);
console.log(`- Total de problemas encontrados: ${duplicatas.length + similares.length}`);

// Salvar relatório detalhado
const relatorio = {
    totalQuestoes: questoes.length,
    duplicatas: duplicatas,
    similares: similares,
    todasQuestoes: questoes.map(q => ({
        numero: q.numero,
        texto: q.texto
    }))
};

fs.writeFileSync('relatorio_questoes_repetidas.json', JSON.stringify(relatorio, null, 2));
console.log('\n📄 Relatório detalhado salvo em: relatorio_questoes_repetidas.json'); 