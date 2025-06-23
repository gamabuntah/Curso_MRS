const fs = require('fs');
const path = require('path');

// Caminho dos arquivos
const arquivoFonte = path.join(__dirname, '../MRS/Questões Av Final');
const arquivoDestino = path.join(__dirname, '../MRS/Questoes_Av_Final_FORMATADO.md');

// Função utilitária para limpar e normalizar texto
function limparTexto(texto) {
  return texto.replace(/\s+/g, ' ').trim()
    .replace(/[•◦▪]/g, '') // Remove símbolos estranhos
    .replace(/^\s*[-–]\s*/, '') // Remove hífens no início
    .replace(/\s*[-–]\s*$/, ''); // Remove hífens no final
}

// Função para extrair alternativas e feedbacks de um bloco de texto
function extrairAlternativasEFeedbacks(linhas) {
  const alternativas = [];
  let alternativaAtual = null;
  let feedbackAtual = '';
  let dentroFeedback = false;

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    
    // Detectar início de alternativa (A), B), C), D))
    const matchAlternativa = linha.match(/^([A-D])\)[\s\-\.]*(.*)$/);
    if (matchAlternativa) {
      // Salvar alternativa anterior se existir
      if (alternativaAtual) {
        alternativas.push({
          letra: alternativaAtual.letra,
          texto: limparTexto(alternativaAtual.texto),
          feedback: limparTexto(feedbackAtual)
        });
      }
      
      // Iniciar nova alternativa
      alternativaAtual = {
        letra: matchAlternativa[1],
        texto: matchAlternativa[2]
      };
      feedbackAtual = '';
      dentroFeedback = false;
      continue;
    }

    // Detectar início de feedback
    if (linha.match(/^[-–]?\s*Feedback\s*:?/i) || 
        linha.match(/^Feedback\s+[A-D]/i) ||
        linha.match(/^Feedback\s+para\s+[A-D]/i)) {
      dentroFeedback = true;
      feedbackAtual = linha.replace(/^[-–]?\s*Feedback\s*:?/i, '')
                          .replace(/^Feedback\s+[A-D]\s*:?/i, '')
                          .replace(/^Feedback\s+para\s+[A-D]\s*:?/i, '')
                          .trim();
      continue;
    }

    // Continuar feedback se já estiver dentro de um
    if (dentroFeedback) {
      feedbackAtual += ' ' + linha;
      continue;
    }

    // Se não é alternativa nem feedback, é continuação do texto da alternativa
    if (alternativaAtual && !dentroFeedback) {
      alternativaAtual.texto += ' ' + linha;
    }
  }

  // Salvar última alternativa
  if (alternativaAtual) {
    alternativas.push({
      letra: alternativaAtual.letra,
      texto: limparTexto(alternativaAtual.texto),
      feedback: limparTexto(feedbackAtual)
    });
  }

  return alternativas;
}

// Função principal de processamento
function corrigirQuestoes() {
  const conteudo = fs.readFileSync(arquivoFonte, 'utf8');
  const linhas = conteudo.split(/\r?\n/);

  let resultado = '';
  let numeroQuestao = 1;
  let moduloAtual = '';
  let dentroQuestao = false;
  let blocoQuestao = [];
  let tituloModulo = '';

  function salvarQuestao(bloco) {
    if (bloco.length === 0) return;
    
    // Separar enunciado das alternativas
    let enunciado = '';
    let linhasAlternativas = [];
    let encontrouAlternativas = false;

    for (let i = 0; i < bloco.length; i++) {
      const linha = bloco[i].trim();
      
      // Detectar início de alternativas
      if (linha.match(/^[A-D]\)/) && !encontrouAlternativas) {
        encontrouAlternativas = true;
      }
      
      if (!encontrouAlternativas) {
        enunciado += (enunciado ? ' ' : '') + linha;
      } else {
        linhasAlternativas.push(linha);
      }
    }

    // Limpar enunciado
    enunciado = limparTexto(enunciado)
      .replace(/^\*\*Enunciado:\*\*\s*\*\*Enunciado:\*\*/, '**Enunciado:**')
      .replace(/^\*\*Enunciado:\*\*\s*/, '**Enunciado:** ');

    // Extrair alternativas e feedbacks
    const alternativas = extrairAlternativasEFeedbacks(linhasAlternativas);

    // Montar markdown
    resultado += `\n---\n\n## Questão ${numeroQuestao}\n${enunciado}\n\n`;
    
    alternativas.forEach(alt => {
      resultado += `${alt.letra}) ${alt.texto}\n  - Feedback: ${alt.feedback}\n\n`;
    });
    
    numeroQuestao++;
  }

  for (let i = 0; i < linhas.length; i++) {
    let linha = linhas[i].trim();
    
    // Detectar título de módulo
    if (linha.match(/^Questões de Alta Qualidade|^Questões sobre o Módulo|^Questões de Alta Qualidade - Módulo|^Questões de Alta Qualidade – Módulo|^Questões – Módulo|^Questões –/)) {
      tituloModulo = linha;
      resultado += `\n# ${linha}\n`;
      continue;
    }
    
    // Detectar início de questão
    if (linha.match(/^##? Questão ?\d+/) || 
        linha.match(/^\d+\./) || 
        linha.match(/^Questão ?\d+:/) || 
        linha.match(/^Questão:/)) {
      
      if (blocoQuestao.length > 0) {
        salvarQuestao(blocoQuestao);
        blocoQuestao = [];
      }
      
      dentroQuestao = true;
      const textoQuestao = linha.replace(/^##? Questão ?\d+[:\.]?/, '')
                               .replace(/^\d+\./, '')
                               .replace(/^Questão ?\d+:/, '')
                               .replace(/^Questão:/, '')
                               .trim();
      
      if (textoQuestao) {
        blocoQuestao.push(textoQuestao);
      }
      continue;
    }
    
    // Fim de bloco de questão
    if (linha === '' && dentroQuestao && blocoQuestao.length > 0) {
      salvarQuestao(blocoQuestao);
      blocoQuestao = [];
      dentroQuestao = false;
      continue;
    }
    
    if (dentroQuestao) {
      blocoQuestao.push(linha);
    }
  }
  
  // Salvar última questão
  if (blocoQuestao.length > 0) {
    salvarQuestao(blocoQuestao);
  }

  // Adicionar rodapé
  resultado += '\n---\n\n*Formatação concluída - Arquivo organizado com questões de alta qualidade*\n\n---\n';

  fs.writeFileSync(arquivoDestino, resultado, 'utf8');
  console.log('✅ Arquivo corrigido salvo em:', arquivoDestino);
  console.log(`📊 Total de questões processadas: ${numeroQuestao - 1}`);
}

corrigirQuestoes(); 