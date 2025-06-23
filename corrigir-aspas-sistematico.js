#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 CORREÇÃO SISTEMÁTICA DE ASPAS MISTAS');

const arquivoPath = 'public/data/browser/questoes-otimizadas/avaliacaoFinal.js';

try {
  let conteudo = fs.readFileSync(arquivoPath, 'utf8');
  console.log('📄 Arquivo lido');
  
  // Backup
  fs.writeFileSync(arquivoPath + '.backup-sistematico', conteudo);
  console.log('💾 Backup criado');
  
  let conteudoCorrigido = conteudo;
  let totalCorrecoes = 0;
  
  // Padrões de correção sistemática
  const padroes = [
    // Padrão 1: "propriedade': 'valor" -> "propriedade": "valor"
    {
      buscar: /"(\w+)': '/g,
      trocar: '"$1": "',
      descricao: 'Propriedade com aspas mistas'
    },
    
    // Padrão 2: "valor' -> "valor"
    {
      buscar: /"([^"]*?)'/g,
      trocar: '"$1"',
      descricao: 'Strings com aspas mistas no final'
    },
    
    // Padrão 3: 'valor", -> "valor",
    {
      buscar: /'([^']*?)",/g,
      trocar: '"$1",',
      descricao: 'Strings com aspas mistas no início'
    },
    
    // Padrão 4: Corrigir aspas simples no meio de strings JSON
    {
      buscar: /"([^"]*)'([^"]*?)"/g,
      trocar: '"$1\'$2"',
      descricao: 'Aspas simples no meio de strings'
    }
  ];
  
  console.log('🔄 Aplicando correções...');
  
  padroes.forEach((padrao, index) => {
    const matches = conteudoCorrigido.match(padrao.buscar);
    if (matches) {
      conteudoCorrigido = conteudoCorrigido.replace(padrao.buscar, padrao.trocar);
      totalCorrecoes += matches.length;
      console.log(`✅ Padrão ${index + 1}: ${matches.length} correções (${padrao.descricao})`);
    }
  });
  
  // Correções específicas adicionais
  console.log('🎯 Aplicando correções específicas...');
  
  // Corrigir casos específicos conhecidos
  const correcoesEspecificas = [
    { de: '"texto\': \'', para: '"texto": "' },
    { de: '"feedback\': \'', para: '"feedback": "' },
    { de: '"pergunta\': \'', para: '"pergunta": "' },
    { de: '"correta\': ', para: '"correta": ' },
    { de: '\'alternativas":', para: '"alternativas":' },
    { de: '\'questoes":', para: '"questoes":' }
  ];
  
  let correcoesEspecificasAplicadas = 0;
  correcoesEspecificas.forEach(correcao => {
    const antes = conteudoCorrigido;
    conteudoCorrigido = conteudoCorrigido.replace(new RegExp(escapeRegex(correcao.de), 'g'), correcao.para);
    if (antes !== conteudoCorrigido) {
      correcoesEspecificasAplicadas++;
    }
  });
  
  console.log(`✅ Correções específicas: ${correcoesEspecificasAplicadas}`);
  
  // Salvar arquivo
  fs.writeFileSync(arquivoPath, conteudoCorrigido);
  
  console.log(`📊 Total de correções: ${totalCorrecoes + correcoesEspecificasAplicadas}`);
  
  // Testar resultado
  console.log('🧪 Testando resultado...');
  
  const { execSync } = require('child_process');
  try {
    execSync(`node -c "${arquivoPath}"`, { stdio: 'pipe' });
    console.log('🎉 SINTAXE JAVASCRIPT VÁLIDA!');
    
    // Teste de carregamento
    global.window = {};
    delete require.cache[require.resolve('./' + arquivoPath)];
    require('./' + arquivoPath);
    
    if (global.window.avaliacaoFinal) {
      console.log(`📋 Questões carregadas: ${global.window.avaliacaoFinal.questoes?.length || 0}`);
      console.log('🚀 ARQUIVO TOTALMENTE FUNCIONAL!');
    }
    
  } catch (error) {
    console.log('❌ Ainda há problemas:');
    const errorMsg = error.stderr ? error.stderr.toString() : error.message;
    
    // Extrair linha do erro
    const linhaMatch = errorMsg.match(/js:(\d+)/);
    if (linhaMatch) {
      const linhaErro = parseInt(linhaMatch[1]);
      console.log(`🔍 Linha com problema: ${linhaErro}`);
      
      const linhas = conteudoCorrigido.split('\n');
      if (linhas[linhaErro - 1]) {
        console.log(`>>> ${linhas[linhaErro - 1].trim()}`);
      }
    }
  }
  
} catch (error) {
  console.error('❌ Erro:', error.message);
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
} 