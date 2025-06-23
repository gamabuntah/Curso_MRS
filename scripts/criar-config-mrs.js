#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('⚙️  CRIANDO CONFIGURAÇÃO MRS...\n');

// Função para encontrar arquivos de módulos reais
function encontrarArquivosModulos() {
    const arquivos = fs.readdirSync('MRS').filter(f => f.endsWith('.txt'));
    const modulos = [];
    
    for (let i = 1; i <= 7; i++) {
        const arquivosModulo = arquivos.filter(f => f.match(new RegExp(`^Módulo ${i} .+\.txt$`)));
        if (arquivosModulo.length > 0) {
            modulos.push({
                id: i,
                arquivo: arquivosModulo[0],
                audio: `Curso MRS - Mod ${i}.wav`
            });
        }
    }
    
    return modulos;
}

// Função para verificar se arquivos existem
function verificarArquivos(modulos) {
    console.log('🔍 Verificando existência dos arquivos...');
    let todosExistem = true;
    
    modulos.forEach(modulo => {
        const arquivoTxt = path.join('MRS', modulo.arquivo);
        const arquivoAudio = path.join('MRS', 'Audios', modulo.audio);
        
        if (!fs.existsSync(arquivoTxt)) {
            console.log(`❌ Arquivo não encontrado: ${modulo.arquivo}`);
            todosExistem = false;
        } else {
            console.log(`✅ ${modulo.arquivo} - OK`);
        }
        
        if (!fs.existsSync(arquivoAudio)) {
            console.log(`❌ Áudio não encontrado: ${modulo.audio}`);
            todosExistem = false;
        } else {
            console.log(`✅ ${modulo.audio} - OK`);
        }
    });
    
    return todosExistem;
}

// Função para fazer backup da configuração anterior
function fazerBackupConfig() {
    if (fs.existsSync('config-sistema.json')) {
        const backupPath = `config-sistema-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        try {
            fs.copyFileSync('config-sistema.json', backupPath);
            console.log(`💾 Backup da configuração anterior salvo: ${backupPath}`);
            return true;
        } catch (error) {
            console.log(`⚠️  Não foi possível fazer backup: ${error.message}`);
            return false;
        }
    }
    return true;
}

// Encontrar arquivos reais dos módulos
const modulosReais = encontrarArquivosModulos();

if (modulosReais.length !== 7) {
    console.log(`❌ Erro: Encontrados ${modulosReais.length} módulos (esperado: 7)`);
    process.exit(1);
}

// Verificar se todos os arquivos existem
if (!verificarArquivos(modulosReais)) {
    console.log('❌ Erro: Alguns arquivos não foram encontrados');
    process.exit(1);
}

// Fazer backup da configuração anterior
fazerBackupConfig();

// Títulos dos módulos baseados no conteúdo real
const titulosModulos = [
    "Introdução ao Saneamento Básico e Fundamentos",
    "Estrutura do Questionário e Caracterização do Prestador", 
    "Aspectos Legais, Terceirização e Coleta Convencional",
    "MRS em Áreas Especiais e Coleta Seletiva",
    "Manejo de Resíduos Sólidos Especiais",
    "Unidades de Destinação e Disposição Final",
    "Entidades de Catadores, Veículos e Educação Ambiental"
];

// Configuração específica para o curso MRS
const configMRS = {
    curso: {
        nome: "Manejo de Resíduos Sólidos",
        sigla: "MRS",
        descricao: "Capacitação em Limpeza e Manejo de Resíduos Sólidos",
        versao: "1.0.0",
        dataCriacao: new Date().toISOString()
    },
    sistema: {
        portas: {
            backend: 3002,
            frontend: 8001
        },
        modulos: {
            total: 7,
            questoesPorModulo: 15,
            avaliacaoFinal: 50,
            totalQuestoes: 155
        },
        layout: {
            paletaCores: {
                primaria: "#2B2D3A",
                secundaria: "#6C63FF",
                accent: "#00E599",
                fundo: "#F5F6FA",
                texto: "#22223B"
            },
            tiposCards: [
                "default",
                "dica",
                "atencao",
                "exemplo",
                "duvidas",
                "resumo visual"
            ]
        }
    },
    modulos: modulosReais.map((modulo, index) => ({
        id: modulo.id,
        titulo: titulosModulos[index],
        arquivo: modulo.arquivo,
        audio: modulo.audio
    })),
    certificado: {
        titulo: "Certificado de Conclusão",
        subtitulo: "Manejo de Resíduos Sólidos",
        emissor: "Sistema de Capacitação MRS",
        validade: "Indefinida",
        incluirQRCode: true,
        incluirData: true,
        incluirNota: true
    },
    transformacao: {
        dataInicio: new Date().toISOString(),
        fase: "configuracao",
        scriptsExecutados: ["criar-config-mrs.js"],
        status: "em_andamento"
    }
};

// Salvar configuração
try {
    fs.writeFileSync('config-sistema.json', JSON.stringify(configMRS, null, 2), 'utf8');
    console.log('\n✅ Arquivo config-sistema.json criado com sucesso!');
    
    // Verificar se foi criado corretamente
    const configVerificada = JSON.parse(fs.readFileSync('config-sistema.json', 'utf8'));
    
    if (configVerificada.curso.sigla === 'MRS' && configVerificada.sistema.modulos.total === 7) {
        console.log('✅ Configuração validada - MRS com 7 módulos');
    } else {
        throw new Error('Configuração inválida');
    }
    
    // Mostrar resumo da configuração
    console.log('\n📋 RESUMO DA CONFIGURAÇÃO MRS:');
    console.log(`   🎓 Curso: ${configMRS.curso.nome}`);
    console.log(`   📊 Módulos: ${configMRS.sistema.modulos.total}`);
    console.log(`   ❓ Questões por módulo: ${configMRS.sistema.modulos.questoesPorModulo}`);
    console.log(`   🏁 Avaliação final: ${configMRS.sistema.modulos.avaliacaoFinal} questões`);
    console.log(`   📡 Backend: porta ${configMRS.sistema.portas.backend}`);
    console.log(`   🌐 Frontend: porta ${configMRS.sistema.portas.frontend}`);
    
    console.log('\n📁 ARQUIVOS DOS MÓDULOS:');
    configMRS.modulos.forEach(modulo => {
        console.log(`   📖 Módulo ${modulo.id}: ${modulo.arquivo}`);
    });
    
    console.log('\n🎉 CONFIGURAÇÃO MRS CRIADA COM SUCESSO!');
    process.exit(0);
    
} catch (error) {
    console.log(`❌ Erro ao criar configuração: ${error.message}`);
    process.exit(1);
} 