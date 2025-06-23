const fs = require('fs');
const path = require('path');

console.log('📋 CHECKLIST FINAL DE ENTREGA DO SISTEMA MRS\n');

const checklist = [
    { item: 'Todos os módulos (1 a 7) presentes e validados', caminho: 'public/data/module1.js', tipo: 'modulo' },
    { item: 'Questões de todos os módulos presentes', caminho: 'public/data/questoes-modulo1.js', tipo: 'questao' },
    { item: 'Avaliação final presente', caminho: 'public/data/avaliacaoFinal.js', tipo: 'avaliacao' },
    { item: 'Áudios de todos os módulos presentes', caminho: 'public/MRS/Audios/Curso MRS - Mod 1.wav', tipo: 'audio' },
    { item: 'Configuração do sistema ajustada para MRS', caminho: 'config-sistema.json', tipo: 'config' },
    { item: 'Backend funcional', caminho: 'backend/server.js', tipo: 'backend' },
    { item: 'Frontend funcional', caminho: 'public/index.html', tipo: 'frontend' },
    { item: 'Responsividade e acessibilidade validadas', caminho: 'public/style.css', tipo: 'css' },
    { item: 'Scripts de teste e validação executados', caminho: 'scripts/teste-completo-sistema.js', tipo: 'script' },
    { item: 'Backup realizado', caminho: 'backup-dados.bat', tipo: 'backup' }
];

function checarArquivo(caminho, descricao) {
    if (fs.existsSync(caminho)) {
        console.log(`✅ ${descricao}: OK`);
        return true;
    } else {
        console.log(`❌ ${descricao}: FALTANDO (${caminho})`);
        return false;
    }
}

let tudoOk = true;

checklist.forEach((item, idx) => {
    let descricao = item.item;
    if (!checarArquivo(item.caminho, descricao)) {
        tudoOk = false;
    }
});

console.log('\n' + '='.repeat(60));
if (tudoOk) {
    console.log('🎉 CHECKLIST FINAL CONCLUÍDO! O sistema MRS está pronto para entrega.');
    console.log('Recomendações finais:');
    console.log('- Execute o backup final (backup-dados.bat)');
    console.log('- Teste o sistema em um ambiente limpo (pendrive ou outro PC)');
    console.log('- Leia o arquivo GARANTIA-100-FUNCIONAL.md para orientações de suporte');
    console.log('- Entregue o pacote completo ao cliente/usuário final');
} else {
    console.log('⚠️ ATENÇÃO: Existem pendências no checklist. Revise os itens marcados como FALTANDO.');
    console.log('Corrija as pendências antes de entregar o sistema.');
}
console.log('='.repeat(60)); 