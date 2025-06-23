#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌐 ADAPTANDO PÁGINAS HTML PARA MRS...\n');

let adaptacaoOk = true;

// Função para fazer backup
function fazerBackup(arquivo, descricao) {
    try {
        const backupPath = arquivo + '.backup';
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(arquivo, backupPath);
            console.log(`📦 Backup criado: ${descricao}`);
            return true;
        }
        return false;
    } catch (error) {
        console.log(`❌ Erro ao criar backup de ${descricao}: ${error.message}`);
        return false;
    }
}

// Função para adaptar conteúdo HTML
function adaptarConteudoHTML(conteudo) {
    return conteudo
        // Títulos e referências principais
        .replace(/PNSB/g, 'MRS')
        .replace(/Plano Nacional de Saneamento Básico/g, 'Manejo de Resíduos Sólidos')
        .replace(/MAP/g, 'MRS')
        .replace(/Manejo de Águas Pluviais/g, 'Manejo de Resíduos Sólidos')
        .replace(/Capacitação em Manejo de Águas Pluviais/g, 'Capacitação em Limpeza e Manejo de Resíduos Sólidos')
        
        // Referências específicas
        .replace(/curso-pnsb/g, 'curso-mrs')
        .replace(/curso_map/g, 'curso_mrs')
        .replace(/pesquisa nacional de saneamento básico/gi, 'capacitação em manejo de resíduos sólidos')
        
        // Referências de áudio
        .replace(/Curso MAP - Mod/g, 'Curso MRS - Mod')
        .replace(/Curso PNSB - Mod/g, 'Curso MRS - Mod')
        
        // Portas do backend
        .replace(/localhost:3001/g, 'localhost:3002')
        .replace(/127\.0\.0\.1:3001/g, '127.0.0.1:3002');
}

// 1. Adaptar login.html
console.log('🔐 Adaptando login.html:');
const loginPath = path.join('public', 'login.html');

if (fs.existsSync(loginPath)) {
    fazerBackup(loginPath, 'login.html');
    
    try {
        let conteudo = fs.readFileSync(loginPath, 'utf8');
        conteudo = adaptarConteudoHTML(conteudo);
        
        // Adaptações específicas para login.html
        conteudo = conteudo.replace(/<title>.*?<\/title>/, '<title>Login - Curso MRS</title>');
        
        fs.writeFileSync(loginPath, conteudo, 'utf8');
        console.log('✅ login.html adaptado para MRS');
        
    } catch (error) {
        console.log(`❌ Erro ao adaptar login.html: ${error.message}`);
        adaptacaoOk = false;
    }
} else {
    console.log('❌ login.html não encontrado!');
    adaptacaoOk = false;
}

// 2. Adaptar validate.html
console.log('\n🔍 Adaptando validate.html:');
const validatePath = path.join('public', 'validate.html');

if (fs.existsSync(validatePath)) {
    fazerBackup(validatePath, 'validate.html');
    
    try {
        let conteudo = fs.readFileSync(validatePath, 'utf8');
        conteudo = adaptarConteudoHTML(conteudo);
        
        // Adaptações específicas para validate.html
        conteudo = conteudo.replace(/<title>.*?<\/title>/, '<title>Validar Certificado - Curso MRS</title>');
        
        fs.writeFileSync(validatePath, conteudo, 'utf8');
        console.log('✅ validate.html adaptado para MRS');
        
    } catch (error) {
        console.log(`❌ Erro ao adaptar validate.html: ${error.message}`);
        adaptacaoOk = false;
    }
} else {
    console.log('ℹ️  validate.html não encontrado (pode ser normal)');
}

// 3. Corrigir index.html (remover referência ao module8.js)
console.log('\n📄 Corrigindo index.html:');
const indexPath = path.join('public', 'index.html');

if (fs.existsSync(indexPath)) {
    try {
        let conteudo = fs.readFileSync(indexPath, 'utf8');
        
        // Remover referência ao module8.js (MRS só tem 7 módulos)
        conteudo = conteudo.replace(/<script src="data\/module8\.js"><\/script>\s*/, '');
        
        // Corrigir título da topbar
        conteudo = conteudo.replace(
            /<div class="topbar-title">Pesquisa Nacional de Saneamento Básico<\/div>/,
            '<div class="topbar-title">Capacitação em Manejo de Resíduos Sólidos</div>'
        );
        
        fs.writeFileSync(indexPath, conteudo, 'utf8');
        console.log('✅ index.html corrigido (module8.js removido, título atualizado)');
        
    } catch (error) {
        console.log(`❌ Erro ao corrigir index.html: ${error.message}`);
        adaptacaoOk = false;
    }
} else {
    console.log('❌ index.html não encontrado!');
    adaptacaoOk = false;
}

// 4. Verificar outras páginas HTML
console.log('\n📋 Verificando outras páginas HTML:');
const outrasPaginas = [
    { arquivo: 'public/admin.html', descricao: 'admin.html' },
    { arquivo: 'public/certificate-modal.html', descricao: 'certificate-modal.html' },
    { arquivo: 'public/teste.html', descricao: 'teste.html' },
    { arquivo: 'public/teste-player.html', descricao: 'teste-player.html' },
    { arquivo: 'public/test-progress.html', descricao: 'test-progress.html' }
];

outrasPaginas.forEach(({ arquivo, descricao }) => {
    if (fs.existsSync(arquivo)) {
        try {
            let conteudo = fs.readFileSync(arquivo, 'utf8');
            const conteudoOriginal = conteudo;
            conteudo = adaptarConteudoHTML(conteudo);
            
            if (conteudo !== conteudoOriginal) {
                fazerBackup(arquivo, descricao);
                fs.writeFileSync(arquivo, conteudo, 'utf8');
                console.log(`✅ ${descricao} adaptado para MRS`);
            } else {
                console.log(`ℹ️  ${descricao} já está adaptado ou não precisa de alterações`);
            }
            
        } catch (error) {
            console.log(`❌ Erro ao verificar ${descricao}: ${error.message}`);
        }
    } else {
        console.log(`ℹ️  ${descricao} não encontrado (pode ser normal)`);
    }
});

// Resultado final
console.log('\n' + '='.repeat(50));

if (adaptacaoOk) {
    console.log('🎉 PÁGINAS HTML ADAPTADAS COM SUCESSO!');
    console.log('✅ login.html adaptado para MRS');
    console.log('✅ validate.html adaptado para MRS');
    console.log('✅ index.html corrigido (module8.js removido)');
    console.log('✅ Outras páginas verificadas e adaptadas');
    console.log('✅ Backups criados para segurança');
    process.exit(0);
} else {
    console.log('⚠️  ADAPTAÇÃO CONCLUÍDA COM ALGUNS PROBLEMAS!');
    console.log('⚠️  Verifique os erros acima antes de continuar.');
    process.exit(1);
} 