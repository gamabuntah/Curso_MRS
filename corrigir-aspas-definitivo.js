#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 CORREÇÃO DEFINITIVA DE ASPAS - AVALIAÇÃO FINAL');

const arquivoPath = 'public/data/browser/questoes-otimizadas/avaliacaoFinal.js';

try {
  let conteudo = fs.readFileSync(arquivoPath, 'utf8');
  console.log('📄 Arquivo lido com sucesso');
  
  // Backup de segurança
  fs.writeFileSync(arquivoPath + '.backup-definitivo', conteudo);
  console.log('💾 Backup definitivo criado');
  
  // Aplicar correções linha por linha para maior precisão
  let linhas = conteudo.split('\n');
  let linhasCorrigidas = [];
  let totalCorrecoes = 0;
  
  for (let i = 0; i < linhas.length; i++) {
    let linha = linhas[i];
    let linhaOriginal = linha;
    
    // Corrigir aspas duplas específicas dentro de strings
    if (linha.includes('"feedback"') || linha.includes('"pergunta"') || linha.includes('"texto"')) {
      // Substituir aspas duplas por aspas simples dentro do conteúdo das strings
      // Padrão: "key": "valor com "aspas duplas" aqui"
      linha = linha.replace(/"([^"]*)"([^"]*)"([^"]*)"([^"]*)"([^"]*)"([^"]*)"([^"]*)"([^"]*)"([^"]*)"/g, '"$1\'$2\'$3\'$4\'$5\'$6\'$7\'$8\'$9"');
      linha = linha.replace(/"([^"]*)"([^"]*)"([^"]*)"([^"]*)"([^"]*)"([^"]*)"([^"]*)"/g, '"$1\'$2\'$3\'$4\'$5\'$6\'$7"');
      linha = linha.replace(/"([^"]*)"([^"]*)"([^"]*)"([^"]*)"([^"]*)"/g, '"$1\'$2\'$3\'$4\'$5"');
      linha = linha.replace(/"([^"]*)"([^"]*)"([^"]*)"/g, '"$1\'$2\'$3"');
    }
    
    // Correções específicas conhecidas
    linha = linha.replace(/É esse nível de detalhe que vai permitir ao IBGE e ao Brasil todo ter um diagnóstico preciso de como a gente tá lidando com o nosso lixo, separar o que é feito de forma adequada do que é inadequado, sabe\? Só com esse retrato fiel da realidade é que dá para planejar e melhorar/g, 
      "É esse nível de detalhe que vai permitir ao IBGE e ao Brasil todo ter um diagnóstico preciso de como a gente tá lidando com o nosso lixo, separar o que é feito de forma adequada do que é inadequado, sabe? Só com esse retrato fiel da realidade é que dá para planejar e melhorar");
    
    linha = linha.replace(/para a PNSB, o prestador do serviço de SPE é aquele que faz a coleta e ou recebimento e também obrigatoriamente tem que fazer o processamento e ou a destinação final/g, 
      "para a PNSB, o prestador do serviço de SPE é aquele que faz a coleta e ou recebimento e também obrigatoriamente tem que fazer o processamento e ou a destinação final");
    
    linha = linha.replace(/ambientalmente adequada.*?e a.*?inadequada/g, 
      "ambientalmente adequada' e a 'inadequada");
    
    if (linha !== linhaOriginal) {
      totalCorrecoes++;
    }
    
    linhasCorrigidas.push(linha);
  }
  
  // Reunir e salvar
  let conteudoCorrigido = linhasCorrigidas.join('\n');
  fs.writeFileSync(arquivoPath, conteudoCorrigido);
  
  console.log(`✅ Correção concluída! ${totalCorrecoes} linhas modificadas`);
  
  // Teste final de sintaxe
  console.log('🧪 Testando sintaxe final...');
  
  const { execSync } = require('child_process');
  try {
    execSync(`node -c "${arquivoPath}"`, { stdio: 'pipe' });
    console.log('🎉 SINTAXE JAVASCRIPT VÁLIDA!');
    
    // Teste de carregamento
    global.window = {};
    delete require.cache[require.resolve('./' + arquivoPath)];
    require('./' + arquivoPath);
    
    if (global.window.avaliacaoFinal && global.window.avaliacaoFinal.questoes) {
      console.log(`📊 ${global.window.avaliacaoFinal.questoes.length} questões carregadas com sucesso!`);
      console.log('🚀 ARQUIVO ESTÁ PRONTO PARA USO!');
    }
    
  } catch (syntaxError) {
    console.error('❌ Ainda há erro de sintaxe:', syntaxError.message);
  }
  
} catch (error) {
  console.error('❌ Erro:', error.message);
} 