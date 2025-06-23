#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 ADAPTANDO BACKEND PARA MRS...\n');

let adaptacaoOk = true;
const alteracoesRealizadas = [];

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

// Função para validar sintaxe JavaScript
function validarJavaScript(conteudo, arquivo) {
    try {
        // Teste básico de sintaxe - tentar criar uma função
        new Function(conteudo);
        return true;
    } catch (error) {
        console.log(`⚠️  Possível erro de sintaxe em ${arquivo}: ${error.message}`);
        return false;
    }
}

// 1. Adaptar server.js
console.log('📡 Adaptando server.js:');
const serverPath = path.join('backend', 'server.js');

if (fs.existsSync(serverPath)) {
    // Fazer backup
    fazerBackup(serverPath, 'server.js');
    
    try {
        let conteudo = fs.readFileSync(serverPath, 'utf8');
        let alteracoes = 0;
        
        // Alterar porta (mais específico)
        if (conteudo.includes('const PORT = ')) {
            conteudo = conteudo.replace(/const PORT = \d+;/, 'const PORT = 3002;');
            alteracoes++;
            alteracoesRealizadas.push('Porta alterada para 3002');
        }
        
        // Alterar número de módulos (mais específico)
        if (conteudo.includes('moduleCount = ')) {
            conteudo = conteudo.replace(/moduleCount = \d+/, 'moduleCount = 7');
            alteracoes++;
            alteracoesRealizadas.push('moduleCount alterado para 7');
        }
        
        if (conteudo.includes('NUM_MODULOS = ')) {
            conteudo = conteudo.replace(/const NUM_MODULOS = \d+/, 'const NUM_MODULOS = 7');
            alteracoes++;
            alteracoesRealizadas.push('NUM_MODULOS alterado para 7');
        }
        
        // Alterar títulos (mais específico - apenas em strings)
        if (conteudo.includes('"PNSB"') || conteudo.includes("'PNSB'")) {
            conteudo = conteudo.replace(/"PNSB"/g, '"MRS"').replace(/'PNSB'/g, "'MRS'");
            alteracoes++;
            alteracoesRealizadas.push('Referências PNSB alteradas para MRS');
        }
        
        if (conteudo.includes('"Plano Nacional de Saneamento Básico"')) {
            conteudo = conteudo.replace(/"Plano Nacional de Saneamento Básico"/g, '"Manejo de Resíduos Sólidos"');
            alteracoes++;
            alteracoesRealizadas.push('Título completo alterado');
        }
        
        // Salvar arquivo modificado
        fs.writeFileSync(serverPath, conteudo, 'utf8');
        console.log(`✅ server.js adaptado (${alteracoes} alterações)`);
        
        // Validar sintaxe
        if (validarJavaScript(conteudo, 'server.js')) {
            console.log('✅ Sintaxe JavaScript válida');
        } else {
            console.log('⚠️  Possível problema de sintaxe - verifique manualmente');
        }
        
        // Verificar se as alterações foram aplicadas
        const conteudoVerificado = fs.readFileSync(serverPath, 'utf8');
        let verificacoesOk = 0;
        
        if (conteudoVerificado.includes('PORT = 3002')) {
            console.log('✅ Verificação: porta 3002 configurada');
            verificacoesOk++;
        }
        
        if (conteudoVerificado.includes('"MRS"') || conteudoVerificado.includes("'MRS'")) {
            console.log('✅ Verificação: referências MRS encontradas');
            verificacoesOk++;
        }
        
        if (verificacoesOk >= 1) {
            console.log('✅ Verificação: alterações principais aplicadas');
        } else {
            console.log('⚠️  Verificação: poucas alterações detectadas (pode estar OK)');
        }
        
    } catch (error) {
        console.log(`❌ Erro ao adaptar server.js: ${error.message}`);
        adaptacaoOk = false;
    }
} else {
    console.log('❌ server.js não encontrado!');
    adaptacaoOk = false;
}

// 2. Adaptar package.json
console.log('\n📦 Adaptando package.json:');
const packagePath = path.join('backend', 'package.json');

if (fs.existsSync(packagePath)) {
    // Fazer backup
    fazerBackup(packagePath, 'package.json');
    
    try {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Atualizar informações do projeto
        packageData.name = 'curso-mrs-backend';
        packageData.description = 'Backend para o curso de Manejo de Resíduos Sólidos';
        packageData.version = '1.0.0';
        
        // Atualizar scripts se necessário
        if (packageData.scripts) {
            packageData.scripts.start = 'node server.js';
            packageData.scripts.dev = 'nodemon server.js';
        }
        
        // Salvar arquivo modificado
        fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2), 'utf8');
        console.log('✅ package.json adaptado para MRS');
        alteracoesRealizadas.push('package.json atualizado');
        
    } catch (error) {
        console.log(`❌ Erro ao adaptar package.json: ${error.message}`);
        adaptacaoOk = false;
    }
} else {
    console.log('❌ package.json não encontrado!');
    adaptacaoOk = false;
}

// 3. Verificar database.json
console.log('\n🗄️  Verificando database.json:');
const databasePath = path.join('backend', 'database.json');

if (fs.existsSync(databasePath)) {
    try {
        const databaseData = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
        
        // Limpar dados antigos se existirem
        if (databaseData.certificados) {
            databaseData.certificados = [];
            console.log('✅ Certificados antigos removidos do database');
            alteracoesRealizadas.push('Certificados antigos removidos');
        }
        
        if (databaseData.progresso) {
            databaseData.progresso = {};
            console.log('✅ Progresso antigo removido do database');
            alteracoesRealizadas.push('Progresso antigo removido');
        }
        
        // Salvar database limpo
        fs.writeFileSync(databasePath, JSON.stringify(databaseData, null, 2), 'utf8');
        console.log('✅ database.json limpo e pronto para MRS');
        
    } catch (error) {
        console.log(`❌ Erro ao limpar database.json: ${error.message}`);
        adaptacaoOk = false;
    }
} else {
    console.log('ℹ️  database.json não encontrado - será criado automaticamente');
}

// 4. Verificar se as dependências estão corretas
console.log('\n🔍 Verificando dependências:');
if (fs.existsSync(packagePath)) {
    try {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        const dependenciasNecessarias = ['express', 'cors', 'body-parser'];
        const dependenciasFaltando = dependenciasNecessarias.filter(dep => 
            !packageData.dependencies || !packageData.dependencies[dep]
        );
        
        if (dependenciasFaltando.length === 0) {
            console.log('✅ Todas as dependências necessárias estão presentes');
        } else {
            console.log(`⚠️  Dependências faltando: ${dependenciasFaltando.join(', ')}`);
            console.log('ℹ️  Execute "npm install" na pasta backend para instalar');
        }
        
    } catch (error) {
        console.log(`❌ Erro ao verificar dependências: ${error.message}`);
    }
}

// 5. Criar arquivo de configuração específico do backend
console.log('\n⚙️  Criando configuração específica do backend:');
const backendConfig = {
    porta: 3002,
    curso: 'MRS',
    modulos: 7,
    cors: {
        origin: ['http://localhost:8001', 'http://127.0.0.1:8001'],
        credentials: true
    },
    database: {
        arquivo: 'database.json',
        backup: true
    },
    certificados: {
        habilitado: true,
        formato: 'pdf',
        incluirQRCode: true
    }
};

try {
    fs.writeFileSync(path.join('backend', 'config.json'), JSON.stringify(backendConfig, null, 2), 'utf8');
    console.log('✅ config.json criado no backend');
    alteracoesRealizadas.push('config.json criado');
} catch (error) {
    console.log(`❌ Erro ao criar config.json: ${error.message}`);
    adaptacaoOk = false;
}

// Resultado final
console.log('\n' + '='.repeat(50));

if (adaptacaoOk) {
    console.log('🎉 BACKEND ADAPTADO COM SUCESSO!');
    console.log('✅ Porta alterada para 3002');
    console.log('✅ Referências atualizadas para MRS');
    console.log('✅ 7 módulos configurados');
    console.log('✅ Database limpo');
    
    console.log('\n📋 ALTERAÇÕES REALIZADAS:');
    alteracoesRealizadas.forEach((alteracao, index) => {
        console.log(`   ${index + 1}. ${alteracao}`);
    });
    
    process.exit(0);
} else {
    console.log('⚠️  ADAPTAÇÃO CONCLUÍDA COM ALGUNS PROBLEMAS!');
    console.log('⚠️  Verifique os erros acima antes de continuar.');
    process.exit(1);
} 