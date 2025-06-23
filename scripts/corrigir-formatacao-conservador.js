const fs = require('fs');
const path = require('path');

// Caminho dos arquivos
const arquivoFonte = path.join(__dirname, '../MRS/Questões Av Final');
const arquivoDestino = path.join(__dirname, '../MRS/Questoes_Av_Final_CORRIGIDO.md');

function corrigirFormatacaoConservador() {
  try {
    const conteudo = fs.readFileSync(arquivoFonte, 'utf8');
    
    // Aplicar correções conservadoras
    let conteudoCorrigido = conteudo;
    
    // 1. Corrigir numeração das questões (apenas onde está claramente errado)
    let numeroQuestao = 1;
    conteudoCorrigido = conteudoCorrigido.replace(/## Questão (\d+)/g, (match, numero) => {
      return `## Questão ${numeroQuestao++}`;
    });
    
    // 2. Remover duplicações de "**Enunciado:**"
    conteudoCorrigido = conteudoCorrigido.replace(/\*\*Enunciado:\*\*\s*\*\*Enunciado:\*\*/g, '**Enunciado:**');
    
    // 3. Limpar símbolos estranhos apenas onde não afetam o conteúdo
    conteudoCorrigido = conteudoCorrigido.replace(/[•◦▪]/g, '');
    
    // 4. Garantir separadores consistentes
    conteudoCorrigido = conteudoCorrigido.replace(/\n{3,}/g, '\n\n---\n\n');
    
    // 5. Corrigir feedbacks mal formatados (apenas os óbvios)
    conteudoCorrigido = conteudoCorrigido.replace(/Feedback A:/g, 'Feedback:');
    conteudoCorrigido = conteudoCorrigido.replace(/Feedback B:/g, 'Feedback:');
    conteudoCorrigido = conteudoCorrigido.replace(/Feedback C:/g, 'Feedback:');
    conteudoCorrigido = conteudoCorrigido.replace(/Feedback D:/g, 'Feedback:');
    
    // 6. Garantir que alternativas tenham formato consistente
    conteudoCorrigido = conteudoCorrigido.replace(/^([A-D])\)\s*/gm, '$1) ');
    
    // Salvar arquivo corrigido
    fs.writeFileSync(arquivoDestino, conteudoCorrigido, 'utf8');
    
    console.log('✅ Correção conservadora concluída!');
    console.log(`📁 Arquivo salvo em: ${arquivoDestino}`);
    console.log('⚠️  Verifique o arquivo antes de substituir o original!');
    
  } catch (error) {
    console.error('❌ Erro na correção:', error.message);
  }
}

corrigirFormatacaoConservador(); 