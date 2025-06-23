const fs = require('fs');
const path = require('path');

// Função detectModuleStructure do script de correção
function detectModuleStructure(moduleContent) {
    const structure = {
        hasConstDeclaration: false,
        hasModuleExports: false,
        hasTitle: false,
        hasTitulo: false,
        hasCards: false,
        hasQuiz: false,
        hasMetadata: false,
        endsWithSemicolon: false,
        pattern: 'unknown'
    };
    
    // Detectar padrão const moduleX = {
    if (moduleContent.match(/^const\s+module\d+\s*=\s*{/)) {
        structure.hasConstDeclaration = true;
        structure.pattern = 'const-declaration';
    }
    
    // Detectar module.exports
    if (moduleContent.includes('module.exports')) {
        structure.hasModuleExports = true;
        structure.pattern = 'module-exports';
    }
    
    // Detectar campos
    structure.hasTitle = /"title"\s*:/g.test(moduleContent) || /'title'\s*:/g.test(moduleContent);
    structure.hasTitulo = /"titulo"\s*:/g.test(moduleContent) || /'titulo'\s*:/g.test(moduleContent);
    structure.hasCards = /"cards"\s*:/g.test(moduleContent) || /'cards'\s*:/g.test(moduleContent);
    structure.hasQuiz = /"quiz"\s*:/g.test(moduleContent) || /'quiz'\s*:/g.test(moduleContent);
    structure.hasMetadata = /"metadata"\s*:/g.test(moduleContent) || /'metadata'\s*:/g.test(moduleContent);
    
    // Detectar se termina com };
    structure.endsWithSemicolon = moduleContent.trim().endsWith('};');
    
    return structure;
}

// Função validateModuleStructure do script de verificação
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

// Testar regex em um módulo específico
function testarRegex() {
    const modulePath = path.join(__dirname, '../public/data/module1.js');
    const content = fs.readFileSync(modulePath, 'utf8');
    
    console.log('🔍 Testando validateModuleStructure do script de verificação');
    console.log('=' .repeat(50));
    
    const validation = validateModuleStructure(content);
    
    console.log('📊 Resultado da validação:');
    console.log(`   - hasModuleExports: ${validation.hasModuleExports}`);
    console.log(`   - hasTitle: ${validation.hasTitle}`);
    console.log(`   - hasTitulo: ${validation.hasTitulo}`);
    console.log(`   - hasCards: ${validation.hasCards}`);
    console.log(`   - hasQuiz: ${validation.hasQuiz}`);
    console.log(`   - hasMetadata: ${validation.hasMetadata}`);
    console.log(`   - jsonValid: ${validation.jsonValid}`);
    console.log(`   - isValid: ${validation.isValid}`);
    console.log(`   - needsFixing: ${validation.needsFixing}`);
    
    // Testar regex individualmente
    console.log('\n🔍 Testando regex individualmente:');
    console.log(`   - /"title"\\s*:/g.test(): ${/"title"\s*:/g.test(content)}`);
    console.log(`   - /'title'\\s*:/g.test(): ${/'title'\s*:/g.test(content)}`);
    console.log(`   - /"titulo"\\s*:/g.test(): ${/"titulo"\s*:/g.test(content)}`);
    console.log(`   - /'titulo'\\s*:/g.test(): ${/'titulo'\s*:/g.test(content)}`);
    
    // Contar matches
    const titleMatches = content.match(/"title"\s*:/g) || [];
    const tituloMatches = content.match(/"titulo"\s*:/g) || [];
    console.log(`\n📝 Contagem de matches:`);
    console.log(`   - "title": ${titleMatches.length}`);
    console.log(`   - "titulo": ${tituloMatches.length}`);
    
    // Testar se há alguma palavra "titulo" em qualquer contexto
    const tituloWord = content.match(/titulo/g) || [];
    console.log(`   - palavra "titulo": ${tituloWord.length}`);
    
    // Mostrar contexto onde "titulo" aparece
    if (tituloWord.length > 0) {
        console.log('\n🔍 Contexto onde "titulo" aparece:');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            if (line.includes('titulo')) {
                console.log(`   Linha ${index + 1}: ${line.trim()}`);
            }
        });
    }
    
    // Testar a lógica de exibição
    console.log('\n🔍 Testando lógica de exibição:');
    console.log(`   - v.hasTitulo: ${validation.hasTitulo}`);
    console.log(`   - v.hasTitulo ? '⚠️ (precisa trocar)' : '✅': ${validation.hasTitulo ? '⚠️ (precisa trocar)' : '✅'}`);
    
    console.log('\n' + '=' .repeat(50));
}

testarRegex(); 