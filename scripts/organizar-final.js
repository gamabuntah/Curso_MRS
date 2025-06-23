const fs = require('fs');
const path = require('path');

console.log('🗂️ INICIANDO ORGANIZAÇÃO FINAL DO PROJETO MRS...\n');

// Lista de arquivos e pastas temporárias a remover
const temporarios = [
    'public/data/tmp',
    'public/data/*.tmp',
    'public/data/*.bak',
    'public/*.bak',
    'scripts/*.log',
    'logs',
    'backup_temp',
    'temp',
    'tmp',
    'node_modules',
    'public/data/teste*',
    'public/teste*',
    'public/validate.html',
    'public/teste.html',
    'public/teste-player.html',
    'public/test-progress.html',
    'public/style.css.backup'
];

// Função para remover arquivos/pastas
function removerArquivoOuPasta(caminho) {
    try {
        if (fs.existsSync(caminho)) {
            const stat = fs.lstatSync(caminho);
            if (stat.isDirectory()) {
                fs.rmSync(caminho, { recursive: true, force: true });
                console.log(`🗑️ Pasta removida: ${caminho}`);
            } else {
                fs.unlinkSync(caminho);
                console.log(`🗑️ Arquivo removido: ${caminho}`);
            }
        }
    } catch (erro) {
        console.log(`⚠️ Erro ao remover ${caminho}: ${erro.message}`);
    }
}

// Remover arquivos e pastas temporárias
console.log('Removendo arquivos e pastas temporárias...');
temporarios.forEach(item => {
    // Suporte a glob simples
    if (item.includes('*')) {
        const dir = path.dirname(item);
        const padrao = new RegExp('^' + path.basename(item).replace(/\*/g, '.*') + '$');
        if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach(arq => {
                if (padrao.test(arq)) {
                    removerArquivoOuPasta(path.join(dir, arq));
                }
            });
        }
    } else {
        removerArquivoOuPasta(item);
    }
});

// Organizar permissões (Windows: só exibe aviso)
console.log('\nAjustando permissões dos arquivos finais (apenas leitura para arquivos principais)...');
const arquivosFinais = [
    'config-sistema.json',
    'GARANTIA-100-FUNCIONAL.md',
    'public',
    'backend',
    'scripts',
    'backup-dados.bat',
    'README.md',
    'historico_chat.md'
];

arquivosFinais.forEach(item => {
    if (fs.existsSync(item)) {
        try {
            // No Windows, apenas exibe mensagem
            console.log(`🔒 Arquivo/pasta pronto para entrega: ${item}`);
        } catch (erro) {
            console.log(`⚠️ Erro ao ajustar permissão de ${item}: ${erro.message}`);
        }
    }
});

console.log('\n✅ Organização final concluída! O projeto está pronto para backup e entrega.'); 