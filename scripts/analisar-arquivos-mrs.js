#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📊 ANALISANDO ARQUIVOS MRS...\n');

let arquivosOk = true;

// 1. Verificar arquivos .txt dos módulos
console.log('📁 Verificando arquivos .txt dos módulos:');
let modulosTxtOk = 0;
for (let i = 1; i <= 7; i++) {
    const arquivosModulo = fs.readdirSync('MRS').filter(f => f.match(new RegExp(`^Módulo ${i} .+\.txt$`)));
    if (arquivosModulo.length > 0) {
        const arquivo = arquivosModulo[0];
        const caminho = path.join('MRS', arquivo);
        const stats = fs.statSync(caminho);
        const tamanhoKB = Math.round(stats.size / 1024);
        if (tamanhoKB >= 1) {
            console.log(`✅ ${arquivo} - ${tamanhoKB}KB`);
            modulosTxtOk++;
        } else {
            console.log(`❌ ${arquivo} - Arquivo muito pequeno (${tamanhoKB}KB)`);
            arquivosOk = false;
        }
    } else {
        console.log(`❌ Módulo ${i} (.txt) - NÃO ENCONTRADO!`);
        arquivosOk = false;
    }
}
if (modulosTxtOk === 7) {
    console.log('✅ Todos os arquivos de texto dos módulos MRS encontrados!');
}

// 2. Verificar áudios .wav
const audiosEsperados = [
    'Curso MRS - Mod 1.wav',
    'Curso MRS - Mod 2.wav',
    'Curso MRS - Mod 3.wav',
    'Curso MRS - Mod 4.wav',
    'Curso MRS - Mod 5.wav',
    'Curso MRS - Mod 6.wav',
    'Curso MRS - Mod 7.wav'
];

console.log('\n🎵 Verificando arquivos de áudio:');
audiosEsperados.forEach(audio => {
    const caminho = path.join('MRS', 'Audios', audio);
    if (fs.existsSync(caminho)) {
        const stats = fs.statSync(caminho);
        const tamanhoMB = Math.round(stats.size / (1024 * 1024));
        
        if (tamanhoMB >= 10) { // Mínimo 10MB
            console.log(`✅ ${audio} - ${tamanhoMB}MB`);
        } else {
            console.log(`❌ ${audio} - Arquivo muito pequeno (${tamanhoMB}MB)`);
            arquivosOk = false;
        }
    } else {
        console.log(`❌ ${audio} - NÃO ENCONTRADO!`);
        arquivosOk = false;
    }
});

// 3. Verificar estrutura de pastas
console.log('\n📂 Verificando estrutura de pastas:');
const pastasMRS = ['MRS', 'MRS/Audios'];
pastasMRS.forEach(pasta => {
    if (fs.existsSync(pasta)) {
        console.log(`✅ ${pasta}/ - OK`);
    } else {
        console.log(`❌ ${pasta}/ - NÃO ENCONTRADA!`);
        arquivosOk = false;
    }
});

// 4. Verificar codificação dos arquivos .txt
console.log('\n🔤 Verificando codificação dos arquivos .txt:');
for (let i = 1; i <= 7; i++) {
    const arquivosModulo = fs.readdirSync('MRS').filter(f => f.match(new RegExp(`^Módulo ${i} .+\.txt$`)));
    if (arquivosModulo.length > 0) {
        const arquivo = arquivosModulo[0];
        const caminho = path.join('MRS', arquivo);
        try {
            console.log(`[DEBUG] Antes de ler: ${arquivo}`);
            const conteudo = fs.readFileSync(caminho, 'utf8');
            console.log(`[DEBUG] Depois de ler: ${arquivo}`);
            const temAcentos = /[áàâãéèêíìîóòôõúùûç]/i.test(conteudo);
            const temCaracteresEspeciais = /[^\u0000-\u007F]/.test(conteudo);
            if (temAcentos || temCaracteresEspeciais) {
                console.log(`✅ ${arquivo} - Codificação UTF-8 OK`);
            } else {
                console.log(`⚠️  ${arquivo} - Sem caracteres especiais (pode estar OK)`);
            }
            const linhas = conteudo.split('\n').filter(linha => linha.trim().length > 0);
            if (linhas.length >= 10) {
                console.log(`   📝 ${linhas.length} linhas de conteúdo`);
            } else {
                console.log(`   ❌ ${arquivo} - Pouco conteúdo (${linhas.length} linhas)`);
                arquivosOk = false;
            }
        } catch (error) {
            console.log(`❌ ${arquivo} - Erro ao ler arquivo: ${error.message}`);
            arquivosOk = false;
        }
    }
}

// 5. Verificar nomenclatura e padrões
console.log('\n🏷️  Verificando padrões de nomenclatura:');
const arquivosEncontrados = fs.readdirSync('MRS').filter(f => f.endsWith('.txt'));
const audiosEncontrados = fs.readdirSync('MRS/Audios').filter(f => f.endsWith('.wav'));

if (arquivosEncontrados.length === 7) {
    console.log('✅ 7 arquivos .txt encontrados - OK');
} else {
    console.log(`❌ ${arquivosEncontrados.length} arquivos .txt encontrados (esperado: 7)`);
    arquivosOk = false;
}

if (audiosEncontrados.length === 7) {
    console.log('✅ 7 arquivos .wav encontrados - OK');
} else {
    console.log(`❌ ${audiosEncontrados.length} arquivos .wav encontrados (esperado: 7)`);
    arquivosOk = false;
}

// 6. Verificar se há arquivos extras
const arquivosTxtEsperados = [
    'Módulo 1 Introdução ao Saneamento B.txt',
    'Módulo 2 Estrutura do Questionário.txt', 
    'Módulo 3 Aspectos Legais, Terceiriz.txt',
    'Módulo 4 MRS em Áreas Especiais e C.txt',
    'Módulo 5 Manejo de Resíduos Sólidos.txt',
    'Módulo 6 Unidades de DestinaçãoDisp.txt',
    'Módulo 7 Entidades de Catadores, Ve.txt'
];

const arquivosTxtExtras = arquivosEncontrados.filter(arquivo => 
    !arquivosTxtEsperados.includes(arquivo)
);

if (arquivosTxtExtras.length > 0) {
    console.log(`⚠️  Arquivos .txt extras encontrados: ${arquivosTxtExtras.join(', ')}`);
}

const audiosExtras = audiosEncontrados.filter(audio => 
    !audiosEsperados.includes(audio)
);

if (audiosExtras.length > 0) {
    console.log(`⚠️  Arquivos .wav extras encontrados: ${audiosExtras.join(', ')}`);
}

// Resultado final
console.log('\n' + '='.repeat(50));

if (arquivosOk) {
    console.log('🎉 ARQUIVOS MRS ANALISADOS - TUDO OK!');
    console.log('✅ Todos os arquivos necessários estão presentes.');
    console.log('✅ Estrutura de pastas correta.');
    console.log('✅ Arquivos com tamanho adequado.');
    process.exit(0);
} else {
    console.log('❌ PROBLEMAS ENCONTRADOS NOS ARQUIVOS MRS!');
    console.log('⚠️  Corrija os problemas antes de continuar.');
    process.exit(1);
} 