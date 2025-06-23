const fs = require('fs');
const path = require('path');

// Configurações
const MODULES_DIR = path.join(__dirname, '../public/data');

// Função para simular carregamento do módulo como o frontend faria
function simulateFrontendLoad(moduleFile) {
    const modulePath = path.join(MODULES_DIR, moduleFile);
    
    if (!fs.existsSync(modulePath)) {
        return {
            success: false,
            error: 'Arquivo não encontrado'
        };
    }
    
    try {
        // Ler conteúdo do arquivo
        const content = fs.readFileSync(modulePath, 'utf8');
        
        // Simular o que o frontend faria: executar o arquivo e obter o módulo
        const moduleCode = content;
        
        // Criar um contexto isolado para executar o módulo
        const vm = require('vm');
        const context = {
            module: { exports: {} },
            exports: {},
            console: console
        };
        
        // Executar o módulo no contexto isolado
        vm.runInNewContext(moduleCode, context);
        
        // Obter o módulo exportado
        const moduleData = context.module.exports;
        
        // Validar estrutura esperada pelo frontend
        const validation = validateModuleForFrontend(moduleData);
        
        return {
            success: true,
            moduleData,
            validation,
            contentLength: content.length
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Função para validar se o módulo tem a estrutura esperada pelo frontend
function validateModuleForFrontend(moduleData) {
    const issues = [];
    
    // Verificar se é um objeto
    if (typeof moduleData !== 'object' || moduleData === null) {
        issues.push('Módulo não é um objeto válido');
        return { isValid: false, issues };
    }
    
    // Verificar campos obrigatórios
    if (!moduleData.id) {
        issues.push('Campo "id" não encontrado');
    }
    
    if (!moduleData.title) {
        issues.push('Campo "title" não encontrado (frontend espera este campo)');
    }
    
    if (!moduleData.cards || !Array.isArray(moduleData.cards)) {
        issues.push('Campo "cards" não encontrado ou não é um array');
    }
    
    if (!moduleData.audio) {
        issues.push('Campo "audio" não encontrado');
    }
    
    // Verificar estrutura dos cards
    if (moduleData.cards && Array.isArray(moduleData.cards)) {
        moduleData.cards.forEach((card, index) => {
            if (!card.title) {
                issues.push(`Card ${index + 1}: campo "title" não encontrado`);
            }
            if (!card.content) {
                issues.push(`Card ${index + 1}: campo "content" não encontrado`);
            }
            if (!card.type) {
                issues.push(`Card ${index + 1}: campo "type" não encontrado`);
            }
        });
    }
    
    // Verificar quiz
    if (!moduleData.quiz) {
        issues.push('Campo "quiz" não encontrado');
    } else if (!moduleData.quiz.questoes || !Array.isArray(moduleData.quiz.questoes)) {
        issues.push('Campo "quiz.questoes" não encontrado ou não é um array');
    }
    
    // Verificar metadata
    if (!moduleData.metadata) {
        issues.push('Campo "metadata" não encontrado');
    }
    
    return {
        isValid: issues.length === 0,
        issues,
        cardCount: moduleData.cards ? moduleData.cards.length : 0,
        questionCount: moduleData.quiz && moduleData.quiz.questoes ? moduleData.quiz.questoes.length : 0
    };
}

// Função para testar carregamento de todos os módulos
function testAllModules() {
    console.log('🧪 Testando compatibilidade dos módulos com o frontend...');
    console.log('📁 Diretório dos módulos:', MODULES_DIR);
    
    const modules = ['module1.js', 'module2.js', 'module3.js', 'module4.js', 'module5.js', 'module6.js', 'module7.js'];
    
    const results = {
        timestamp: new Date().toISOString(),
        totalModules: modules.length,
        tested: 0,
        successful: 0,
        failed: 0,
        modules: {}
    };
    
    console.log('\n📋 Testando carregamento dos módulos...\n');
    
    modules.forEach(moduleFile => {
        console.log(`🔍 Testando: ${moduleFile}`);
        
        const result = simulateFrontendLoad(moduleFile);
        results.modules[moduleFile] = result;
        results.tested++;
        
        if (!result.success) {
            results.failed++;
            console.log(`  ❌ Erro: ${result.error}`);
            return;
        }
        
        results.successful++;
        
        const validation = result.validation;
        console.log(`  📝 Título: ${result.moduleData.title || 'Não encontrado'}`);
        console.log(`  📊 Cards: ${validation.cardCount}`);
        console.log(`  ❓ Questões: ${validation.questionCount}`);
        console.log(`  📏 Tamanho: ${result.contentLength} caracteres`);
        
        if (validation.isValid) {
            console.log(`  ✅ Compatível com frontend`);
        } else {
            console.log(`  ❌ Problemas de compatibilidade:`);
            validation.issues.forEach(issue => {
                console.log(`    - ${issue}`);
            });
        }
        
        console.log('');
    });
    
    // Resumo final
    console.log('📊 RESUMO DOS TESTES:');
    console.log(`📁 Total de módulos: ${results.totalModules}`);
    console.log(`🧪 Testados: ${results.tested}`);
    console.log(`✅ Compatíveis: ${results.successful}`);
    console.log(`❌ Incompatíveis: ${results.failed}`);
    
    if (results.failed === 0 && results.successful === results.totalModules) {
        console.log('\n🎉 Todos os módulos são compatíveis com o frontend!');
        console.log('💡 O sistema deve funcionar corretamente.');
    } else if (results.failed > 0) {
        console.log('\n⚠️ Alguns módulos têm problemas de compatibilidade.');
        console.log('🔧 Execute o script corrigir-estrutura-modulos.js novamente.');
    } else {
        console.log('\n⚠️ Nem todos os módulos foram testados.');
    }
    
    // Salvar resultado em arquivo
    const logDir = path.dirname(path.join(__dirname, '../logs/teste-compatibilidade-frontend.json'));
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(__dirname, '../logs/teste-compatibilidade-frontend.json');
    fs.writeFileSync(logFile, JSON.stringify(results, null, 2), 'utf8');
    console.log(`\n📄 Log salvo em: ${logFile}`);
    
    return results;
}

// Função para testar carregamento específico de um módulo
function testSpecificModule(moduleFile) {
    console.log(`🧪 Testando módulo específico: ${moduleFile}`);
    
    const result = simulateFrontendLoad(moduleFile);
    
    if (!result.success) {
        console.log(`❌ Erro: ${result.error}`);
        return result;
    }
    
    console.log(`✅ Módulo carregado com sucesso`);
    console.log(`📝 Título: ${result.moduleData.title}`);
    console.log(`📊 Cards: ${result.validation.cardCount}`);
    console.log(`❓ Questões: ${result.validation.questionCount}`);
    
    if (result.validation.isValid) {
        console.log(`✅ Compatível com frontend`);
    } else {
        console.log(`❌ Problemas de compatibilidade:`);
        result.validation.issues.forEach(issue => {
            console.log(`  - ${issue}`);
        });
    }
    
    return result;
}

// Executar se chamado diretamente
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
        // Testar módulo específico
        testSpecificModule(args[0]);
    } else {
        // Testar todos os módulos
        testAllModules();
    }
}

module.exports = {
    simulateFrontendLoad,
    validateModuleForFrontend,
    testAllModules,
    testSpecificModule
}; 