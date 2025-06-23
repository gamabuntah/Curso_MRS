#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 CORREÇÃO FINAL E PRECISA DE ASPAS - AVALIAÇÃO FINAL');

const arquivoPath = 'public/data/browser/questoes-otimizadas/avaliacaoFinal.js';

try {
  // Ler o arquivo
  let conteudo = fs.readFileSync(arquivoPath, 'utf8');
  
  console.log('📄 Arquivo lido com sucesso');
  
  // Fazer backup
  fs.writeFileSync(arquivoPath + '.backup-final', conteudo);
  console.log('💾 Backup final criado');
  
  let conteudoCorrigido = conteudo;
  
  // Correções específicas apenas para aspas duplas DENTRO de strings
  // Não mexer na estrutura JSON (chaves e valores)
  
  const correcoes = [
    // Aspas duplas dentro de feedback text
    {
      de: '"É esse nível de detalhe que vai permitir ao IBGE e ao Brasil todo ter um diagnóstico preciso de como a gente tá lidando com o nosso lixo, separar o que é feito de forma adequada do que é inadequado, sabe? Só com esse retrato fiel da realidade é que dá para planejar e melhorar"',
      para: "'É esse nível de detalhe que vai permitir ao IBGE e ao Brasil todo ter um diagnóstico preciso de como a gente tá lidando com o nosso lixo, separar o que é feito de forma adequada do que é inadequado, sabe? Só com esse retrato fiel da realidade é que dá para planejar e melhorar'"
    },
    
    // Aspas duplas em pergunta
    {
      de: '"ambientalmente adequada" e a "inadequada"',
      para: "'ambientalmente adequada' e a 'inadequada'"
    },
    
    // Aspas duplas em feedback
    {
      de: '"para a PNSB, o prestador do serviço de SPE é aquele que faz a coleta e ou recebimento e também obrigatoriamente tem que fazer o processamento e ou a destinação final"',
      para: "'para a PNSB, o prestador do serviço de SPE é aquele que faz a coleta e ou recebimento e também obrigatoriamente tem que fazer o processamento e ou a destinação final'"
    }
  ];
  
  // Aplicar correções
  let totalCorrecoes = 0;
  
  correcoes.forEach((correcao, index) => {
    const regex = new RegExp(escapeRegex(correcao.de), 'g');
    const matches = conteudoCorrigido.match(regex);
    if (matches) {
      conteudoCorrigido = conteudoCorrigido.replace(regex, correcao.para);
      totalCorrecoes += matches.length;
      console.log(`✅ Correção ${index + 1}: ${matches.length} ocorrência(s)`);
    }
  });
  
  // Salvar arquivo corrigido
  fs.writeFileSync(arquivoPath, conteudoCorrigido);
  
  console.log(`🎉 CORREÇÃO CONCLUÍDA!`);
  console.log(`📊 Total de correções aplicadas: ${totalCorrecoes}`);
  
  // Testar sintaxe
  console.log('🧪 Testando sintaxe JavaScript...');
  
  try {
    // Simular o que o Node.js faria para validar
    const vm = require('vm');
    const context = { window: {} };
    vm.createContext(context);
    vm.runInContext(conteudoCorrigido, context);
    console.log('✅ Sintaxe JavaScript válida!');
  } catch (syntaxError) {
    console.error('❌ Erro de sintaxe:', syntaxError.message);
  }
  
} catch (error) {
  console.error('❌ Erro geral:', error.message);
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
} 