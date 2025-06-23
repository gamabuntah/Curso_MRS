#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// CONFIGURE SEU USUÁRIO GITHUB AQUI:
const GITHUB_USER = 'SEU-USUARIO'; // ← ALTERE AQUI
const REPO_NAME = 'curso-mrs-certificacao';

const modulosPath = 'public/data/browser/questoes-otimizadas';

const modulos = [
  { arquivo: 'module1.js', num: 1 },
  { arquivo: 'module2.js', num: 2 },
  { arquivo: 'module3.js', num: 3 },
  { arquivo: 'module4.js', num: 4 },
  { arquivo: 'module5.js', num: 5 },
  { arquivo: 'module6.js', num: 6 },
  { arquivo: 'module7.js', num: 7 }
];

console.log('🔧 CONFIGURANDO URLs DOS ÁUDIOS PARA O GITHUB...');
console.log(`👤 Usuário GitHub: ${GITHUB_USER}`);
console.log(`📦 Repositório: ${REPO_NAME}`);
console.log('');

modulos.forEach(({ arquivo, num }) => {
  const caminhoArquivo = path.join(modulosPath, arquivo);
  
  if (fs.existsSync(caminhoArquivo)) {
    let conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
    
    // Substitui a URL do áudio
    const urlAntiga = new RegExp(`"audio": "https://raw\\.githubusercontent\\.com/[^/]+/${REPO_NAME}/main/public/MRS/Audios/Curso%20MRS%20-%20Mod%20${num}\\.mp3"`, 'g');
    const urlNova = `"audio": "https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/main/public/MRS/Audios/Curso%20MRS%20-%20Mod%20${num}.mp3"`;
    
    conteudo = conteudo.replace(urlAntiga, urlNova);
    
    fs.writeFileSync(caminhoArquivo, conteudo);
    console.log(`✅ ${arquivo} - Áudio configurado`);
  } else {
    console.log(`❌ ${arquivo} - Arquivo não encontrado`);
  }
});

console.log('');
console.log('🎉 CONFIGURAÇÃO CONCLUÍDA!');
console.log('');
console.log('📋 PRÓXIMOS PASSOS:');
console.log('1. Altere GITHUB_USER no topo deste arquivo');
console.log('2. Execute: node configurar-github-urls.js');
console.log('3. Faça commit e push para o GitHub');
console.log('4. Deploy no Render');
console.log('');
console.log('🎵 URLs dos áudios configuradas para:');
modulos.forEach(({ num }) => {
  console.log(`   Módulo ${num}: https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/main/public/MRS/Audios/Curso%20MRS%20-%20Mod%20${num}.mp3`);
}); 