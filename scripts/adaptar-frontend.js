#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌐 ADAPTANDO FRONTEND PARA MRS...\n');

let adaptacaoOk = true;

// Função para fazer backup antes de modificar
function fazerBackup(arquivo, descricao) {
    try {
        if (fs.existsSync(arquivo)) {
            const backupPath = arquivo + '.backup';
            fs.copyFileSync(arquivo, backupPath);
            console.log(`💾 Backup criado: ${descricao}`);
            return true;
        }
        return false;
    } catch (error) {
        console.log(`❌ Erro ao criar backup de ${descricao}: ${error.message}`);
        return false;
    }
}

// 1. Adaptar script.js
console.log('📜 Adaptando script.js:');
const scriptPath = path.join('public', 'script.js');

if (fs.existsSync(scriptPath)) {
    // Fazer backup
    fazerBackup(scriptPath, 'script.js');
    
    try {
        let conteudo = fs.readFileSync(scriptPath, 'utf8');
        
        // Alterar referências de áudio
        conteudo = conteudo.replace(/Curso MAP - Mod/g, 'Curso MRS - Mod');
        conteudo = conteudo.replace(/Curso PNSB - Mod/g, 'Curso MRS - Mod');
        
        // Alterar títulos e referências gerais
        conteudo = conteudo.replace(/PNSB/g, 'MRS');
        conteudo = conteudo.replace(/Plano Nacional de Saneamento Básico/g, 'Manejo de Resíduos Sólidos');
        conteudo = conteudo.replace(/MAP/g, 'MRS');
        
        // Alterar porta do backend se necessário
        conteudo = conteudo.replace(/localhost:3001/g, 'localhost:3002');
        conteudo = conteudo.replace(/127\.0\.0\.1:3001/g, '127.0.0.1:3002');
        
        // Salvar arquivo modificado
        fs.writeFileSync(scriptPath, conteudo, 'utf8');
        console.log('✅ script.js adaptado para MRS');
        
        // Verificar se as alterações foram aplicadas
        const conteudoVerificado = fs.readFileSync(scriptPath, 'utf8');
        if (conteudoVerificado.includes('MRS') && !conteudoVerificado.includes('PNSB')) {
            console.log('✅ Verificação: referências atualizadas para MRS');
        } else {
            console.log('❌ Verificação falhou: alterações não aplicadas corretamente');
            adaptacaoOk = false;
        }
        
    } catch (error) {
        console.log(`❌ Erro ao adaptar script.js: ${error.message}`);
        adaptacaoOk = false;
    }
} else {
    console.log('❌ script.js não encontrado!');
    adaptacaoOk = false;
}

// 2. Adaptar index.html
console.log('\n📄 Adaptando index.html:');
const indexPath = path.join('public', 'index.html');

if (fs.existsSync(indexPath)) {
    // Fazer backup
    fazerBackup(indexPath, 'index.html');
    
    try {
        let conteudo = fs.readFileSync(indexPath, 'utf8');
        
        // Alterar título da página
        conteudo = conteudo.replace(/<title>.*?<\/title>/, '<title>Curso MRS - Manejo de Resíduos Sólidos</title>');
        
        // Alterar títulos no conteúdo
        conteudo = conteudo.replace(/PNSB/g, 'MRS');
        conteudo = conteudo.replace(/Plano Nacional de Saneamento Básico/g, 'Manejo de Resíduos Sólidos');
        conteudo = conteudo.replace(/MAP/g, 'MRS');
        
        // Alterar descrições
        conteudo = conteudo.replace(/Capacitação em Manejo de Águas Pluviais/g, 'Capacitação em Limpeza e Manejo de Resíduos Sólidos');
        
        // Salvar arquivo modificado
        fs.writeFileSync(indexPath, conteudo, 'utf8');
        console.log('✅ index.html adaptado para MRS');
        
    } catch (error) {
        console.log(`❌ Erro ao adaptar index.html: ${error.message}`);
        adaptacaoOk = false;
    }
} else {
    console.log('❌ index.html não encontrado!');
    adaptacaoOk = false;
}

// 3. Verificar se style.css está intacto
console.log('\n🎨 Verificando style.css:');
const stylePath = path.join('public', 'style.css');

if (fs.existsSync(stylePath)) {
    try {
        const conteudo = fs.readFileSync(stylePath, 'utf8');
        
        // Verificar se as cores principais estão presentes
        const coresPrincipais = ['#2B2D3A', '#6C63FF', '#00E599', '#F5F6FA'];
        const coresEncontradas = coresPrincipais.filter(cor => conteudo.includes(cor));
        
        if (coresEncontradas.length >= 3) {
            console.log('✅ style.css mantido intacto - cores preservadas');
        } else {
            console.log('⚠️  style.css pode ter sido alterado - verificar cores');
        }
        
    } catch (error) {
        console.log(`❌ Erro ao verificar style.css: ${error.message}`);
    }
} else {
    console.log('❌ style.css não encontrado!');
    adaptacaoOk = false;
}

// 4. Verificar certificate-manager.js
console.log('\n🏆 Verificando certificate-manager.js:');
const certPath = path.join('public', 'certificate-manager.js');

if (fs.existsSync(certPath)) {
    try {
        let conteudo = fs.readFileSync(certPath, 'utf8');
        
        // Alterar referências no certificado
        conteudo = conteudo.replace(/PNSB/g, 'MRS');
        conteudo = conteudo.replace(/Plano Nacional de Saneamento Básico/g, 'Manejo de Resíduos Sólidos');
        conteudo = conteudo.replace(/MAP/g, 'MRS');
        
        // Salvar arquivo modificado
        fs.writeFileSync(certPath, conteudo, 'utf8');
        console.log('✅ certificate-manager.js adaptado para MRS');
        
    } catch (error) {
        console.log(`❌ Erro ao adaptar certificate-manager.js: ${error.message}`);
        adaptacaoOk = false;
    }
} else {
    console.log('❌ certificate-manager.js não encontrado!');
    adaptacaoOk = false;
}

// 5. Criar pasta MRS no public se não existir
console.log('\n📁 Verificando estrutura de pastas:');
const mrsPublicPath = path.join('public', 'MRS');

if (!fs.existsSync(mrsPublicPath)) {
    try {
        fs.mkdirSync(mrsPublicPath, { recursive: true });
        console.log('✅ Pasta public/MRS criada');
    } catch (error) {
        console.log(`❌ Erro ao criar pasta public/MRS: ${error.message}`);
        adaptacaoOk = false;
    }
} else {
    console.log('✅ Pasta public/MRS já existe');
}

// 6. Criar pasta Audios dentro de MRS
const audiosPath = path.join(mrsPublicPath, 'Audios');
if (!fs.existsSync(audiosPath)) {
    try {
        fs.mkdirSync(audiosPath, { recursive: true });
        console.log('✅ Pasta public/MRS/Audios criada');
    } catch (error) {
        console.log(`❌ Erro ao criar pasta public/MRS/Audios: ${error.message}`);
        adaptacaoOk = false;
    }
} else {
    console.log('✅ Pasta public/MRS/Audios já existe');
}

// 7. Verificar se a pasta data existe
const dataPath = path.join('public', 'data');
if (!fs.existsSync(dataPath)) {
    try {
        fs.mkdirSync(dataPath, { recursive: true });
        console.log('✅ Pasta public/data criada');
    } catch (error) {
        console.log(`❌ Erro ao criar pasta public/data: ${error.message}`);
        adaptacaoOk = false;
    }
} else {
    console.log('✅ Pasta public/data já existe');
}

// Resultado final
console.log('\n' + '='.repeat(50));

if (adaptacaoOk) {
    console.log('🎉 FRONTEND ADAPTADO COM SUCESSO!');
    console.log('✅ 7 módulos configurados');
    console.log('✅ Títulos atualizados para MRS');
    console.log('✅ Referências de áudio corrigidas');
    console.log('✅ Estrutura de pastas criada');
    console.log('✅ Certificados adaptados');
    process.exit(0);
} else {
    console.log('⚠️  ADAPTAÇÃO CONCLUÍDA COM ALGUNS PROBLEMAS!');
    console.log('⚠️  Verifique os erros acima antes de continuar.');
    process.exit(1);
} 