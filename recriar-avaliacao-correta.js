#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 RECRIANDO ARQUIVO AVALIAÇÃO FINAL COM ESTRUTURA CORRETA');

// Ler o arquivo original (backup)
const arquivoOriginal = 'public/data/browser/questoes-otimizadas/avaliacaoFinal.js.backup-original';
const arquivoDestino = 'public/data/browser/questoes-otimizadas/avaliacaoFinal.js';

try {
  let conteudo = fs.readFileSync(arquivoOriginal, 'utf8');
  console.log('📄 Arquivo original lido');
  
  // Aplicar correções sistemáticas
  let conteudoCorrigido = conteudo;
  
  // Padrão 1: Corrigir aspas duplas aninhadas em feedback
  conteudoCorrigido = conteudoCorrigido.replace(
    /"feedback": "([^"]*)"([^"]*)"([^"]*)"/g,
    '"feedback": "$1\'$2\'$3"'
  );
  
  // Padrão 2: Corrigir aspas duplas aninhadas em pergunta
  conteudoCorrigido = conteudoCorrigido.replace(
    /"pergunta": "([^"]*)"([^"]*)"([^"]*)"/g,
    '"pergunta": "$1\'$2\'$3"'
  );
  
  // Padrão 3: Corrigir aspas duplas aninhadas em texto
  conteudoCorrigido = conteudoCorrigido.replace(
    /"texto": "([^"]*)"([^"]*)"([^"]*)"/g,
    '"texto": "$1\'$2\'$3"'
  );
  
  // Correções específicas conhecidas
  const correcoes = [
    {
      buscar: '"É esse nível de detalhe que vai permitir ao IBGE e ao Brasil todo ter um diagnóstico preciso de como a gente tá lidando com o nosso lixo, separar o que é feito de forma adequada do que é inadequado, sabe? Só com esse retrato fiel da realidade é que dá para planejar e melhorar"',
      trocar: "'É esse nível de detalhe que vai permitir ao IBGE e ao Brasil todo ter um diagnóstico preciso de como a gente tá lidando com o nosso lixo, separar o que é feito de forma adequada do que é inadequado, sabe? Só com esse retrato fiel da realidade é que dá para planejar e melhorar'"
    },
    {
      buscar: '"para a PNSB, o prestador do serviço de SPE é aquele que faz a coleta e ou recebimento e também obrigatoriamente tem que fazer o processamento e ou a destinação final"',
      trocar: "'para a PNSB, o prestador do serviço de SPE é aquele que faz a coleta e ou recebimento e também obrigatoriamente tem que fazer o processamento e ou a destinação final'"
    },
    {
      buscar: '"ambientalmente adequada" e a "inadequada"',
      trocar: "'ambientalmente adequada' e a 'inadequada'"
    }
  ];
  
  correcoes.forEach(correcao => {
    conteudoCorrigido = conteudoCorrigido.replace(new RegExp(escapeRegex(correcao.buscar), 'g'), correcao.trocar);
  });
  
  // Salvar arquivo corrigido
  fs.writeFileSync(arquivoDestino, conteudoCorrigido);
  console.log('💾 Arquivo corrigido salvo');
  
  // Testar sintaxe
  const { execSync } = require('child_process');
  try {
    execSync(`node -c "${arquivoDestino}"`, { stdio: 'pipe' });
    console.log('✅ SINTAXE JAVASCRIPT VÁLIDA!');
    
    // Testar carregamento
    global.window = {};
    delete require.cache[require.resolve('./' + arquivoDestino)];
    require('./' + arquivoDestino);
    
    if (global.window.avaliacaoFinal && global.window.avaliacaoFinal.questoes) {
      console.log(`📊 ${global.window.avaliacaoFinal.questoes.length} questões carregadas!`);
      console.log('🎉 ARQUIVO AVALIACAOFINAL.JS ESTÁ FUNCIONANDO!');
    } else {
      console.log('⚠️ Arquivo carregado mas estrutura não encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro de sintaxe ainda presente:', error.message);
    console.log('📄 Tentando abordagem linha por linha...');
    
    // Se ainda há erro, vamos tentar uma correção mais agressiva
    let linhas = conteudoCorrigido.split('\n');
    let linhasLimpas = [];
    
    linhas.forEach((linha, index) => {
      // Remover aspas duplas aninhadas de forma mais agressiva
      if (linha.includes('"feedback"') || linha.includes('"pergunta"') || linha.includes('"texto"')) {
        // Contar aspas duplas na linha
        let aspas = (linha.match(/"/g) || []).length;
        if (aspas > 4) { // Se há mais de 2 pares de aspas, há problema
          // Substituir aspas internas por aspas simples
          let partes = linha.split('"');
          if (partes.length > 4) {
            // Manter primeiras e últimas aspas, trocar internas
            for (let i = 2; i < partes.length - 2; i++) {
              if (i % 2 === 0 && partes[i].length > 0) {
                linha = linha.replace('"' + partes[i] + '"', "'" + partes[i] + "'");
              }
            }
          }
        }
      }
      linhasLimpas.push(linha);
    });
    
    let conteudoFinal = linhasLimpas.join('\n');
    fs.writeFileSync(arquivoDestino, conteudoFinal);
    console.log('🔄 Tentativa de correção agressiva aplicada');
  }
  
} catch (error) {
  console.error('❌ Erro:', error.message);
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
} 