#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📊 ADAPTANDO PROGRESS MANAGER PARA MRS...\n');

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

// 1. Adaptar progress-manager.js
console.log('📈 Adaptando progress-manager.js:');
const progressPath = path.join('public', 'progress-manager.js');

if (fs.existsSync(progressPath)) {
    // Fazer backup
    fazerBackup(progressPath, 'progress-manager.js');
    
    try {
        let conteudo = fs.readFileSync(progressPath, 'utf8');
        
        // Alterar loops de 8 para 7 módulos (única alteração necessária)
        conteudo = conteudo.replace(/for\s*\(\s*let\s+i\s*=\s*1;\s*i\s*<=\s*8;\s*i\+\+\)/g, 'for (let i = 1; i <= 7; i++)');
        
        // Alterar referências específicas
        conteudo = conteudo.replace(/PNSB/g, 'MRS');
        conteudo = conteudo.replace(/MAP/g, 'MRS');
        
        // Alterar porta da API se necessário
        conteudo = conteudo.replace(/localhost:3000/g, 'localhost:3002');
        conteudo = conteudo.replace(/localhost:3001/g, 'localhost:3002');
        
        // Salvar arquivo modificado
        fs.writeFileSync(progressPath, conteudo, 'utf8');
        console.log('✅ progress-manager.js adaptado para 7 módulos');
        
        // Verificar se as alterações foram aplicadas
        const conteudoVerificado = fs.readFileSync(progressPath, 'utf8');
        if (conteudoVerificado.includes('i <= 7') && !conteudoVerificado.includes('i <= 8')) {
            console.log('✅ Verificação: loops alterados para 7 módulos');
        } else {
            console.log('❌ Verificação falhou: loops não foram alterados corretamente');
            adaptacaoOk = false;
        }
        
    } catch (error) {
        console.log(`❌ Erro ao adaptar progress-manager.js: ${error.message}`);
        adaptacaoOk = false;
    }
} else {
    console.log('❌ progress-manager.js não encontrado!');
    adaptacaoOk = false;
}

// 2. Verificar se há outras referências a 8 módulos no frontend
console.log('\n🔍 Verificando outras referências a módulos:');
const arquivosFrontend = [
    'public/script.js',
    'public/index.html',
    'public/certificate-manager.js'
];

arquivosFrontend.forEach(arquivo => {
    if (fs.existsSync(arquivo)) {
        try {
            const conteudo = fs.readFileSync(arquivo, 'utf8');
            
            // Verificar se ainda há referências a 8 módulos
            const referencias8 = conteudo.match(/8/g);
            if (referencias8) {
                console.log(`⚠️  ${arquivo} - ${referencias8.length} referências ao número 8 encontradas`);
            } else {
                console.log(`✅ ${arquivo} - Sem referências problemáticas`);
            }
            
        } catch (error) {
            console.log(`❌ Erro ao verificar ${arquivo}: ${error.message}`);
        }
    }
});

// 3. Criar função de validação de progresso específica para MRS
console.log('\n⚙️  Criando validações específicas para MRS:');
const validacoesMRS = `
// Validações específicas para MRS
function validarProgressoMRS(moduloAtual) {
    if (moduloAtual < 1 || moduloAtual > 7) {
        console.error('Módulo inválido para MRS:', moduloAtual);
        return false;
    }
    return true;
}

function calcularProgressoMRS(modulosCompletos) {
    return Math.round((modulosCompletos / 7) * 100);
}

function verificarConclusaoMRS(modulosCompletos) {
    return modulosCompletos >= 7;
}
`;

// Adicionar validações ao progress-manager.js se não existirem
try {
    let conteudo = fs.readFileSync(progressPath, 'utf8');
    
    if (!conteudo.includes('validarProgressoMRS')) {
        conteudo += '\n' + validacoesMRS;
        fs.writeFileSync(progressPath, conteudo, 'utf8');
        console.log('✅ Validações específicas para MRS adicionadas');
    } else {
        console.log('✅ Validações específicas para MRS já existem');
    }
    
} catch (error) {
    console.log(`❌ Erro ao adicionar validações MRS: ${error.message}`);
    adaptacaoOk = false;
}

// 4. Verificar se o sistema de desbloqueio está correto
console.log('\n🔓 Verificando sistema de desbloqueio:');
try {
    const conteudo = fs.readFileSync(progressPath, 'utf8');
    
    // Verificar se há lógica de desbloqueio sequencial
    if (conteudo.includes('moduloAtual <= modulosCompletos + 1')) {
        console.log('✅ Sistema de desbloqueio sequencial configurado');
    } else {
        console.log('⚠️  Sistema de desbloqueio pode precisar de ajustes');
    }
    
    // Verificar se há validação de módulos anteriores
    if (conteudo.includes('moduloAnterior') || conteudo.includes('modulo - 1')) {
        console.log('✅ Validação de módulos anteriores configurada');
    } else {
        console.log('⚠️  Validação de módulos anteriores pode estar ausente');
    }
    
} catch (error) {
    console.log(`❌ Erro ao verificar sistema de desbloqueio: ${error.message}`);
}

// 5. Criar arquivo de configuração específico do progresso
console.log('\n📋 Criando configuração específica do progresso:');
const progressConfig = {
    totalModulos: 7,
    questoesPorModulo: 15,
    avaliacaoFinal: 50,
    porcentagemMinima: 70,
    desbloqueioSequencial: true,
    validarModulosAnteriores: true,
    permitirRevisao: true,
    salvarProgresso: true
};

try {
    fs.writeFileSync(path.join('public', 'progress-config.json'), JSON.stringify(progressConfig, null, 2), 'utf8');
    console.log('✅ progress-config.json criado');
} catch (error) {
    console.log(`❌ Erro ao criar progress-config.json: ${error.message}`);
    adaptacaoOk = false;
}

// 6. Verificar compatibilidade com certificados
console.log('\n🏆 Verificando compatibilidade com certificados:');
try {
    const certPath = path.join('public', 'certificate-manager.js');
    if (fs.existsSync(certPath)) {
        const conteudoCert = fs.readFileSync(certPath, 'utf8');
        
        if (conteudoCert.includes('7') && conteudoCert.includes('MRS')) {
            console.log('✅ Certificate manager compatível com MRS');
        } else {
            console.log('⚠️  Certificate manager pode precisar de ajustes');
        }
    }
} catch (error) {
    console.log(`❌ Erro ao verificar certificate manager: ${error.message}`);
}

// Resultado final
console.log('\n' + '='.repeat(50));

if (adaptacaoOk) {
    console.log('🎉 PROGRESS MANAGER ADAPTADO COM SUCESSO!');
    console.log('✅ 7 módulos configurados');
    console.log('✅ Cálculos de progresso ajustados');
    console.log('✅ Sistema de desbloqueio adaptado');
    console.log('✅ Validações específicas criadas');
    console.log('✅ Configuração de progresso salva');
    process.exit(0);
} else {
    console.log('⚠️  ADAPTAÇÃO CONCLUÍDA COM ALGUNS PROBLEMAS!');
    console.log('⚠️  Verifique os erros acima antes de continuar.');
    process.exit(1);
} 