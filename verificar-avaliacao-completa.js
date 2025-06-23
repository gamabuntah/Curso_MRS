#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 VERIFICAÇÃO COMPLETA - ARQUIVO AVALIAÇÃO FINAL');
console.log('='.repeat(60));

const arquivoPath = 'public/data/browser/questoes-otimizadas/avaliacaoFinal.js';

try {
  // 1. VERIFICAR SE O ARQUIVO EXISTE
  console.log('📄 1. VERIFICANDO EXISTÊNCIA DO ARQUIVO...');
  if (!fs.existsSync(arquivoPath)) {
    console.log('❌ Arquivo não encontrado!');
    process.exit(1);
  }
  console.log('✅ Arquivo encontrado');
  
  // 2. VERIFICAR TAMANHO DO ARQUIVO
  const stats = fs.statSync(arquivoPath);
  console.log(`📊 Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
  
  // 3. TESTAR SINTAXE JAVASCRIPT
  console.log('\n🧪 2. TESTANDO SINTAXE JAVASCRIPT...');
  try {
    execSync(`node -c "${arquivoPath}"`, { stdio: 'pipe' });
    console.log('✅ Sintaxe JavaScript válida');
  } catch (error) {
    console.log('❌ ERRO DE SINTAXE:');
    console.log(error.stderr.toString());
    
    // Tentar identificar linha problemática
    const errorMsg = error.stderr.toString();
    const linhaMatch = errorMsg.match(/js:(\d+)/);
    if (linhaMatch) {
      const linhaErro = parseInt(linhaMatch[1]);
      console.log(`\n🔍 LINHA PROBLEMÁTICA: ${linhaErro}`);
      
      const conteudo = fs.readFileSync(arquivoPath, 'utf8');
      const linhas = conteudo.split('\n');
      
      // Mostrar contexto da linha problemática
      const inicio = Math.max(0, linhaErro - 3);
      const fim = Math.min(linhas.length, linhaErro + 2);
      
      console.log('\nCONTEXTO:');
      for (let i = inicio; i < fim; i++) {
        const marca = i === linhaErro - 1 ? '>>> ' : '    ';
        console.log(`${marca}${i + 1}: ${linhas[i]}`);
      }
    }
    return;
  }
  
  // 4. TESTAR CARREGAMENTO DO ARQUIVO
  console.log('\n📥 3. TESTANDO CARREGAMENTO...');
  try {
    global.window = {};
    delete require.cache[require.resolve('./' + arquivoPath)];
    require('./' + arquivoPath);
    console.log('✅ Arquivo carregado com sucesso');
  } catch (error) {
    console.log('❌ ERRO NO CARREGAMENTO:');
    console.log(error.message);
    return;
  }
  
  // 5. VERIFICAR ESTRUTURA DE DADOS
  console.log('\n📋 4. VERIFICANDO ESTRUTURA DE DADOS...');
  
  if (!global.window.avaliacaoFinal) {
    console.log('❌ Objeto avaliacaoFinal não encontrado');
    return;
  }
  console.log('✅ Objeto avaliacaoFinal encontrado');
  
  const avaliacao = global.window.avaliacaoFinal;
  
  // Verificar propriedades principais
  const propriedadesEsperadas = ['title', 'descricao', 'configuracoes', 'questoes'];
  propriedadesEsperadas.forEach(prop => {
    if (avaliacao[prop] !== undefined) {
      console.log(`✅ ${prop}: OK`);
    } else {
      console.log(`❌ ${prop}: AUSENTE`);
    }
  });
  
  // 6. VERIFICAR QUESTÕES
  console.log('\n❓ 5. VERIFICANDO QUESTÕES...');
  
  if (!avaliacao.questoes || !Array.isArray(avaliacao.questoes)) {
    console.log('❌ Array de questões não encontrado');
    return;
  }
  
  const totalQuestoes = avaliacao.questoes.length;
  console.log(`📊 Total de questões: ${totalQuestoes}`);
  
  if (totalQuestoes === 0) {
    console.log('❌ Nenhuma questão encontrada');
    return;
  }
  
  // 7. VERIFICAR ESTRUTURA DAS QUESTÕES
  console.log('\n🔍 6. VERIFICANDO ESTRUTURA DAS QUESTÕES...');
  
  let questoesValidas = 0;
  let questoesComProblemas = 0;
  
  avaliacao.questoes.forEach((questao, index) => {
    const problemas = [];
    
    // Verificar propriedades obrigatórias
    if (!questao.pergunta) problemas.push('pergunta ausente');
    if (!questao.alternativas || !Array.isArray(questao.alternativas)) problemas.push('alternativas ausentes/inválidas');
    
    if (questao.alternativas && Array.isArray(questao.alternativas)) {
      if (questao.alternativas.length !== 4) problemas.push(`${questao.alternativas.length} alternativas (esperado: 4)`);
      
      // Verificar se tem uma alternativa correta
      const corretas = questao.alternativas.filter(alt => alt.correta === true);
      if (corretas.length !== 1) problemas.push(`${corretas.length} alternativas corretas (esperado: 1)`);
      
      // Verificar estrutura das alternativas
      questao.alternativas.forEach((alt, altIndex) => {
        if (!alt.texto) problemas.push(`alternativa ${altIndex + 1} sem texto`);
        if (alt.correta === undefined) problemas.push(`alternativa ${altIndex + 1} sem propriedade correta`);
        if (!alt.feedback) problemas.push(`alternativa ${altIndex + 1} sem feedback`);
      });
    }
    
    if (problemas.length === 0) {
      questoesValidas++;
    } else {
      questoesComProblemas++;
      if (questoesComProblemas <= 5) { // Mostrar apenas primeiros 5 problemas
        console.log(`❌ Questão ${index + 1}: ${problemas.join(', ')}`);
      }
    }
  });
  
  console.log(`\n📊 RESUMO DAS QUESTÕES:`);
  console.log(`✅ Questões válidas: ${questoesValidas}`);
  console.log(`❌ Questões com problemas: ${questoesComProblemas}`);
  
  // 8. VERIFICAR CONFIGURAÇÕES
  console.log('\n⚙️ 7. VERIFICANDO CONFIGURAÇÕES...');
  
  if (avaliacao.configuracoes) {
    console.log(`✅ Tempo limite: ${avaliacao.configuracoes.tempoLimite || 'N/A'} min`);
    console.log(`✅ Nota mínima: ${avaliacao.configuracoes.notaMinima || 'N/A'}%`);
    console.log(`✅ Total questões: ${avaliacao.configuracoes.totalQuestoes || 'N/A'}`);
    console.log(`✅ Embaralhamento: ${avaliacao.configuracoes.embaralhamento ? 'Sim' : 'Não'}`);
  }
  
  // 9. RESULTADO FINAL
  console.log('\n' + '='.repeat(60));
  console.log('🎯 RESULTADO FINAL:');
  
  if (questoesComProblemas === 0) {
    console.log('🎉 ARQUIVO TOTALMENTE CORRETO!');
    console.log(`✅ ${totalQuestoes} questões válidas`);
    console.log('✅ Sintaxe JavaScript perfeita');
    console.log('✅ Estrutura de dados completa');
    console.log('🚀 PRONTO PARA USO NO SISTEMA!');
  } else {
    console.log('⚠️ ARQUIVO COM ALGUNS PROBLEMAS');
    console.log(`❌ ${questoesComProblemas} questões precisam de correção`);
    console.log(`✅ ${questoesValidas} questões estão corretas`);
  }
  
} catch (error) {
  console.error('❌ ERRO GERAL:', error.message);
} 