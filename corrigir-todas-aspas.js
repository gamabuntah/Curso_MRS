#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 CORRIGINDO TODAS AS ASPAS NO ARQUIVO DE AVALIAÇÃO FINAL...');

const arquivoPath = 'public/data/browser/questoes-otimizadas/avaliacaoFinal.js';

try {
  // Ler o arquivo
  let conteudo = fs.readFileSync(arquivoPath, 'utf8');
  
  console.log('📄 Arquivo lido com sucesso');
  
  // Fazer backup se não existir
  if (!fs.existsSync(arquivoPath + '.backup-original')) {
    fs.writeFileSync(arquivoPath + '.backup-original', conteudo);
    console.log('💾 Backup original criado');
  }
  
  // Padrão para encontrar strings JSON com aspas duplas problemáticas
  // Procurar padrões como: "key": "texto com "aspas duplas" no meio"
  
  let conteudoCorrigido = conteudo;
  
  // Método mais direto: usar regex para encontrar e corrigir
  // Substitui aspas duplas por aspas simples em valores de propriedades JSON
  conteudoCorrigido = conteudoCorrigido.replace(
    /("(?:feedback|texto|pergunta)":\s*")([^"]*"[^"]*"[^"]*")"/g,
    function(match, inicio, meio, fim) {
      // Substituir aspas duplas internas por aspas simples
      const meioCorrigido = meio.replace(/"/g, "'");
      return inicio + meioCorrigido + '"';
    }
  );
  
  // Padrão mais específico para capturar strings com múltiplas aspas
  conteudoCorrigido = conteudoCorrigido.replace(
    /("(?:feedback|texto|pergunta)":\s*"[^"]*)(")/g,
    function(match, antes, aspaDupla) {
      // Se encontrar aspas duplas no meio da string, trocar por aspas simples
      if (antes.includes('"')) {
        return antes.replace(/"/g, "'") + '"';
      }
      return match;
    }
  );
  
  // Regex mais abrangente para corrigir problemas de aspas em strings JSON
  // Encontra: "propriedade": "valor com "aspas" internas"
  conteudoCorrigido = conteudoCorrigido.replace(
    /("(?:feedback|texto|pergunta)":\s*")([^"]*(?:"[^"]*")+[^"]*?)"/g,
    function(match, propriedade, conteudoString) {
      // Substituir todas as aspas duplas internas por aspas simples
      const conteudoCorrigido = conteudoString.replace(/"/g, "'");
      return propriedade + conteudoCorrigido + '"';
    }
  );
  
  // Salvar o arquivo corrigido
  fs.writeFileSync(arquivoPath, conteudoCorrigido);
  
  console.log('✅ Arquivo corrigido com sucesso!');
  
  // Testar se o arquivo está válido
  const { exec } = require('child_process');
  exec(`node -c "${arquivoPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Ainda há erros de sintaxe:', error.message);
      console.log('📁 Backup disponível em: ' + arquivoPath + '.backup-original');
    } else {
      console.log('✅ Arquivo JavaScript válido!');
      console.log('🎉 Todas as aspas corrigidas com sucesso!');
    }
  });
  
} catch (error) {
  console.error('❌ Erro ao corrigir arquivo:', error.message);
  process.exit(1);
} 