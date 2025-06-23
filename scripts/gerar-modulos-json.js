#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📄 GERANDO ARQUIVOS JSON DOS MÓDULOS MRS...\n');

let geracaoOk = true;
const modulosGerados = [];

// Função para gerar arquivo JSON de um módulo
function gerarArquivoModulo(moduloComCards) {
    try {
        const moduloJSON = {
            id: moduloComCards.id,
            titulo: moduloComCards.titulo,
            audio: moduloComCards.audio,
            cards: moduloComCards.cards,
            quiz: {
                questoes: [] // Será preenchido pelo script de questões
            },
            metadata: {
                secoes: moduloComCards.metadata.secoesEncontradas || 0,
                listas: moduloComCards.metadata.listasEncontradas || 0,
                exemplos: moduloComCards.metadata.exemplosEncontrados || 0,
                pontosCriticos: moduloComCards.metadata.pontosCriticosEncontrados || 0,
                cardsCriados: moduloComCards.cards.length,
                tiposCards: moduloComCards.cards.map(card => card.type),
                dataGeracao: new Date().toISOString()
            }
        };
        
        // Salvar arquivo
        const caminhoArquivo = `public/data/module${moduloComCards.id}.js`;
        const conteudoArquivo = `const module${moduloComCards.id} = ${JSON.stringify(moduloJSON, null, 2)};\n\nif (typeof module !== 'undefined' && module.exports) {\n    module.exports = module${moduloComCards.id};\n}`;
        
        fs.writeFileSync(caminhoArquivo, conteudoArquivo, 'utf8');
        console.log(`✅ Módulo ${moduloComCards.id} gerado: ${caminhoArquivo}`);
        
        return moduloJSON;
        
    } catch (error) {
        console.log(`❌ Erro ao gerar módulo ${moduloComCards.id}: ${error.message}`);
        return null;
    }
}

// Carregar módulos com cards
console.log('📂 Carregando módulos com cards:');
let modulosComCards = [];

try {
    const arquivoCards = path.join('logs', 'modulos-com-cards.json');
    
    if (fs.existsSync(arquivoCards)) {
        modulosComCards = JSON.parse(fs.readFileSync(arquivoCards, 'utf8'));
        console.log(`✅ ${modulosComCards.length} módulos com cards carregados`);
    } else {
        console.log('❌ Arquivo de módulos com cards não encontrado!');
        console.log('ℹ️  Execute primeiro o script criar-cards-inteligentes.js');
        process.exit(1);
    }
} catch (error) {
    console.log(`❌ Erro ao carregar módulos com cards: ${error.message}`);
    process.exit(1);
}

// Verificar se a pasta data existe
console.log('\n📁 Verificando pasta public/data:');
const dataPath = path.join('public', 'data');

if (!fs.existsSync(dataPath)) {
    try {
        fs.mkdirSync(dataPath, { recursive: true });
        console.log('✅ Pasta public/data criada');
    } catch (error) {
        console.log(`❌ Erro ao criar pasta public/data: ${error.message}`);
        geracaoOk = false;
    }
} else {
    console.log('✅ Pasta public/data já existe');
}

// Gerar arquivos JSON para cada módulo
console.log('\n📄 Gerando arquivos JSON dos módulos:');
modulosComCards.forEach(modulo => {
    console.log(`\n📄 Processando Módulo ${modulo.id}:`);
    
    const moduloJSON = gerarArquivoModulo(modulo);
    
    if (moduloJSON) {
        modulosGerados.push(moduloJSON);
        
        console.log(`   ✅ Título: ${moduloJSON.titulo}`);
        console.log(`   🎵 Áudio: ${moduloJSON.audio}`);
        console.log(`   🎴 Cards: ${moduloJSON.cards.length}`);
        console.log(`   📊 Seções: ${moduloJSON.metadata.secoes}`);
        console.log(`   📋 Listas: ${moduloJSON.metadata.listas}`);
        console.log(`   📝 Exemplos: ${moduloJSON.metadata.exemplos}`);
        console.log(`   ⚠️  Pontos críticos: ${moduloJSON.metadata.pontosCriticos}`);
        
        // Verificar se o arquivo foi criado corretamente
        const caminhoArquivo = `public/data/module${modulo.id}.js`;
        if (fs.existsSync(caminhoArquivo)) {
            const stats = fs.statSync(caminhoArquivo);
            const tamanhoKB = Math.round(stats.size / 1024);
            console.log(`   💾 Arquivo: ${tamanhoKB}KB`);
        } else {
            console.log(`   ❌ Arquivo não foi criado!`);
            geracaoOk = false;
        }
        
    } else {
        console.log(`   ❌ Falha na geração do módulo ${modulo.id}`);
        geracaoOk = false;
    }
});

// Verificar se todos os módulos foram gerados
console.log('\n📊 RESUMO DA GERAÇÃO:');
console.log(`   📄 Módulos gerados: ${modulosGerados.length}/7`);

if (modulosGerados.length === 7) {
    console.log('   ✅ Todos os módulos gerados com sucesso');
} else {
    console.log(`   ❌ Faltam ${7 - modulosGerados.length} módulos`);
    geracaoOk = false;
}

// Verificar arquivos gerados
console.log('\n🔍 Verificando arquivos gerados:');
const arquivosEsperados = [
    'public/data/module1.js',
    'public/data/module2.js',
    'public/data/module3.js',
    'public/data/module4.js',
    'public/data/module5.js',
    'public/data/module6.js',
    'public/data/module7.js'
];

arquivosEsperados.forEach(arquivo => {
    if (fs.existsSync(arquivo)) {
        const stats = fs.statSync(arquivo);
        const tamanhoKB = Math.round(stats.size / 1024);
        console.log(`   ✅ ${arquivo} - ${tamanhoKB}KB`);
        
        // Verificar se o JSON é válido
        try {
            const conteudo = fs.readFileSync(arquivo, 'utf8');
            if (conteudo.includes('module.exports')) {
                console.log(`   ✅ ${arquivo} - Estrutura válida`);
            } else {
                console.log(`   ⚠️  ${arquivo} - Estrutura pode estar incorreta`);
            }
        } catch (error) {
            console.log(`   ❌ ${arquivo} - Erro ao verificar estrutura`);
            geracaoOk = false;
        }
    } else {
        console.log(`   ❌ ${arquivo} - NÃO ENCONTRADO!`);
        geracaoOk = false;
    }
});

// Criar arquivo de índice dos módulos
console.log('\n📋 Criando arquivo de índice dos módulos:');
try {
    const indiceModulos = {
        curso: "Manejo de Resíduos Sólidos",
        sigla: "MRS",
        totalModulos: modulosGerados.length,
        modulos: modulosGerados.map(m => ({
            id: m.id,
            titulo: m.titulo,
            audio: m.audio,
            cards: m.cards.length,
            secoes: m.metadata.secoes
        })),
        dataGeracao: new Date().toISOString()
    };
    
    const arquivoIndice = path.join('public', 'data', 'indice-modulos.json');
    fs.writeFileSync(arquivoIndice, JSON.stringify(indiceModulos, null, 2), 'utf8');
    console.log('✅ Índice dos módulos criado: public/data/indice-modulos.json');
    
} catch (error) {
    console.log(`❌ Erro ao criar índice dos módulos: ${error.message}`);
    geracaoOk = false;
}

// Salvar resumo da geração
console.log('\n💾 Salvando resumo da geração:');
try {
    const resumoGeracao = {
        data: new Date().toISOString(),
        totalModulos: modulosGerados.length,
        arquivosGerados: arquivosEsperados.filter(arquivo => fs.existsSync(arquivo)),
        modulos: modulosGerados.map(m => ({
            id: m.id,
            titulo: m.titulo,
            cards: m.cards.length,
            secoes: m.metadata.secoes,
            tamanhoArquivo: fs.existsSync(`public/data/module${m.id}.js`) ? 
                Math.round(fs.statSync(`public/data/module${m.id}.js`).size / 1024) : 0
        })),
        status: geracaoOk ? 'SUCESSO' : 'COM_ERROS'
    };
    
    fs.writeFileSync(path.join('logs', 'resumo-geracao-modulos.json'), JSON.stringify(resumoGeracao, null, 2), 'utf8');
    console.log('✅ Resumo da geração salvo em logs/resumo-geracao-modulos.json');
    
} catch (error) {
    console.log(`❌ Erro ao salvar resumo da geração: ${error.message}`);
    geracaoOk = false;
}

// Verificar qualidade dos módulos gerados
console.log('\n🔍 Verificando qualidade dos módulos:');
modulosGerados.forEach(modulo => {
    if (modulo.cards.length < 2) {
        console.log(`   ⚠️  Módulo ${modulo.id}: Apenas ${modulo.cards.length} cards`);
    }
    
    if (modulo.metadata.secoes === 0) {
        console.log(`   ⚠️  Módulo ${modulo.id}: Nenhuma seção encontrada`);
    }
    
    if (!modulo.audio) {
        console.log(`   ⚠️  Módulo ${modulo.id}: Áudio não definido`);
    }
    
    const temResumo = modulo.cards.some(card => card.title.includes('Resumo'));
    const temConteudo = modulo.cards.some(card => card.title.includes('Conteúdo'));
    
    if (!temResumo || !temConteudo) {
        console.log(`   ⚠️  Módulo ${modulo.id}: Faltam cards essenciais`);
        geracaoOk = false;
    }
});

// Resultado final
console.log('\n' + '='.repeat(50));

if (geracaoOk && modulosGerados.length === 7) {
    console.log('🎉 GERAÇÃO DE MÓDULOS JSON CONCLUÍDA COM SUCESSO!');
    console.log('✅ Todos os 7 módulos gerados');
    console.log('✅ Arquivos JSON válidos criados');
    console.log('✅ Estrutura de módulos preservada');
    console.log('✅ Índice dos módulos criado');
    console.log('✅ Módulos prontos para geração de questões');
    process.exit(0);
} else {
    console.log('⚠️  GERAÇÃO CONCLUÍDA COM PROBLEMAS!');
    console.log('⚠️  Verifique os erros acima antes de continuar.');
    process.exit(1);
} 