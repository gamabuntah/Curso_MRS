#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 CORREÇÃO AUTOMÁTICA DE ASPAS - AVALIAÇÃO FINAL');

const arquivoPath = 'public/data/browser/questoes-otimizadas/avaliacaoFinal.js';

try {
  // Ler o arquivo
  let conteudo = fs.readFileSync(arquivoPath, 'utf8');
  
  console.log('📄 Arquivo lido com sucesso');
  
  // Fazer backup
  fs.writeFileSync(arquivoPath + '.backup-auto', conteudo);
  console.log('💾 Backup criado');
  
  // Correções específicas e precisas
  let conteudoCorrigido = conteudo;
  
  // Lista de correções específicas baseadas nos erros identificados
  const correcoes = [
    // Linha 42 - feedback com aspas duplas
    {
      buscar: '"É esse nível de detalhe que vai permitir ao IBGE e ao Brasil todo ter um diagnóstico preciso de como a gente tá lidando com o nosso lixo, separar o que é feito de forma adequada do que é inadequado, sabe? Só com esse retrato fiel da realidade é que dá para planejar e melhorar"',
      substituir: "'É esse nível de detalhe que vai permitir ao IBGE e ao Brasil todo ter um diagnóstico preciso de como a gente tá lidando com o nosso lixo, separar o que é feito de forma adequada do que é inadequado, sabe? Só com esse retrato fiel da realidade é que dá para planejar e melhorar'"
    },
    
    // Linha 87 - pergunta com aspas duplas
    {
      buscar: 'A PNSB faz uma distinção crucial entre a destinação final "ambientalmente adequada" e a "inadequada"',
      substituir: "A PNSB faz uma distinção crucial entre a destinação final 'ambientalmente adequada' e a 'inadequada'"
    },
    
    // Linha 122 - feedback com aspas duplas
    {
      buscar: '"para a PNSB, o prestador do serviço de SPE é aquele que faz a coleta e ou recebimento e também obrigatoriamente tem que fazer o processamento e ou a destinação final"',
      substituir: "'para a PNSB, o prestador do serviço de SPE é aquele que faz a coleta e ou recebimento e também obrigatoriamente tem que fazer o processamento e ou a destinação final'"
    },
    
    // Outras correções gerais
    {
      buscar: '"não"',
      substituir: "'não'"
    },
    
    {
      buscar: '"sim"',
      substituir: "'sim'"
    },
    
    {
      buscar: '"Lixões"',
      substituir: "'Lixões'"
    },
    
    {
      buscar: '"Aterros sanitários"',
      substituir: "'Aterros sanitários'"
    }
  ];
  
  // Aplicar correções
  let corrigidasCount = 0;
  correcoes.forEach((correcao, index) => {
    if (conteudoCorrigido.includes(correcao.buscar)) {
      conteudoCorrigido = conteudoCorrigido.replace(new RegExp(escapeRegex(correcao.buscar), 'g'), correcao.substituir);
      corrigidasCount++;
      console.log(`✅ Correção ${index + 1} aplicada`);
    }
  });
  
  // Correção geral para aspas duplas isoladas em valores
  // Padrão: ": "palavra"," -> ": 'palavra',"
  conteudoCorrigido = conteudoCorrigido.replace(/": "([^"]*)"([,\s])/g, ": '$1'$2");
  
  // Salvar arquivo corrigido
  fs.writeFileSync(arquivoPath, conteudoCorrigido);
  
  console.log(`🎉 CORREÇÃO CONCLUÍDA!`);
  console.log(`📊 Total de correções aplicadas: ${corrigidasCount}`);
  
  // Testar sintaxe
  console.log('🧪 Testando sintaxe JavaScript...');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
} 