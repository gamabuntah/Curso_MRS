#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🖼️  ADAPTANDO LAYOUT PARA MRS...\n');

let adaptacaoOk = true;
const logAlteracoes = [];

// Função para criar backup seguro
function criarBackup(arquivo) {
    try {
        const backupPath = arquivo + '.backup-' + new Date().toISOString().replace(/[:.]/g, '-');
        fs.copyFileSync(arquivo, backupPath);
        return backupPath;
    } catch (error) {
        console.log(`⚠️  Não foi possível criar backup de ${arquivo}: ${error.message}`);
        return null;
    }
}

// Função para aplicar substituições seguras
function aplicarSubstituicoes(conteudo, arquivo) {
    const substituicoes = [
        // Interface e títulos
        { de: /Curso PNSB/g, para: 'Curso MRS' },
        { de: /PNSB/g, para: 'MRS' },
        { de: /Plano Nacional de Saneamento Básico/g, para: 'Manejo de Resíduos Sólidos' },
        { de: /Capacitação em Manejo de Águas Pluviais/g, para: 'Capacitação em Limpeza e Manejo de Resíduos Sólidos' },
        
        // Configurações de sistema
        { de: /pnsb_progresso/g, para: 'mrs_progresso' },
        { de: /progresso_pnsb/g, para: 'progresso_mrs' },
        { de: /suporte@pnsb\.gov\.br/g, para: 'suporte@mrs.gov.br' },
        
        // Classes CSS e IDs
        { de: /curso-pnsb/g, para: 'curso-mrs' },
        { de: /curso_map/g, para: 'curso_mrs' },
        { de: /pnsb-/g, para: 'mrs-' },
        
        // Referências específicas de interface
        { de: /Sistema de Certificação PNSB/g, para: 'Sistema de Certificação MRS' },
        { de: /Validação de Certificado PNSB/g, para: 'Validação de Certificado MRS' },
        { de: /Teste do Sistema de Progresso PNSB/g, para: 'Teste do Sistema de Progresso MRS' },
        { de: /Login - Curso PNSB/g, para: 'Login - Curso MRS' },
        { de: /Admin - Curso PNSB/g, para: 'Admin - Curso MRS' }
    ];

    let conteudoModificado = conteudo;
    let alteracoesRealizadas = [];

    substituicoes.forEach(({ de, para }) => {
        if (de.test(conteudoModificado)) {
            const matches = conteudoModificado.match(de);
            if (matches) {
                conteudoModificado = conteudoModificado.replace(de, para);
                alteracoesRealizadas.push(`${de.source} → ${para} (${matches.length} ocorrências)`);
            }
        }
    });

    return { conteudo: conteudoModificado, alteracoes: alteracoesRealizadas };
}

// Lista completa de arquivos seguros para modificação
const arquivosSeguros = [
    // Arquivos HTML de interface
    'public/index.html',
    'public/login.html',
    'public/validate.html',
    'public/admin.html',
    'public/certificate-modal.html',
    'public/test-progress.html',
    'public/teste-player.html',
    'public/teste.html',
    
    // Arquivos JavaScript de sistema
    'public/script.js',
    'public/progress-manager.js',
    'public/certificate-manager.js',
    'public/certificate-generator.js',
    'public/login.js',
    'public/admin.js',
    
    // Arquivos de configuração
    'public/progress-config.json',
    'package.json'
];

// Processar cada arquivo
arquivosSeguros.forEach(arquivo => {
    if (fs.existsSync(arquivo)) {
        try {
            console.log(`📝 Processando: ${arquivo}`);
            
            // Criar backup
            const backupPath = criarBackup(arquivo);
            
            // Ler conteúdo
            let conteudo = fs.readFileSync(arquivo, 'utf8');
            
            // Aplicar substituições
            const resultado = aplicarSubstituicoes(conteudo, arquivo);
            
            // Verificar se houve alterações
            if (resultado.alteracoes.length > 0) {
                // Escrever arquivo modificado
                fs.writeFileSync(arquivo, resultado.conteudo, 'utf8');
                
                console.log(`✅ ${arquivo} adaptado (${resultado.alteracoes.length} alterações)`);
                resultado.alteracoes.forEach(alteracao => {
                    console.log(`   • ${alteracao}`);
                });
                
                logAlteracoes.push({
                    arquivo,
                    backup: backupPath,
                    alteracoes: resultado.alteracoes,
                    status: 'sucesso'
                });
            } else {
                console.log(`ℹ️  ${arquivo} - Nenhuma alteração necessária`);
                logAlteracoes.push({
                    arquivo,
                    alteracoes: [],
                    status: 'sem_alteracoes'
                });
            }
            
        } catch (error) {
            console.log(`❌ Erro ao processar ${arquivo}: ${error.message}`);
            adaptacaoOk = false;
            logAlteracoes.push({
                arquivo,
                erro: error.message,
                status: 'erro'
            });
        }
    } else {
        console.log(`ℹ️  ${arquivo} não encontrado (pode ser normal)`);
        logAlteracoes.push({
            arquivo,
            status: 'nao_encontrado'
        });
    }
});

// Salvar log detalhado
try {
    if (!fs.existsSync('logs')) fs.mkdirSync('logs');
    const logPath = 'logs/adaptacao-layout.json';
    fs.writeFileSync(logPath, JSON.stringify({
        data: new Date().toISOString(),
        totalArquivos: arquivosSeguros.length,
        arquivosProcessados: logAlteracoes.length,
        alteracoes: logAlteracoes
    }, null, 2));
    console.log(`\n📄 Log detalhado salvo em ${logPath}`);
} catch (e) {
    console.log(`\n⚠️  Não foi possível salvar o log: ${e.message}`);
}

// Resumo final
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO DA ADAPTAÇÃO DE LAYOUT');
console.log('='.repeat(60));

const sucessos = logAlteracoes.filter(item => item.status === 'sucesso').length;
const semAlteracoes = logAlteracoes.filter(item => item.status === 'sem_alteracoes').length;
const erros = logAlteracoes.filter(item => item.status === 'erro').length;
const naoEncontrados = logAlteracoes.filter(item => item.status === 'nao_encontrado').length;

console.log(`✅ Arquivos adaptados: ${sucessos}`);
console.log(`ℹ️  Sem alterações: ${semAlteracoes}`);
console.log(`❌ Erros: ${erros}`);
console.log(`🔍 Não encontrados: ${naoEncontrados}`);
console.log(`📁 Total processado: ${logAlteracoes.length}`);

if (adaptacaoOk && sucessos > 0) {
    console.log('\n🎉 LAYOUT ADAPTADO COM SUCESSO!');
    console.log('💡 Backups criados com extensão .backup-<timestamp>');
    process.exit(0);
} else if (sucessos > 0) {
    console.log('\n⚠️  ADAPTAÇÃO CONCLUÍDA COM ALGUNS PROBLEMAS!');
    process.exit(1);
} else {
    console.log('\n❌ NENHUMA ADAPTAÇÃO FOI REALIZADA!');
    process.exit(1);
} 