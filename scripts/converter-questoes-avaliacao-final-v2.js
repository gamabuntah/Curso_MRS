const fs = require('fs');
const path = require('path');

function converterQuestoes() {
  try {
    const arquivoFonte = path.join(__dirname, '../MRS/Questões Av Final');
    const conteudo = fs.readFileSync(arquivoFonte, 'utf8');
    
    const questoes = [];
    const linhas = conteudo.split('\n');
    
    let questaoAtual = null;
    let alternativas = [];
    let dentroDeQuestao = false;
    let numeroQuestao = 0;
    
    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i].trim();
      
      // Detectar diferentes formatos de início de questão
      if ((/^\d+\./.test(linha) && linha.length > 10) || 
          (/^Questão \d+:/.test(linha)) ||
          (/^Questão:/.test(linha))) {
        
        // Salvar questão anterior se existir
        if (questaoAtual && alternativas.length > 0) {
          questoes.push({
            pergunta: questaoAtual,
            alternativas: alternativas
          });
          numeroQuestao++;
        }
        
        // Iniciar nova questão
        questaoAtual = linha.replace(/^\d+\.\s*/, '')
                           .replace(/^Questão \d+:\s*/, '')
                           .replace(/^Questão:\s*/, '');
        alternativas = [];
        dentroDeQuestao = true;
        continue;
      }
      
      // Detectar alternativas (a), b), c), d) ou A), B), C), D))
      if (dentroDeQuestao && /^[a-dA-D]\)/.test(linha)) {
        const letra = linha.charAt(0).toUpperCase();
        const texto = linha.substring(2).trim();
        
        // Procurar feedback correspondente
        let feedback = '';
        let correta = false;
        
        // Procurar por "Resposta Correta:" ou feedback específico
        for (let j = i + 1; j < Math.min(i + 50, linhas.length); j++) {
          const linhaFeedback = linhas[j].trim();
          
          if (linhaFeedback.includes('Resposta Correta:')) {
            const respostaCorreta = linhaFeedback.match(/Resposta Correta:\s*([a-dA-D])/);
            if (respostaCorreta) {
              correta = letra === respostaCorreta[1].toUpperCase();
            }
          }
          
          if (linhaFeedback.includes('Feedback') && linhaFeedback.includes(letra)) {
            feedback = linhaFeedback.replace(/.*Feedback.*:\s*/, '').trim();
            break;
          }
          
          if (linhaFeedback.includes('Alternativa Correta') && linhaFeedback.includes(`(${letra.toLowerCase()})`)) {
            correta = true;
          }
          
          if (linhaFeedback.includes('Alternativa Incorreta') && linhaFeedback.includes(`(${letra.toLowerCase()})`)) {
            correta = false;
          }
          
          // Se encontrou próxima alternativa, parar
          if (/^[a-dA-D]\)/.test(linhaFeedback) && j > i + 1) {
            break;
          }
        }
        
        // Se não encontrou feedback específico, criar um genérico
        if (!feedback) {
          feedback = correta ? 
            "Correto! Esta é a resposta adequada para a questão." : 
            "Incorreto. Revise o conteúdo do módulo para entender melhor o conceito.";
        }
        
        alternativas.push({
          texto: texto,
          correta: correta,
          feedback: feedback
        });
      }
      
      // Detectar fim de questão (linha em branco ou nova seção)
      if (dentroDeQuestao && (linha === '' || linha.startsWith('Questões') || linha.startsWith('---'))) {
        dentroDeQuestao = false;
      }
    }
    
    // Adicionar última questão
    if (questaoAtual && alternativas.length > 0) {
      questoes.push({
        pergunta: questaoAtual,
        alternativas: alternativas
      });
      numeroQuestao++;
    }
    
    console.log(`📊 Questões encontradas: ${questoes.length}`);
    
    // Criar o objeto final
    const avaliacaoFinal = {
      title: "Avaliação Final - Curso de Manejo de Resíduos Sólidos (MRS)",
      questoes: questoes
    };
    
    // Salvar no arquivo de destino
    const arquivoDestino = path.join(__dirname, '../public/data/browser/questoes-otimizadas/avaliacaoFinal.js');
    const conteudoJS = `window.avaliacaoFinal = ${JSON.stringify(avaliacaoFinal, null, 2)};`;
    
    fs.writeFileSync(arquivoDestino, conteudoJS, 'utf8');
    
    console.log(`✅ Conversão concluída! ${questoes.length} questões convertidas.`);
    console.log(`📁 Arquivo salvo em: ${arquivoDestino}`);
    
    // Mostrar algumas questões para verificação
    console.log('\n📋 Exemplos de questões convertidas:');
    for (let i = 0; i < Math.min(3, questoes.length); i++) {
      console.log(`\nQuestão ${i + 1}: ${questoes[i].pergunta.substring(0, 100)}...`);
      console.log(`Alternativas: ${questoes[i].alternativas.length}`);
      const corretas = questoes[i].alternativas.filter(a => a.correta).length;
      console.log(`Corretas: ${corretas}`);
    }
    
  } catch (error) {
    console.error('❌ Erro na conversão:', error.message);
  }
}

converterQuestoes(); 