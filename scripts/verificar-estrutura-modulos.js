const fs = require('fs');
const path = require('path');

// Configurações
const MODULES_DIR = path.join(__dirname, '../public/data');

// Função para validar JSON
function validateJSON(content) {
    try {
        // Tentar fazer parse do JSON
        JSON.parse(content);
        return { isValid: true, error: null };
    } catch (error) {
        return { isValid: false, error: error.message };
    }
}

// Função para validar estrutura do módulo
function validateModuleStructure(moduleContent) {
    try {
        // Verificar se tem module.exports
        const hasModuleExports = moduleContent.includes('module.exports');
        
        // Verificar se tem campo 'title' (busca mais precisa para JSON)
        const hasTitle = /"title"\s*:/g.test(moduleContent) || /'title'\s*:/g.test(moduleContent);
        const hasTitulo = /"titulo"\s*:/g.test(moduleContent) || /'titulo'\s*:/g.test(moduleContent);
        
        // Verificar se tem estrutura básica de cards
        const hasCards = /"cards"\s*:/g.test(moduleContent) || /'cards'\s*:/g.test(moduleContent);
        
        // Verificar se tem quizzes
        const hasQuizzes = /"quizzes"\s*:/g.test(moduleContent) || /'quizzes'\s*:/g.test(moduleContent);
        const hasQuiz = /"quiz"\s*:/g.test(moduleContent) || /'quiz'\s*:/g.test(moduleContent);
        
        // Verificar se tem feedbacks
        const hasFeedbacks = /"feedbacks"\s*:/g.test(moduleContent) || /'feedbacks'\s*:/g.test(moduleContent);
        
        // Verificar se tem metadata
        const hasMetadata = /"metadata"\s*:/g.test(moduleContent) || /'metadata'\s*:/g.test(moduleContent);
        
        // Validar JSON apenas do objeto exportado
        let jsonToValidate = moduleContent;
        if (hasModuleExports) {
            jsonToValidate = moduleContent.replace(/module\.exports\s*=\s*/, '');
            jsonToValidate = jsonToValidate.replace(/;\s*$/, '');
        }
        const jsonValidation = validateJSON(jsonToValidate);
        
        return {
            hasModuleExports,
            hasTitle,
            hasTitulo,
            hasCards,
            hasQuizzes: hasQuizzes || hasQuiz,
            hasFeedbacks,
            hasMetadata,
            jsonValid: jsonValidation.isValid,
            jsonError: jsonValidation.error,
            isValid: hasModuleExports && hasTitle && hasCards && jsonValidation.isValid,
            needsFixing: !hasModuleExports || hasTitulo || !hasTitle || !jsonValidation.isValid
        };
    } catch (error) {
        return {
            hasModuleExports: false,
            hasTitle: false,
            hasTitulo: false,
            hasCards: false,
            hasQuizzes: false,
            hasFeedbacks: false,
            hasMetadata: false,
            jsonValid: false,
            jsonError: error.message,
            isValid: false,
            needsFixing: true,
            error: error.message
        };
    }
}

// Função para extrair título de forma mais robusta
function extractTitle(content) {
    try {
        // Tentar extrair título de diferentes formas
        let title = 'Não encontrado';
        
        // 1. Tentar extrair "titulo"
        const tituloMatch = content.match(/"titulo"\s*:\s*"([^"]+)"/) || 
                           content.match(/'titulo'\s*:\s*'([^']+)'/);
        if (tituloMatch) {
            title = tituloMatch[1];
        }
        
        // 2. Tentar extrair "title"
        const titleMatch = content.match(/"title"\s*:\s*"([^"]+)"/) || 
                          content.match(/'title'\s*:\s*'([^']+)'/);
        if (titleMatch) {
            title = titleMatch[1];
        }
        
        return title;
    } catch (error) {
        return 'Erro ao extrair título';
    }
}

// Função para analisar um módulo
function analyzeModule(moduleFile) {
    const modulePath = path.join(MODULES_DIR, moduleFile);
    
    if (!fs.existsSync(modulePath)) {
        return {
            exists: false,
            error: 'Arquivo não encontrado'
        };
    }
    
    try {
        const content = fs.readFileSync(modulePath, 'utf8');
        const validation = validateModuleStructure(content);
        
        // Extrair informações básicas
        const title = extractTitle(content);
        let cardCount = 0;
        let quizCount = 0;
        let questionCount = 0;
        
        try {
            // Contar cards
            const cardMatches = content.match(/"cards"/g) || [];
            cardCount = cardMatches.length;
            
            // Contar quizzes
            const quizMatches = content.match(/"quizzes"/g) || [];
            const quizMatch = content.match(/"quiz"/g) || [];
            quizCount = quizMatches.length + quizMatch.length;
            
            // Contar questões
            const questionMatches = content.match(/"pergunta"/g) || [];
            questionCount = questionMatches.length;
            
        } catch (parseError) {
            // Ignorar erros de parsing
        }
        
        return {
            exists: true,
            title,
            cardCount,
            quizCount,
            questionCount,
            validation,
            contentLength: content.length
        };
        
    } catch (error) {
        return {
            exists: false,
            error: error.message
        };
    }
}

// Função principal
function main() {
    console.log('🔍 Verificando estrutura dos módulos...');
    console.log('📁 Diretório dos módulos:', MODULES_DIR);
    
    const modules = ['module1.js', 'module2.js', 'module3.js', 'module4.js', 'module5.js', 'module6.js', 'module7.js'];
    
    const results = {
        timestamp: new Date().toISOString(),
        totalModules: modules.length,
        found: 0,
        valid: 0,
        needFixing: 0,
        modules: {}
    };
    
    console.log('\n📋 Analisando módulos...\n');
    
    modules.forEach(moduleFile => {
        console.log(`🔍 ${moduleFile}:`);
        
        const analysis = analyzeModule(moduleFile);
        results.modules[moduleFile] = analysis;
        
        if (!analysis.exists) {
            console.log(`  ❌ ${analysis.error}`);
            return;
        }
        
        results.found++;
        
        console.log(`  📝 Título: ${analysis.title}`);
        console.log(`  📊 Cards: ${analysis.cardCount}`);
        console.log(`  ❓ Quizzes: ${analysis.quizCount}`);
        console.log(`  ❓ Questões: ${analysis.questionCount}`);
        console.log(`  📏 Tamanho: ${analysis.contentLength} caracteres`);
        
        const v = analysis.validation;
        console.log(`  🔧 Estrutura:`);
        console.log(`    - module.exports: ${v.hasModuleExports ? '✅' : '❌'}`);
        console.log(`    - title: ${v.hasTitle ? '✅' : '❌'}`);
        console.log(`    - titulo: ${v.hasTitulo ? '⚠️ (precisa trocar)' : '✅'}`);
        console.log(`    - cards: ${v.hasCards ? '✅' : '❌'}`);
        console.log(`    - quiz/quizzes: ${v.hasQuizzes ? '✅' : '❌'}`);
        console.log(`    - feedbacks: ${v.hasFeedbacks ? '✅' : '❌'}`);
        console.log(`    - metadata: ${v.hasMetadata ? '✅' : '❌'}`);
        console.log(`    - JSON válido: ${v.jsonValid ? '✅' : '❌'}`);
        
        if (!v.jsonValid && !v.hasModuleExports) {
            console.log(`    - Erro JSON: ${v.jsonError}`);
        }
        
        if (v.isValid) {
            console.log(`  ✅ Estrutura válida`);
            results.valid++;
        } else if (v.needsFixing) {
            console.log(`  🔧 Precisa correção`);
            results.needFixing++;
        } else {
            console.log(`  ⚠️ Estrutura incompleta`);
        }
        
        console.log('');
    });
    
    // Resumo final
    console.log('📊 RESUMO DA VERIFICAÇÃO:');
    console.log(`📁 Total de módulos: ${results.totalModules}`);
    console.log(`📂 Módulos encontrados: ${results.found}`);
    console.log(`✅ Estrutura válida: ${results.valid}`);
    console.log(`🔧 Precisa correção: ${results.needFixing}`);
    
    if (results.needFixing > 0) {
        console.log('\n💡 RECOMENDAÇÕES:');
        console.log('1. Execute o script corrigir-estrutura-modulos.js para corrigir os problemas');
        console.log('2. O script irá:');
        console.log('   - Adicionar module.exports se necessário');
        console.log('   - Trocar "titulo" por "title"');
        console.log('   - Validar JSON antes de salvar');
        console.log('   - Preservar todo o conteúdo pedagógico');
        console.log('   - Criar backup antes das alterações');
    } else if (results.valid === results.found) {
        console.log('\n🎉 Todos os módulos estão com estrutura correta!');
    } else {
        console.log('\n⚠️ Alguns módulos têm estrutura incompleta mas não precisam de correção técnica.');
    }
    
    // Salvar resultado em arquivo
    const logDir = path.dirname(path.join(__dirname, '../logs/verificacao-estrutura-modulos.json'));
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(__dirname, '../logs/verificacao-estrutura-modulos.json');
    fs.writeFileSync(logFile, JSON.stringify(results, null, 2), 'utf8');
    console.log(`\n📄 Log salvo em: ${logFile}`);
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    validateJSON,
    validateModuleStructure,
    extractTitle,
    analyzeModule,
    main
}; 