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
        
        // Validar JSON
        const jsonValidation = validateJSON(moduleContent);
        
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

// Testar um módulo específico
function testarModulo() {
    console.log('🔍 Testando análise do module1.js');
    console.log('=' .repeat(50));
    
    const analysis = analyzeModule('module1.js');
    
    if (!analysis.exists) {
        console.log(`❌ ${analysis.error}`);
        return;
    }
    
    console.log(`📝 Título: ${analysis.title}`);
    console.log(`📊 Cards: ${analysis.cardCount}`);
    console.log(`❓ Quizzes: ${analysis.quizCount}`);
    console.log(`❓ Questões: ${analysis.questionCount}`);
    console.log(`📏 Tamanho: ${analysis.contentLength} caracteres`);
    
    const v = analysis.validation;
    console.log(`🔧 Estrutura:`);
    console.log(`  - module.exports: ${v.hasModuleExports ? '✅' : '❌'}`);
    console.log(`  - title: ${v.hasTitle ? '✅' : '❌'}`);
    console.log(`  - titulo: ${v.hasTitulo ? '⚠️ (precisa trocar)' : '✅'}`);
    console.log(`  - cards: ${v.hasCards ? '✅' : '❌'}`);
    console.log(`  - quiz/quizzes: ${v.hasQuizzes ? '✅' : '❌'}`);
    console.log(`  - feedbacks: ${v.hasFeedbacks ? '✅' : '❌'}`);
    console.log(`  - metadata: ${v.hasMetadata ? '✅' : '❌'}`);
    console.log(`  - JSON válido: ${v.jsonValid ? '✅' : '❌'}`);
    
    if (!v.jsonValid) {
        console.log(`  - Erro JSON: ${v.jsonError}`);
    }
    
    if (v.isValid) {
        console.log(`✅ Estrutura válida`);
    } else if (v.needsFixing) {
        console.log(`🔧 Precisa correção`);
    } else {
        console.log(`⚠️ Estrutura incompleta`);
    }
    
    console.log('\n' + '=' .repeat(50));
}

testarModulo(); 