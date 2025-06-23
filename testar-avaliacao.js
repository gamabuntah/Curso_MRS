#!/usr/bin/env node

console.log('🧪 TESTANDO ARQUIVO AVALIAÇÃO FINAL...');

try {
  // Simular ambiente browser
  global.window = {};
  
  // Carregar o arquivo
  require('./public/data/browser/questoes-otimizadas/avaliacaoFinal.js');
  
  // Verificar se foi carregado
  if (global.window.avaliacaoFinal) {
    console.log('✅ Arquivo carregado com sucesso!');
    console.log(`📊 Total de questões: ${global.window.avaliacaoFinal.questoes?.length || 0}`);
    console.log(`📝 Título: ${global.window.avaliacaoFinal.title || 'N/A'}`);
    
    // Verificar primeira questão
    const primeira = global.window.avaliacaoFinal.questoes?.[0];
    if (primeira) {
      console.log('✅ Primeira questão encontrada');
      console.log(`📋 Pergunta: ${primeira.pergunta?.substring(0, 50)}...`);
      console.log(`🔢 Alternativas: ${primeira.alternativas?.length || 0}`);
    }
    
    console.log('🎉 ARQUIVO ESTÁ FUNCIONANDO PERFEITAMENTE!');
  } else {
    console.log('❌ Arquivo não foi carregado corretamente');
  }
  
} catch (error) {
  console.error('❌ Erro ao carregar arquivo:', error.message);
  console.error('📍 Linha do erro:', error.stack?.split('\n')[1] || 'N/A');
} 