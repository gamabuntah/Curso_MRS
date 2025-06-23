#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const quizzesPath = 'logs/quizzes-modulos.json';
const dataDir = 'public/data';
const logPath = 'logs/integrar-quizzes-log.json';
const QUESTOES_ESPERADAS = 15;

if (!fs.existsSync(quizzesPath)) {
  console.error('❌ Arquivo de quizzes não encontrado:', quizzesPath);
  process.exit(1);
}

const quizzes = JSON.parse(fs.readFileSync(quizzesPath, 'utf8'));
const logResumo = [];

function gerarBackupIncremental(filePath) {
  let backupFile = filePath + '.backup';
  if (fs.existsSync(backupFile)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    backupFile = filePath + `.backup-${timestamp}`;
  }
  fs.copyFileSync(filePath, backupFile);
  return backupFile;
}

function parseObjetoModulo(conteudo, moduleId, moduleFile) {
  // Usar Function para parsing seguro
  const match = conteudo.match(/const module\d+ = (\{[\s\S]*?\});/);
  if (!match) {
    throw new Error(`Não foi possível localizar o objeto do módulo em ${moduleFile}`);
  }
  try {
    // Function é mais seguro que eval
    // eslint-disable-next-line no-new-func
    return (new Function('return ' + match[1]))();
  } catch (e) {
    throw new Error(`Erro ao interpretar o objeto do módulo em ${moduleFile}: ${e.message}`);
  }
}

let perdeuComentarios = false;

quizzes.forEach((modulo, idx) => {
  const moduleFile = path.join(dataDir, `module${modulo.id}.js`);
  if (!fs.existsSync(moduleFile)) {
    logResumo.push({ modulo: modulo.id, status: 'arquivo não encontrado', file: moduleFile });
    return;
  }

  // Backup incremental
  const backupFile = gerarBackupIncremental(moduleFile);

  // Carregar JS como texto
  let conteudo = fs.readFileSync(moduleFile, 'utf8');
  let moduloObj;
  try {
    moduloObj = parseObjetoModulo(conteudo, modulo.id, moduleFile);
  } catch (e) {
    logResumo.push({ modulo: modulo.id, status: 'erro parsing', erro: e.message, file: moduleFile });
    return;
  }

  // Substituir quiz.questoes
  if (!moduloObj.quiz) moduloObj.quiz = {};
  moduloObj.quiz.questoes = modulo.questoes;

  // Validação do número de questões
  let avisoQuestoes = null;
  if (!modulo.questoes || modulo.questoes.length !== QUESTOES_ESPERADAS) {
    avisoQuestoes = `Número de questões diferente do esperado (${modulo.questoes?.length || 0} de ${QUESTOES_ESPERADAS})`;
  }

  // Gerar novo conteúdo
  const novoConteudo = conteudo.replace(
    /const module\d+ = (\{[\s\S]*?\});/,
    `const module${modulo.id} = ${JSON.stringify(moduloObj, null, 2)};`
  );

  // Aviso sobre perda de comentários/formatacao
  if (!perdeuComentarios && conteudo.match(/\/\//) || conteudo.match(/\/\*/)) {
    perdeuComentarios = true;
    logResumo.push({ aviso: 'Comentários e formatação original podem ter sido perdidos nos arquivos atualizados.' });
  }

  // Tenta escrever e faz rollback em caso de erro
  try {
    fs.writeFileSync(moduleFile, novoConteudo, 'utf8');
    logResumo.push({ modulo: modulo.id, status: 'quiz integrado', file: moduleFile, backup: backupFile, questoes: modulo.questoes?.length || 0, avisoQuestoes });
  } catch (e) {
    // Rollback
    fs.copyFileSync(backupFile, moduleFile);
    logResumo.push({ modulo: modulo.id, status: 'erro escrita, rollback realizado', erro: e.message, file: moduleFile, backup: backupFile });
  }
});

// Log de resumo
console.log('\nResumo da integração dos quizzes:');
logResumo.forEach(item => {
  if (item.status === 'quiz integrado') {
    console.log(`✅ Módulo ${item.modulo}: quiz integrado (${item.questoes} questões) [${item.file}]`);
    if (item.avisoQuestoes) console.log(`   ⚠️ ${item.avisoQuestoes}`);
  } else if (item.status === 'arquivo não encontrado') {
    console.log(`⚠️ Módulo ${item.modulo}: arquivo não encontrado (${item.file})`);
  } else if (item.status === 'erro parsing') {
    console.log(`❌ Módulo ${item.modulo}: erro ao interpretar objeto (${item.erro})`);
  } else if (item.status === 'erro escrita, rollback realizado') {
    console.log(`❌ Módulo ${item.modulo}: erro na escrita (${item.erro}), rollback realizado.`);
  } else if (item.aviso) {
    console.log(`⚠️ ${item.aviso}`);
  }
});

// Salvar log detalhado
try {
  if (!fs.existsSync('logs')) fs.mkdirSync('logs');
  fs.writeFileSync(logPath, JSON.stringify(logResumo, null, 2), 'utf8');
  console.log(`\n📄 Log detalhado salvo em ${logPath}`);
} catch (e) {
  console.log('⚠️  Não foi possível salvar o log detalhado:', e.message);
}

console.log('\nProcesso concluído. Backups criados com extensão .backup ou .backup-<timestamp>.'); 