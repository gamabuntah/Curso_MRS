// Script para embaralhar as alternativas e corrigir a estrutura dos quizzes
const fs = require('fs');
const path = require('path');

const arquivosModulos = [
  'module1.js', 'module2.js', 'module3.js', 'module4.js',
  'module5.js', 'module6.js', 'module7.js', 'module8.js'
];

const pasta = './public/data/';

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function embaralharQuiz(quiz) {
  if (!quiz || !quiz.questions) return quiz;
  quiz.questions = quiz.questions.map(q => {
    if (!q.options || q.options.length < 2) return q;
    const alternativas = shuffleArray(q.options);
    return { ...q, options: alternativas };
  });
  return quiz;
}

arquivosModulos.forEach(arquivo => {
  const caminho = path.join(pasta, arquivo);
  let conteudo = fs.readFileSync(caminho, 'utf8');

  try {
    const inicio = conteudo.indexOf('{');
    const fim = conteudo.lastIndexOf('}');
    const objetoTexto = conteudo.substring(inicio, fim + 1);
    const modData = eval('(' + objetoTexto + ')');

    let modId;
    let modContent;

    // Detecta se a estrutura já é { "id": { ... } } ou { title: "..." }
    if (Object.keys(modData).length === 1 && !isNaN(Object.keys(modData)[0])) {
      modId = Object.keys(modData)[0];
      modContent = modData[modId];
    } else {
      const match = (modData.title || '').match(/M[oó]dulo\s*(\d+)/i);
      if (match) {
        modId = match[1];
        modContent = modData;
      } else {
         // Fallback para o nome do arquivo se o título não tiver o número
        modId = arquivo.match(/module(\d+)\.js/)[1];
        modContent = modData;
      }
    }
    
    // Embaralha o quiz se existir
    if (modContent.quiz) {
      modContent.quiz = embaralharQuiz(modContent.quiz);
    }
    
    // Reconstrói o arquivo com a estrutura correta de atribuição
    const novoConteudo = `window.modulos_data = window.modulos_data || {};
Object.assign(window.modulos_data, ${JSON.stringify({ [modId]: modContent }, null, 2)});`;

    fs.writeFileSync(caminho, novoConteudo, 'utf8');
    console.log(`✅ Estrutura corrigida e quiz embaralhado em: ${arquivo}`);

  } catch (error) {
    console.error(`❌ Erro ao processar o arquivo ${arquivo}:`, error);
  }
});

console.log('🎲 Todos os quizzes dos módulos foram corrigidos e embaralhados!'); 