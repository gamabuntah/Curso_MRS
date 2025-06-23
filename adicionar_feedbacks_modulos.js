const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'public', 'data');
const modulos = [3, 4, 5, 6, 7, 8];

modulos.forEach(num => {
  const file = path.join(baseDir, `module${num}.js`);
  let content = fs.readFileSync(file, 'utf8');

  // Extrai o objeto JS do arquivo
  const match = content.match(/Object\.assign\(window\.modulos_data, (\{[\s\S]*\})\);/);
  if (!match) {
    console.error(`Não foi possível extrair o objeto de ${file}`);
    return;
  }
  let objStr = match[1];

  // Avalia o objeto JS de forma segura
  let data;
  try {
    data = eval('(' + objStr + ')');
  } catch (e) {
    console.error(`Erro ao avaliar o objeto de ${file}:`, e);
    return;
  }

  // Adiciona feedback vazio se não existir
  const quiz = data[num]?.quiz;
  if (quiz && Array.isArray(quiz.questions)) {
    quiz.questions.forEach(q => {
      if (!('feedback' in q)) {
        q.feedback = "";
      }
    });
  }

  // Serializa de volta para string
  const newObjStr = JSON.stringify(data, null, 2);
  // Remonta o arquivo
  const newContent = content.replace(objStr, newObjStr);
  fs.writeFileSync(file, newContent, 'utf8');
  console.log(`Feedbacks adicionados (se faltavam) em ${file}`);
}); 