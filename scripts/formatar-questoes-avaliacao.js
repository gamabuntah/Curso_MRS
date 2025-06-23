const fs = require('fs');
const path = require('path');

// Caminho dos arquivos
const arquivoFonte = path.join(__dirname, '../MRS/Questoes_Av_FInal.md');
const arquivoDestino = path.join(__dirname, '../MRS/Questoes_Av_Final_FORMATADO.md');

// Função para limpar e normalizar texto
function limparTexto(texto) {
  return texto.replace(/\s+/g, ' ').trim();
}

// Função para extrair título da questão
function extrairTitulo(enunciado) {
  // Remove caracteres especiais e limita o tamanho
  let titulo = enunciado.replace(/[^\w\s]/g, '').substring(0, 60);
  if (titulo.length === 60) titulo += '...';
  return titulo;
}

// Função para formatar uma questão
function formatarQuestao(numero, conteudo) {
  const linhas = conteudo.split('\n');
  let enunciado = '';
  let alternativas = [];
  let respostaCorreta = '';
  let feedbacks = [];
  
  let estado = 'enunciado';
  
  for (let linha of linhas) {
    linha = linha.trim();
    if (!linha) continue;
    
    // Detectar alternativas
    if (linha.match(/^[a-d]\)/i)) {
      estado = 'alternativas';
      alternativas.push(linha);
    }
    // Detectar resposta correta
    else if (linha.match(/Resposta Correta:/i)) {
      estado = 'resposta';
      respostaCorreta = linha.match(/[a-d]/i)?.[0]?.toUpperCase() || '';
    }
    // Detectar feedbacks
    else if (linha.match(/Feedback.*[a-d]/i)) {
      estado = 'feedbacks';
      feedbacks.push(linha);
    }
    // Continuar enunciado
    else if (estado === 'enunciado') {
      enunciado += (enunciado ? ' ' : '') + linha;
    }
    // Continuar feedbacks
    else if (estado === 'feedbacks') {
      if (feedbacks.length > 0) {
        feedbacks[feedbacks.length - 1] += ' ' + linha;
      }
    }
  }
  
  // Extrair título do enunciado
  const titulo = extrairTitulo(enunciado);
  
  // Formatar questão
  let questaoFormatada = `---\n\n`;
  questaoFormatada += `## Questão ${numero}: ${titulo}\n\n`;
  questaoFormatada += `**Enunciado:** ${enunciado}\n\n`;
  questaoFormatada += `**Alternativas:**\n\n`;
  
  // Adicionar alternativas
  alternativas.forEach(alt => {
    questaoFormatada += `${alt}\n\n`;
  });
  
  questaoFormatada += `**Resposta Correta:** ${respostaCorreta}\n\n`;
  questaoFormatada += `**Feedbacks:**\n\n`;
  
  // Adicionar feedbacks
  feedbacks.forEach(feedback => {
    questaoFormatada += `${feedback}\n\n`;
  });
  
  questaoFormatada += `---\n`;
  
  return questaoFormatada;
}

// Função principal
function formatarQuestoes() {
  try {
    console.log('🔄 Iniciando formatação das questões...');
    
    const conteudo = fs.readFileSync(arquivoFonte, 'utf8');
    const linhas = conteudo.split('\n');
    
    let resultado = '';
    let numeroQuestao = 1;
    let moduloAtual = '';
    let questaoAtual = '';
    let questoesProcessadas = 0;
    
    // Adicionar cabeçalho
    resultado += `# Questões de Avaliação Final - PNSB 2024\n\n`;
    resultado += `Este arquivo contém 50 questões de alta qualidade sobre a Pesquisa Nacional de Saneamento Básico (PNSB) 2024, organizadas por módulos.\n\n`;
    resultado += `## Índice\n\n`;
    resultado += `- **Módulo 1**: Fundamentos do Saneamento Básico e a PNSB (7 questões)\n`;
    resultado += `- **Módulo 2**: Estrutura do Questionário (7 questões)\n`;
    resultado += `- **Módulo 3**: Limpeza Urbana e Manejo de Resíduos Sólidos (8 questões)\n`;
    resultado += `- **Módulo 4**: MRS em Áreas Especiais e Coleta Seletiva (7 questões)\n`;
    resultado += `- **Módulo 5**: Manejo de Resíduos Sólidos Especiais (7 questões)\n`;
    resultado += `- **Módulo 6**: Unidades de Destinação/Disposição Final (7 questões)\n`;
    resultado += `- **Módulo 7**: Entidades de Catadores, Veículos e Educação Ambiental (7 questões)\n\n`;
    resultado += `---\n\n`;
    
    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i].trim();
      
      // Detectar cabeçalhos de módulos
      if (linha.includes('Módulo') && linha.includes(':')) {
        if (moduloAtual) {
          resultado += `\n---\n\n`;
        }
        moduloAtual = linha;
        resultado += `# ${linha}\n\n`;
        continue;
      }
      
      // Detectar início de questão
      if (linha.match(/^[0-9]+\.|^Questão [0-9]+:/)) {
        // Processar questão anterior se existir
        if (questaoAtual) {
          resultado += formatarQuestao(numeroQuestao, questaoAtual);
          numeroQuestao++;
          questoesProcessadas++;
        }
        
        // Iniciar nova questão
        questaoAtual = linha + '\n';
        continue;
      }
      
      // Acumular conteúdo da questão
      if (questaoAtual) {
        questaoAtual += linha + '\n';
      }
    }
    
    // Processar última questão
    if (questaoAtual) {
      resultado += formatarQuestao(numeroQuestao, questaoAtual);
      questoesProcessadas++;
    }
    
    // Adicionar rodapé
    resultado += `\n---\n\n`;
    resultado += `## Resumo\n\n`;
    resultado += `✅ **Total de questões processadas:** ${questoesProcessadas}\n`;
    resultado += `✅ **Formatação aplicada:** Padrão markdown consistente\n`;
    resultado += `✅ **Numeração:** Sequencial de 1 a ${questoesProcessadas}\n`;
    resultado += `✅ **Separadores:** Visuais entre questões e módulos\n`;
    resultado += `✅ **Estrutura:** Enunciados, alternativas, feedbacks padronizados\n\n`;
    resultado += `*Arquivo formatado automaticamente para melhor legibilidade e organização.*\n`;
    
    // Salvar arquivo formatado
    fs.writeFileSync(arquivoDestino, resultado, 'utf8');
    
    console.log(`✅ Formatação concluída com sucesso!`);
    console.log(`📊 Questões processadas: ${questoesProcessadas}`);
    console.log(`📁 Arquivo salvo: ${arquivoDestino}`);
    
    return questoesProcessadas;
    
  } catch (error) {
    console.error('❌ Erro durante a formatação:', error.message);
    return 0;
  }
}

// Executar formatação
if (require.main === module) {
  const totalQuestoes = formatarQuestoes();
  if (totalQuestoes > 0) {
    console.log(`🎉 Formatação concluída! ${totalQuestoes} questões foram processadas.`);
  } else {
    console.log('❌ Nenhuma questão foi processada. Verifique o arquivo fonte.');
  }
}

module.exports = { formatarQuestoes }; 