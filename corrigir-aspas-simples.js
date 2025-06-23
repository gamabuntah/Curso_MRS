#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 CORRIGINDO ASPAS NO ARQUIVO DE AVALIAÇÃO FINAL...');

const arquivoPath = 'public/data/browser/questoes-otimizadas/avaliacaoFinal.js';

try {
  // Ler o arquivo
  let conteudo = fs.readFileSync(arquivoPath, 'utf8');
  
  console.log('📄 Arquivo lido com sucesso');
  
  // Fazer backup
  fs.writeFileSync(arquivoPath + '.backup', conteudo);
  console.log('💾 Backup criado');
  
  // Corrigir aspas duplas dentro de strings de feedback
  // Método simples: substituir aspas duplas por aspas simples dentro de strings
  
  let linhas = conteudo.split('\n');
  let linhasCorrigidas = [];
  
  for (let i = 0; i < linhas.length; i++) {
    let linha = linhas[i];
    
    // Se a linha contém "feedback": "
    if (linha.includes('"feedback":')) {
      // Encontrar o início da string de feedback
      let inicioFeedback = linha.indexOf('"feedback": "') + 12;
      let fimFeedback = linha.lastIndexOf('"');
      
      if (inicioFeedback < fimFeedback) {
        // Extrair a parte do feedback
        let prefixo = linha.substring(0, inicioFeedback);
        let feedback = linha.substring(inicioFeedback, fimFeedback);
        let sufixo = linha.substring(fimFeedback);
        
        // Substituir aspas duplas por aspas simples no feedback
        feedback = feedback.replace(/"/g, "'");
        
        // Reconstruir a linha
        linha = prefixo + feedback + sufixo;
      }
    }
    
    // Se a linha contém "texto": "
    if (linha.includes('"texto":')) {
      // Encontrar o início da string de texto
      let inicioTexto = linha.indexOf('"texto": "') + 9;
      let fimTexto = linha.lastIndexOf('"');
      
      if (inicioTexto < fimTexto) {
        // Extrair a parte do texto
        let prefixo = linha.substring(0, inicioTexto);
        let texto = linha.substring(inicioTexto, fimTexto);
        let sufixo = linha.substring(fimTexto);
        
        // Substituir aspas duplas por aspas simples no texto
        texto = texto.replace(/"/g, "'");
        
        // Reconstruir a linha
        linha = prefixo + texto + sufixo;
      }
    }
    
    // Se a linha contém "pergunta": "
    if (linha.includes('"pergunta":')) {
      // Encontrar o início da string de pergunta
      let inicioPergunta = linha.indexOf('"pergunta": "') + 12;
      let fimPergunta = linha.lastIndexOf('"');
      
      if (inicioPergunta < fimPergunta) {
        // Extrair a parte da pergunta
        let prefixo = linha.substring(0, inicioPergunta);
        let pergunta = linha.substring(inicioPergunta, fimPergunta);
        let sufixo = linha.substring(fimPergunta);
        
        // Substituir aspas duplas por aspas simples na pergunta
        pergunta = pergunta.replace(/"/g, "'");
        
        // Reconstruir a linha
        linha = prefixo + pergunta + sufixo;
      }
    }
    
    linhasCorrigidas.push(linha);
  }
  
  // Juntar as linhas novamente
  let conteudoCorrigido = linhasCorrigidas.join('\n');
  
  // Salvar o arquivo corrigido
  fs.writeFileSync(arquivoPath, conteudoCorrigido);
  
  console.log('✅ Arquivo corrigido com sucesso!');
  console.log('📁 Backup salvo em: ' + arquivoPath + '.backup');
  
  // Testar se o arquivo está válido
  try {
    require('./' + arquivoPath);
    console.log('✅ Arquivo JavaScript válido!');
  } catch (error) {
    console.error('❌ Arquivo ainda tem erros:', error.message);
  }
  
} catch (error) {
  console.error('❌ Erro ao corrigir arquivo:', error.message);
  process.exit(1);
} 