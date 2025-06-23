const fs = require('fs');
const path = require('path');

// Configurações
const MODULES_DIR = path.join(__dirname, '../public/data');
const BACKUP_DIR = path.join(__dirname, '../backup-estrutura-modulos');
const LOG_FILE = path.join(__dirname, '../logs/correcao-estrutura-modulos.json');

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

// Função para criar backup
function createBackup() {
    console.log('🔒 Criando backup dos módulos atuais...');
    
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    const modules = ['module1.js', 'module2.js', 'module3.js', 'module4.js', 'module5.js', 'module6.js', 'module7.js'];
    
    modules.forEach(moduleFile => {
        const sourcePath = path.join(MODULES_DIR, moduleFile);
        const backupPath = path.join(BACKUP_DIR, moduleFile);
        
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, backupPath);
            console.log(`✅ Backup criado: ${moduleFile}`);
        } else {
            console.log(`⚠️ Arquivo não encontrado: ${moduleFile}`);
        }
    });
}

// Função para detectar o tipo de estrutura do módulo
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

// Função para validar estrutura do módulo
function validateModuleStructure(moduleContent) {
    try {
        const structure = detectModuleStructure(moduleContent);

        // Extrair apenas o objeto para validação JSON
        let jsonToValidate = moduleContent;
        if (structure.hasModuleExports) {
            jsonToValidate = moduleContent.replace(/module\.exports\s*=\s*/, '');
            jsonToValidate = jsonToValidate.replace(/;\s*$/, '');
        } else if (structure.hasConstDeclaration) {
            jsonToValidate = moduleContent.replace(/^const\s+module\d+\s*=\s*/, '');
            jsonToValidate = jsonToValidate.replace(/;\s*$/, '');
        }

        // Validar JSON apenas do objeto
        const jsonValidation = validateJSON(jsonToValidate);

        // Verificar se tem module.exports
        const hasModuleExports = structure.hasModuleExports;
        // Verificar se tem campo 'title' (não 'titulo')
        const hasTitle = structure.hasTitle;
        const hasTitulo = structure.hasTitulo;
        // Verificar se tem estrutura básica de cards
        const hasCards = structure.hasCards;
        // Verificar se tem quiz
        const hasQuiz = structure.hasQuiz;
        // Verificar se tem metadata
        const hasMetadata = structure.hasMetadata;

        return {
            ...structure,
            hasModuleExports,
            hasTitle,
            hasTitulo,
            hasCards,
            hasQuiz,
            hasMetadata,
            jsonValid: jsonValidation.isValid,
            jsonError: jsonValidation.error,
            isValid: hasModuleExports && hasTitle && hasCards && jsonValidation.isValid && !hasTitulo
        };
    } catch (error) {
        return {
            hasModuleExports: false,
            hasTitle: false,
            hasTitulo: false,
            hasCards: false,
            hasQuiz: false,
            hasMetadata: false,
            jsonValid: false,
            jsonError: error.message,
            isValid: false,
            error: error.message
        };
    }
}

// Função para extrair o objeto JSON do módulo
function extractJSONObject(moduleContent) {
    try {
        let jsonContent = moduleContent;
        
        // Remover const moduleX = se existir
        if (jsonContent.match(/^const\s+module\d+\s*=\s*{/)) {
            jsonContent = jsonContent.replace(/^const\s+module\d+\s*=\s*/, '');
        }
        
        // Remover module.exports se existir
        if (jsonContent.includes('module.exports = ')) {
            jsonContent = jsonContent.replace(/module\.exports\s*=\s*/, '');
        }
        
        // Remover ponto e vírgula no final se existir
        jsonContent = jsonContent.replace(/;$/, '');
        
        // Fazer parse do JSON
        return JSON.parse(jsonContent);
    } catch (error) {
        throw new Error(`Erro ao extrair objeto JSON: ${error.message}`);
    }
}

// Função para corrigir estrutura do módulo
function fixModuleStructure(moduleContent, moduleName) {
    let fixedContent = moduleContent;
    let changes = [];
    
    try {
        // 1. Extrair o objeto JSON
        const jsonObject = extractJSONObject(moduleContent);
        
        // 2. Trocar 'titulo' por 'title' no objeto
        if (jsonObject.titulo) {
            jsonObject.title = jsonObject.titulo;
            delete jsonObject.titulo;
            changes.push('Trocado "titulo" por "title" no objeto JSON');
        }
        // 2b. Remover qualquer campo 'titulo' residual (caso venha de outros níveis)
        if ('titulo' in jsonObject) {
            delete jsonObject.titulo;
            changes.push('Removido campo "titulo" residual do objeto JSON');
        }
        // 2c. Remover 'titulo' de cards, quiz, metadata, se existir
        if (Array.isArray(jsonObject.cards)) {
            jsonObject.cards.forEach(card => {
                if (card.titulo) {
                    card.title = card.titulo;
                    delete card.titulo;
                    changes.push('Trocado "titulo" por "title" em um card');
                }
                if ('titulo' in card) {
                    delete card.titulo;
                    changes.push('Removido campo "titulo" residual de um card');
                }
            });
        }
        if (jsonObject.quiz && Array.isArray(jsonObject.quiz.questoes)) {
            jsonObject.quiz.questoes.forEach(q => {
                if (q.titulo) {
                    q.title = q.titulo;
                    delete q.titulo;
                    changes.push('Trocado "titulo" por "title" em uma questão do quiz');
                }
                if ('titulo' in q) {
                    delete q.titulo;
                    changes.push('Removido campo "titulo" residual de uma questão do quiz');
                }
            });
        }
        if (jsonObject.metadata && jsonObject.metadata.titulo) {
            jsonObject.metadata.title = jsonObject.metadata.titulo;
            delete jsonObject.metadata.titulo;
            changes.push('Trocado "titulo" por "title" em metadata');
        }
        if (jsonObject.metadata && 'titulo' in jsonObject.metadata) {
            delete jsonObject.metadata.titulo;
            changes.push('Removido campo "titulo" residual em metadata');
        }
        
        // 3. Gerar novo conteúdo com module.exports
        fixedContent = `module.exports = ${JSON.stringify(jsonObject, null, 2)};`;
        changes.push('Adicionado module.exports e formatado JSON');
        
        // 4. Validar JSON final
        const validation = validateJSON(fixedContent.replace(/module\.exports\s*=\s*/, '').replace(/;$/, ''));
        if (!validation.isValid) {
            throw new Error(`JSON inválido após correção: ${validation.error}`);
        }
        
        return { fixedContent, changes };
        
    } catch (error) {
        // Fallback para método anterior se o novo método falhar
        console.log(`⚠️ Método avançado falhou para ${moduleName}, usando método básico...`);
        
        let fallbackContent = moduleContent;
        let fallbackChanges = [];
        
        // 1. Remover const moduleX = se existir
        if (fallbackContent.match(/^const\s+module\d+\s*=\s*{/)) {
            fallbackContent = fallbackContent.replace(/^const\s+module\d+\s*=\s*/, '');
            fallbackChanges.push('Removido const moduleX =');
        }
        
        // 2. Adicionar module.exports se não existir
        if (!fallbackContent.includes('module.exports')) {
            fallbackContent = `module.exports = ${fallbackContent}`;
            fallbackChanges.push('Adicionado module.exports');
        }
        
        // 3. Trocar 'titulo' por 'title' (preservando o valor)
        if (fallbackContent.includes('"titulo"')) {
            fallbackContent = fallbackContent.replace(/"titulo"/g, '"title"');
            fallbackChanges.push('Trocado "titulo" por "title"');
        } else if (fallbackContent.includes("'titulo'")) {
            fallbackContent = fallbackContent.replace(/'titulo'/g, "'title'");
            fallbackChanges.push("Trocado 'titulo' por 'title'");
        }
        
        return { fixedContent: fallbackContent, changes: fallbackChanges };
    }
}

// Função para processar um módulo
function processModule(moduleFile) {
    const modulePath = path.join(MODULES_DIR, moduleFile);
    
    if (!fs.existsSync(modulePath)) {
        return {
            success: false,
            error: 'Arquivo não encontrado',
            changes: []
        };
    }
    
    try {
        // Ler conteúdo atual
        const originalContent = fs.readFileSync(modulePath, 'utf8');
        
        // Validar estrutura atual
        const validation = validateModuleStructure(originalContent);
        
        // Se já está correto, não fazer nada
        if (validation.isValid) {
            return {
                success: true,
                message: 'Estrutura já está correta',
                changes: [],
                validation
            };
        }
        
        // Corrigir estrutura
        const { fixedContent, changes } = fixModuleStructure(originalContent, moduleFile);
        
        // Validar estrutura corrigida
        const validationAfter = validateModuleStructure(fixedContent);
        
        // Verificar se a correção foi bem-sucedida
        if (!validationAfter.isValid) {
            throw new Error(`Estrutura ainda inválida após correção: ${validationAfter.jsonError || 'Estrutura incompleta'}`);
        }
        
        // Salvar arquivo corrigido
        fs.writeFileSync(modulePath, fixedContent, 'utf8');
        
        return {
            success: true,
            message: 'Estrutura corrigida com sucesso',
            changes,
            validation: validationAfter
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message,
            changes: []
        };
    }
}

// Função principal
function main() {
    console.log('🔧 Iniciando correção da estrutura dos módulos...');
    console.log('📁 Diretório dos módulos:', MODULES_DIR);
    
    // Criar backup
    createBackup();
    
    // Lista de módulos para processar
    const modules = ['module1.js', 'module2.js', 'module3.js', 'module4.js', 'module5.js', 'module6.js', 'module7.js'];
    
    const results = {
        timestamp: new Date().toISOString(),
        totalModules: modules.length,
        processed: 0,
        successful: 0,
        failed: 0,
        modules: {}
    };
    
    console.log('\n📋 Processando módulos...');
    
    modules.forEach(moduleFile => {
        console.log(`\n🔍 Processando: ${moduleFile}`);
        
        const result = processModule(moduleFile);
        results.modules[moduleFile] = result;
        results.processed++;
        
        if (result.success) {
            results.successful++;
            console.log(`✅ ${result.message}`);
            
            // Mostrar detalhes da estrutura detectada
            if (result.validation) {
                const structure = result.validation;
                console.log(`📊 Estrutura detectada:`);
                console.log(`   - Padrão: ${structure.pattern}`);
                console.log(`   - Const declaration: ${structure.hasConstDeclaration ? '✅' : '❌'}`);
                console.log(`   - Module.exports: ${structure.hasModuleExports ? '✅' : '❌'}`);
                console.log(`   - Title: ${structure.hasTitle ? '✅' : '❌'}`);
                console.log(`   - Titulo: ${structure.hasTitulo ? '⚠️' : '✅'}`);
                console.log(`   - Cards: ${structure.hasCards ? '✅' : '❌'}`);
                console.log(`   - Quiz: ${structure.hasQuiz ? '✅' : '❌'}`);
                console.log(`   - Metadata: ${structure.hasMetadata ? '✅' : '❌'}`);
                console.log(`   - JSON válido: ${structure.jsonValid ? '✅' : '❌'}`);
            }
            
            if (result.changes.length > 0) {
                console.log(`📝 Mudanças aplicadas: ${result.changes.join(', ')}`);
            }
        } else {
            results.failed++;
            console.log(`❌ Erro: ${result.error}`);
        }
    });
    
    // Salvar log
    const logDir = path.dirname(LOG_FILE);
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.writeFileSync(LOG_FILE, JSON.stringify(results, null, 2), 'utf8');
    
    // Resumo final
    console.log('\n📊 RESUMO FINAL:');
    console.log(`📁 Total de módulos: ${results.totalModules}`);
    console.log(`✅ Processados com sucesso: ${results.successful}`);
    console.log(`❌ Falhas: ${results.failed}`);
    console.log(`📄 Log salvo em: ${LOG_FILE}`);
    console.log(`🔒 Backup salvo em: ${BACKUP_DIR}`);
    
    if (results.failed === 0) {
        console.log('\n🎉 Todos os módulos foram processados com sucesso!');
        console.log('💡 Agora você pode testar o sistema novamente.');
        
        // Sugerir próximo passo
        console.log('\n📋 PRÓXIMO PASSO RECOMENDADO:');
        console.log('Execute: node scripts/verificar-estrutura-modulos.js');
        console.log('Para confirmar que todos os módulos estão corretos.');
    } else {
        console.log('\n⚠️ Alguns módulos tiveram problemas. Verifique o log para detalhes.');
        console.log('\n🔧 SUGESTÕES:');
        console.log('1. Verifique se os arquivos são JSON válidos');
        console.log('2. Execute novamente o script de verificação');
        console.log('3. Se necessário, restaure o backup e tente novamente');
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    validateJSON,
    createBackup,
    detectModuleStructure,
    validateModuleStructure,
    extractJSONObject,
    fixModuleStructure,
    processModule,
    main
}; 