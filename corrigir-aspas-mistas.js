#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 CORRIGINDO ASPAS MISTAS - AVALIAÇÃO FINAL');

const arquivoPath = 'public/data/browser/questoes-otimizadas/avaliacaoFinal.js';

try {
  let conteudo = fs.readFileSync(arquivoPath, 'utf8');
  console.log('📄 Arquivo lido');
  
  // Backup final
  fs.writeFileSync(arquivoPath + '.backup-mistas', conteudo);
  console.log('💾 Backup criado');
  
  // Corrigir aspas mistas linha por linha
  let linhas = conteudo.split('\n');
  let linhasCorrigidas = [];
  let totalCorrecoes = 0;
  
  for (let i = 0; i < linhas.length; i++) {
    let linha = linhas[i];
    let linhaOriginal = linha;
    
    // Corrigir padrões específicos problemáticos
    
    // 1. Corrigir "pergunta": "texto', -> "pergunta": "texto",
    linha = linha.replace(/"pergunta": "([^"]*)',/, '"pergunta": "$1",');
    
    // 2. Corrigir 'alternativas": [ -> "alternativas": [
    linha = linha.replace(/'alternativas": \[/, '"alternativas": [');
    
    // 3. Corrigir 'texto": "texto", -> "texto": "texto",
    linha = linha.replace(/'texto": "([^"]*)"/, '"texto": "$1"');
    
    // 4. Corrigir 'correta": false, -> "correta": false,
    linha = linha.replace(/'correta": (true|false),/, '"correta": $1,');
    
    // 5. Corrigir 'pergunta": "texto", -> "pergunta": "texto",
    linha = linha.replace(/'pergunta": "([^"]*)"/, '"pergunta": "$1"');
    
    // 6. Corrigir "feedback": "texto' -> "feedback": "texto"
    linha = linha.replace(/"feedback": "([^"]*)'/, '"feedback": "$1"');
    
    // 7. Corrigir aspas simples no meio de strings
    if (linha.includes('"feedback"') || linha.includes('"pergunta"') || linha.includes('"texto"')) {
      // Se há aspas duplas no meio de uma string JSON, trocar por aspas simples
      linha = linha.replace(/"([^"]*)"([^"]*)"([^"]*)"/g, function(match, p1, p2, p3) {
        if (p2.length > 0) {
          return '"' + p1 + "'" + p2 + "'" + p3 + '"';
        }
        return match;
      });
    }
    
    if (linha !== linhaOriginal) {
      totalCorrecoes++;
      console.log(`✅ Linha ${i + 1} corrigida`);
    }
    
    linhasCorrigidas.push(linha);
  }
  
  // Salvar arquivo corrigido
  let conteudoCorrigido = linhasCorrigidas.join('\n');
  fs.writeFileSync(arquivoPath, conteudoCorrigido);
  
  console.log(`📊 Total de linhas corrigidas: ${totalCorrecoes}`);
  
  // Testar sintaxe
  const { execSync } = require('child_process');
  try {
    execSync(`node -c "${arquivoPath}"`, { stdio: 'ignore' });
    console.log('🎉 SINTAXE JAVASCRIPT VÁLIDA!');
    
    // Testar carregamento
    global.window = {};
    delete require.cache[require.resolve('./' + arquivoPath)];
    require('./' + arquivoPath);
    
    if (global.window.avaliacaoFinal && global.window.avaliacaoFinal.questoes) {
      console.log(`📋 ${global.window.avaliacaoFinal.questoes.length} questões carregadas com sucesso!`);
      console.log('🚀 ARQUIVO TOTALMENTE FUNCIONAL!');
    }
    
  } catch (error) {
    console.error('❌ Ainda há problemas:', error.message.split('\n')[0]);
  }
  
} catch (error) {
  console.error('❌ Erro:', error.message);
} 