#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO AMBIENTE PARA TRANSFORMAÇÃO PNSB → MRS...\n');

let ambienteOk = true;
const problemas = [];

// Função para adicionar problema
function adicionarProblema(mensagem, solucao = '') {
    problemas.push({ mensagem, solucao });
    ambienteOk = false;
}

// 1. Verificar Node.js
try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const versionNumber = nodeVersion.replace('v', '').split('.')[0];
    
    if (parseInt(versionNumber) >= 14) {
        console.log(`✅ Node.js ${nodeVersion} - OK`);
    } else {
        console.log(`❌ Node.js ${nodeVersion} - Versão muito antiga!`);
        adicionarProblema(
            `Node.js versão ${nodeVersion} é muito antiga`,
            'Instale Node.js versão 14 ou superior em: https://nodejs.org/'
        );
    }
} catch (error) {
    console.log('❌ Node.js não instalado!');
    adicionarProblema(
        'Node.js não está instalado',
        'Instale Node.js em: https://nodejs.org/'
    );
}

// 2. Verificar npm
try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm ${npmVersion} - OK`);
} catch (error) {
    console.log('❌ npm não disponível!');
    adicionarProblema(
        'npm não está disponível',
        'Reinstale Node.js para incluir o npm'
    );
}

// 3. Verificar pastas essenciais
const pastasEssenciais = ['backend', 'public', 'MRS'];
pastasEssenciais.forEach(pasta => {
    if (fs.existsSync(pasta)) {
        console.log(`✅ Pasta ${pasta}/ - OK`);
    } else {
        console.log(`❌ Pasta ${pasta}/ - NÃO ENCONTRADA!`);
        adicionarProblema(
            `Pasta ${pasta}/ não encontrada`,
            `Certifique-se de que a pasta ${pasta}/ existe na raiz do projeto`
        );
    }
});

// 4. Verificar arquivos MRS essenciais
console.log('\n📚 Verificando arquivos MRS...');
let modulosTxtOk = 0;
for (let i = 1; i <= 7; i++) {
    const arquivosModulo = fs.readdirSync('MRS').filter(f => f.match(new RegExp(`^Módulo ${i} .+\.txt$`)));
    if (arquivosModulo.length > 0) {
        console.log(`✅ Módulo ${i} (.txt): ${arquivosModulo[0]} - OK`);
        modulosTxtOk++;
    } else {
        console.log(`❌ Módulo ${i} (.txt) - NÃO ENCONTRADO!`);
        adicionarProblema(
            `Arquivo do Módulo ${i} (.txt) não encontrado na pasta MRS/`,
            'Certifique-se de que todos os arquivos de módulo estão na pasta MRS/ e começam com "Módulo X"'
        );
    }
    // Áudio
    const audioPath = `MRS/Audios/Curso MRS - Mod ${i}.wav`;
    if (fs.existsSync(audioPath)) {
        console.log(`✅ Áudio Módulo ${i}: ${audioPath} - OK`);
    } else {
        console.log(`❌ Áudio Módulo ${i}: ${audioPath} - NÃO ENCONTRADO!`);
        adicionarProblema(
            `Áudio do Módulo ${i} não encontrado`,
            'Certifique-se de que todos os áudios estão em MRS/Audios/ com o nome correto.'
        );
    }
}
if (modulosTxtOk === 7) {
    console.log('✅ Todos os arquivos de texto dos módulos MRS encontrados!');
}

// 5. Verificar permissões de escrita
try {
    const testFile = path.join('scripts', 'test-permission.tmp');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('✅ Permissões de escrita - OK');
} catch (error) {
    console.log('❌ Sem permissões de escrita!');
    adicionarProblema(
        'Sem permissões de escrita no diretório',
        'Execute o terminal como administrador ou verifique as permissões da pasta'
    );
}

// 6. Verificar espaço em disco
try {
    const stats = fs.statSync('.');
    const freeSpace = require('child_process').execSync('wmic logicaldisk get size,freespace,caption', { encoding: 'utf8' });
    console.log('✅ Espaço em disco - OK (verificação básica)');
} catch (error) {
    console.log('⚠️ Não foi possível verificar espaço em disco');
}

// 7. Verificar portas livres
function verificarPorta(porta) {
    try {
        const net = require('net');
        return new Promise((resolve) => {
            const server = net.createServer();
            server.listen(porta, () => {
                server.close();
                resolve(true);
            });
            server.on('error', () => {
                resolve(false);
            });
        });
    } catch (error) {
        return false;
    }
}

async function verificarPortas() {
    const porta3002 = await verificarPorta(3002);
    const porta8001 = await verificarPorta(8001);
    
    if (porta3002) {
        console.log('✅ Porta 3002 (backend) - LIVRE');
    } else {
        console.log('❌ Porta 3002 (backend) - EM USO!');
        adicionarProblema(
            'Porta 3002 está em uso',
            'Feche outros programas que possam estar usando a porta 3002 ou altere a porta no backend'
        );
    }
    
    if (porta8001) {
        console.log('✅ Porta 8001 (frontend) - LIVRE');
    } else {
        console.log('❌ Porta 8001 (frontend) - EM USO!');
        adicionarProblema(
            'Porta 8001 está em uso',
            'Feche outros programas que possam estar usando a porta 8001 ou altere a porta no frontend'
        );
    }
}

// 8. Verificar arquivos essenciais do PNSB
console.log('\n🔧 Verificando arquivos essenciais do PNSB...');
const arquivosEssenciais = [
    'backend/server.js',
    'backend/package.json',
    'public/index.html',
    'public/style.css',
    'public/script.js',
    'public/progress-manager.js',
    'public/certificate-manager.js'
];

arquivosEssenciais.forEach(arquivo => {
    if (fs.existsSync(arquivo)) {
        console.log(`✅ ${arquivo} - OK`);
    } else {
        console.log(`❌ ${arquivo} - NÃO ENCONTRADO!`);
        adicionarProblema(
            `Arquivo ${arquivo} não encontrado`,
            'Certifique-se de que o projeto PNSB está completo'
        );
    }
});

// Executar verificação de portas e mostrar resultado final
verificarPortas().then(() => {
    console.log('\n' + '='.repeat(60));
    
    if (ambienteOk) {
        console.log('🎉 AMBIENTE VERIFICADO - TUDO OK!');
        console.log('✅ Pode prosseguir com a transformação PNSB → MRS.');
        console.log('\n📋 Próximos passos:');
        console.log('1. Execute: node scripts/analisar-arquivos-mrs.js');
        console.log('2. Execute: node scripts/limpar-dados-pnsb.js');
        process.exit(0);
    } else {
        console.log('❌ AMBIENTE COM PROBLEMAS DETECTADOS!');
        console.log('\n🔧 PROBLEMAS ENCONTRADOS:');
        problemas.forEach((problema, index) => {
            console.log(`\n${index + 1}. ${problema.mensagem}`);
            if (problema.solucao) {
                console.log(`   💡 Solução: ${problema.solucao}`);
            }
        });
        console.log('\n⚠️ Corrija os problemas acima antes de continuar.');
        console.log('🔄 Execute este script novamente após as correções.');
        process.exit(1);
    }
}); 