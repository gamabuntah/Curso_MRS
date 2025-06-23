const fs = require('fs');
const path = require('path');
const { detectModuleStructure, validateModuleStructure, extractJSONObject, fixModuleStructure } = require('./corrigir-estrutura-modulos.js');

// Configurações
const MODULES_DIR = path.join(__dirname, '../public/data');

// Função para testar um módulo específico
function testModule(moduleFile) {
    console.log(`🧪 Testando módulo: ${moduleFile}`);
    console.log('=' .repeat(50));
    
    const modulePath = path.join(MODULES_DIR, moduleFile);
    
    if (!fs.existsSync(modulePath)) {
        console.log(`❌ Arquivo não encontrado: ${modulePath}`);
        return;
    }
    
    try {
        // Ler conteúdo original
        const originalContent = fs.readFileSync(modulePath, 'utf8');
        console.log(`📄 Tamanho do arquivo: ${originalContent.length} caracteres`);
        
        // 1. Detectar estrutura
        console.log('\n🔍 1. DETECÇÃO DE ESTRUTURA:');
        const structure = detectModuleStructure(originalContent);
        console.log(`   - Padrão detectado: ${structure.pattern}`);
        console.log(`   - Const declaration: ${structure.hasConstDeclaration}`);
        console.log(`   - Module.exports: ${structure.hasModuleExports}`);
        console.log(`   - Title: ${structure.hasTitle}`);
        console.log(`   - Titulo: ${structure.hasTitulo}`);
        console.log(`   - Cards: ${structure.hasCards}`);
        console.log(`   - Quiz: ${structure.hasQuiz}`);
        console.log(`   - Metadata: ${structure.hasMetadata}`);
        console.log(`   - Termina com };: ${structure.endsWithSemicolon}`);
        
        // 2. Validar estrutura atual
        console.log('\n✅ 2. VALIDAÇÃO ATUAL:');
        const validation = validateModuleStructure(originalContent);
        console.log(`   - Estrutura válida: ${validation.isValid}`);
        console.log(`   - JSON válido: ${validation.jsonValid}`);
        if (!validation.jsonValid) {
            console.log(`   - Erro JSON: ${validation.jsonError}`);
        }
        
        // 3. Extrair objeto JSON
        console.log('\n📦 3. EXTRAÇÃO DE OBJETO JSON:');
        try {
            const jsonObject = extractJSONObject(originalContent);
            console.log(`   ✅ Objeto extraído com sucesso`);
            console.log(`   - ID: ${jsonObject.id}`);
            console.log(`   - Título: ${jsonObject.titulo || jsonObject.title || 'N/A'}`);
            console.log(`   - Cards: ${jsonObject.cards ? jsonObject.cards.length : 0}`);
            console.log(`   - Quiz: ${jsonObject.quiz ? 'Sim' : 'Não'}`);
            console.log(`   - Metadata: ${jsonObject.metadata ? 'Sim' : 'Não'}`);
        } catch (error) {
            console.log(`   ❌ Erro na extração: ${error.message}`);
        }
        
        // 4. Testar correção
        console.log('\n🔧 4. TESTE DE CORREÇÃO:');
        try {
            const { fixedContent, changes } = fixModuleStructure(originalContent, moduleFile);
            console.log(`   ✅ Correção aplicada com sucesso`);
            console.log(`   - Mudanças: ${changes.join(', ')}`);
            
            // Validar estrutura corrigida
            const validationAfter = validateModuleStructure(fixedContent);
            console.log(`   - Estrutura após correção: ${validationAfter.isValid}`);
            console.log(`   - JSON após correção: ${validationAfter.jsonValid}`);
            
            if (!validationAfter.jsonValid) {
                console.log(`   - Erro JSON após correção: ${validationAfter.jsonError}`);
            }
            
            // Mostrar diferenças
            console.log('\n📊 5. COMPARAÇÃO:');
            console.log(`   - Antes: ${originalContent.length} caracteres`);
            console.log(`   - Depois: ${fixedContent.length} caracteres`);
            console.log(`   - Diferença: ${fixedContent.length - originalContent.length} caracteres`);
            
            // Mostrar início do arquivo corrigido
            console.log('\n📝 6. INÍCIO DO ARQUIVO CORRIGIDO:');
            const firstLines = fixedContent.split('\n').slice(0, 5).join('\n');
            console.log(firstLines);
            
            // Mostrar final do arquivo corrigido
            console.log('\n📝 7. FINAL DO ARQUIVO CORRIGIDO:');
            const lastLines = fixedContent.split('\n').slice(-3).join('\n');
            console.log(lastLines);
            
            // Testar extração do JSON corrigido
            console.log('\n🔍 8. TESTE DE EXTRAÇÃO APÓS CORREÇÃO:');
            try {
                const jsonObjectAfter = extractJSONObject(fixedContent);
                console.log(`   ✅ Extração após correção: OK`);
                console.log(`   - Título: ${jsonObjectAfter.title || 'N/A'}`);
            } catch (error) {
                console.log(`   ❌ Erro na extração após correção: ${error.message}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Erro na correção: ${error.message}`);
        }
        
    } catch (error) {
        console.log(`❌ Erro ao processar arquivo: ${error.message}`);
    }
    
    console.log('\n' + '=' .repeat(50));
}

// Função principal
function main() {
    console.log('🧪 TESTE DO SCRIPT DE CORREÇÃO DE ESTRUTURA');
    console.log('Este script testa as melhorias no script de correção');
    console.log('');
    
    // Testar com module1.js
    testModule('module1.js');
    
    console.log('\n🎯 CONCLUSÃO:');
    console.log('Se todos os testes passaram, o script está funcionando corretamente.');
    console.log('Agora você pode executar o script de correção real.');
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    testModule,
    main
}; 