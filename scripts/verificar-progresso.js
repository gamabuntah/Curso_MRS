/**
 * Verificação Simples do Sistema de Progresso MRS
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO SISTEMA DE PROGRESSO MRS...\n');

// Verifica se o arquivo progress-manager.js existe e tem a estrutura correta
function verificarArquivoProgressManager() {
    const arquivo = path.join(__dirname, '../public/progress-manager.js');
    
    if (!fs.existsSync(arquivo)) {
        console.log('❌ Arquivo progress-manager.js não encontrado');
        return false;
    }
    
    const conteudo = fs.readFileSync(arquivo, 'utf8');
    
    // Verifica se tem as funções essenciais
    const funcoesEssenciais = [
        'class ProgressManager',
        'async init()',
        'async completeQuiz(',
        'async markAudioAsCompleted(',
        'async completeFinalEvaluation(',
        'getModuleStatus(',
        'getOverallProgress(',
        'canAccessModule(',
        'canAccessFinalEvaluation(',
        'updateVisualIndicators('
    ];
    
    let todasFuncoesPresentes = true;
    funcoesEssenciais.forEach(funcao => {
        if (!conteudo.includes(funcao)) {
            console.log(`❌ Função não encontrada: ${funcao}`);
            todasFuncoesPresentes = false;
        }
    });
    
    if (todasFuncoesPresentes) {
        console.log('✅ Arquivo progress-manager.js está completo');
    }
    
    return todasFuncoesPresentes;
}

// Verifica se o script.js está usando as funções corretas
function verificarIntegracaoScript() {
    const arquivo = path.join(__dirname, '../public/script.js');
    
    if (!fs.existsSync(arquivo)) {
        console.log('❌ Arquivo script.js não encontrado');
        return false;
    }
    
    const conteudo = fs.readFileSync(arquivo, 'utf8');
    
    // Verifica se está usando as funções corretas
    const verificacoes = [
        {
            nome: 'Uso de completeQuiz',
            presente: conteudo.includes('progressManager.completeQuiz('),
            esperado: true
        },
        {
            nome: 'Uso de markAudioAsCompleted',
            presente: conteudo.includes('progressManager.markAudioAsCompleted('),
            esperado: true
        },
        {
            nome: 'Uso de completeFinalEvaluation',
            presente: conteudo.includes('progressManager.completeFinalEvaluation('),
            esperado: true
        },
        {
            nome: 'Uso de getModuleStatus',
            presente: conteudo.includes('progressManager.getModuleStatus('),
            esperado: true
        },
        {
            nome: 'Uso de canAccessModule',
            presente: conteudo.includes('progressManager.canAccessModule('),
            esperado: true
        },
        {
            nome: 'Uso de canAccessFinalEvaluation',
            presente: conteudo.includes('progressManager.canAccessFinalEvaluation('),
            esperado: true
        },
        {
            nome: 'Uso de applyProgressClasses',
            presente: conteudo.includes('applyProgressClasses('),
            esperado: true
        }
    ];
    
    let todasCorretas = true;
    verificacoes.forEach(verificacao => {
        if (verificacao.presente === verificacao.esperado) {
            console.log(`✅ ${verificacao.nome}`);
        } else {
            console.log(`❌ ${verificacao.nome} - ${verificacao.presente ? 'presente' : 'ausente'}`);
            todasCorretas = false;
        }
    });
    
    return todasCorretas;
}

// Verifica se os estilos CSS estão presentes
function verificarEstilosCSS() {
    const arquivo = path.join(__dirname, '../public/style.css');
    
    if (!fs.existsSync(arquivo)) {
        console.log('❌ Arquivo style.css não encontrado');
        return false;
    }
    
    const conteudo = fs.readFileSync(arquivo, 'utf8');
    
    const estilosNecessarios = [
        '.sync-notification',
        '.progress-locked',
        '.progress-available',
        '.progress-completed',
        '.progress-failed',
        '.progress-audio_pending'
    ];
    
    let todosEstilosPresentes = true;
    estilosNecessarios.forEach(estilo => {
        if (!conteudo.includes(estilo)) {
            console.log(`❌ Estilo não encontrado: ${estilo}`);
            todosEstilosPresentes = false;
        }
    });
    
    if (todosEstilosPresentes) {
        console.log('✅ Estilos CSS do progresso estão presentes');
    }
    
    return todosEstilosPresentes;
}

// Verifica a estrutura de dados dos módulos
function verificarEstruturaModulos() {
    const modulos = [1, 2, 3, 4, 5, 6, 7];
    let todosModulosOK = true;
    
    modulos.forEach(numero => {
        const arquivo = path.join(__dirname, `../public/data/browser/questoes-otimizadas/module${numero}.js`);
        
        if (!fs.existsSync(arquivo)) {
            console.log(`❌ Módulo ${numero} não encontrado`);
            todosModulosOK = false;
            return;
        }
        
        const conteudo = fs.readFileSync(arquivo, 'utf8');
        
        // Verifica se tem a estrutura básica correta
        const temEstruturaCorreta = conteudo.includes(`window.module${numero}`) && 
                                   conteudo.includes('quiz') && 
                                   conteudo.includes('questoes');
        
        if (!temEstruturaCorreta) {
            console.log(`❌ Módulo ${numero} com estrutura incorreta`);
            todosModulosOK = false;
        }
    });
    
    if (todosModulosOK) {
        console.log('✅ Todos os módulos estão presentes e com estrutura correta');
    }
    
    return todosModulosOK;
}

// Executa todas as verificações
function executarVerificacoes() {
    console.log('📋 INICIANDO VERIFICAÇÕES...\n');
    
    const resultados = {
        progressManager: verificarArquivoProgressManager(),
        integracaoScript: verificarIntegracaoScript(),
        estilosCSS: verificarEstilosCSS(),
        estruturaModulos: verificarEstruturaModulos()
    };
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 RELATÓRIO DE VERIFICAÇÃO');
    console.log('='.repeat(50));
    
    const total = Object.keys(resultados).length;
    const sucessos = Object.values(resultados).filter(r => r).length;
    
    console.log(`✅ Verificações aprovadas: ${sucessos}/${total}`);
    console.log(`❌ Verificações com problemas: ${total - sucessos}`);
    console.log(`📈 Taxa de sucesso: ${((sucessos / total) * 100).toFixed(1)}%`);
    
    if (sucessos === total) {
        console.log('\n🎉 SISTEMA DE PROGRESSO VERIFICADO COM SUCESSO!');
        console.log('💡 O sistema está pronto para uso.');
    } else {
        console.log('\n⚠️ ALGUNS PROBLEMAS FORAM IDENTIFICADOS.');
        console.log('🔧 Corrija os problemas listados acima antes de prosseguir.');
    }
    
    // Salva relatório
    const relatorio = {
        timestamp: new Date().toISOString(),
        resultados,
        total,
        sucessos,
        taxaSucesso: ((sucessos / total) * 100).toFixed(1)
    };
    
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.writeFileSync(
        path.join(logDir, 'verificacao-progresso.json'),
        JSON.stringify(relatorio, null, 2)
    );
    
    console.log('\n📄 Relatório salvo em: logs/verificacao-progresso.json');
    
    return sucessos === total;
}

// Executa as verificações
const sucesso = executarVerificacoes();
process.exit(sucesso ? 0 : 1); 