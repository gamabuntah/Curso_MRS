const fs = require('fs');
const path = require('path');

// Função para converter as questões do arquivo fonte para o formato do sistema
function converterQuestoes() {
  try {
    // Ler o arquivo fonte
    const arquivoFonte = path.join(__dirname, '../MRS/Questões Av Final');
    const conteudo = fs.readFileSync(arquivoFonte, 'utf8');
    
    // Array para armazenar as questões convertidas
    const questoes = [];
    
    // Dividir o conteúdo em linhas
    const linhas = conteudo.split('\n');
    
    let questaoAtual = null;
    let alternativas = [];
    let dentroDeQuestao = false;
    
    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i].trim();
      
      // Detectar início de nova questão (números seguidos de ponto)
      if (/^\d+\./.test(linha) && linha.length > 10) {
        // Salvar questão anterior se existir
        if (questaoAtual && alternativas.length > 0) {
          questoes.push({
            pergunta: questaoAtual,
            alternativas: alternativas
          });
        }
        
        // Iniciar nova questão
        questaoAtual = linha.replace(/^\d+\.\s*/, '');
        alternativas = [];
        dentroDeQuestao = true;
        continue;
      }
      
      // Detectar alternativas (A), B), C), D))
      if (dentroDeQuestao && /^[A-D]\)/.test(linha)) {
        const letra = linha.charAt(0);
        const texto = linha.substring(2).trim();
        
        // Procurar feedback correspondente
        let feedback = '';
        for (let j = i + 1; j < linhas.length; j++) {
          const linhaFeedback = linhas[j].trim();
          if (linhaFeedback.includes('Feedback') && linhaFeedback.includes(letra)) {
            feedback = linhaFeedback.replace(/.*Feedback.*:\s*/, '').trim();
            break;
          }
          if (/^[A-D]\)/.test(linhaFeedback)) {
            break;
          }
        }
        
        // Determinar se é correta (geralmente a B é correta, mas vamos verificar o feedback)
        const correta = feedback.toLowerCase().includes('correto') || 
                       feedback.toLowerCase().includes('correta');
        
        alternativas.push({
          texto: texto,
          correta: correta,
          feedback: feedback
        });
      }
    }
    
    // Adicionar última questão
    if (questaoAtual && alternativas.length > 0) {
      questoes.push({
        pergunta: questaoAtual,
        alternativas: alternativas
      });
    }
    
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
    
  } catch (error) {
    console.error('❌ Erro na conversão:', error.message);
  }
}

// Executar a conversão
converterQuestoes(); 