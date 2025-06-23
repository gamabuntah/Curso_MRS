#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📄 PROCESSANDO ARQUIVOS .TXT DOS MÓDULOS MRS...\n');

let processamentoOk = true;
const modulosProcessados = [];

// Função para extrair listas do conteúdo
function extrairListas(conteudo) {
    const listas = [];
    // Regex melhorado para capturar listas com bullets principais e sub-bullets
    const regexLista = /([•\-\*]\s+[^\n]+(?:\n[◦\-\*]\s+[^\n]+)*)/g;
    let match;
    
    while ((match = regexLista.exec(conteudo)) !== null) {
        listas.push(match[1].trim());
    }
    
    return listas;
}

// Função para extrair exemplos do conteúdo
function extrairExemplos(conteudo) {
    const exemplos = [];
    // Regex melhorado para capturar exemplos
    const regexExemplo = /(?:por exemplo|como|caso|situação|exemplo|Exemplos?)[:.]?\s*([^.\n]+)/gi;
    let match;
    
    while ((match = regexExemplo.exec(conteudo)) !== null) {
        exemplos.push(match[1].trim());
    }
    
    return exemplos;
}

// Função para extrair pontos críticos do conteúdo
function extrairPontosCriticos(conteudo) {
    const pontos = [];
    // Regex melhorado para capturar pontos importantes
    const regexPontos = /(?:importante|atenção|dica|nota|crítico|fundamental|essencial)[:.]?\s*([^.\n]+)/gi;
    let match;
    
    while ((match = regexPontos.exec(conteudo)) !== null) {
        pontos.push(match[1].trim());
    }
    
    return pontos;
}

// Função para processar um arquivo .txt
function processarArquivoTxt(caminhoArquivo, numeroModulo) {
    try {
        const conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
        
        // 1. Remover referências bibliográficas [1], [2], [3], etc.
        const conteudoLimpo = conteudo.replace(/\[\d+\]/g, '');
        
        // 2. Extrair título (primeira linha, removendo [2] se presente)
        const linhas = conteudoLimpo.split('\n');
        const titulo = linhas[0].replace(/\[\d+\]/, '').trim();
        
        // 3. Extrair resumo (seção após "Resumo" até a primeira seção numerada)
        const resumoMatch = conteudoLimpo.match(/Resumo\s*\n([\s\S]*?)(?=\d+\.\d+\s|$)/);
        const resumo = resumoMatch ? resumoMatch[1].trim() : '';
        
        // 4. Extrair seções numeradas (1.1, 1.2, 1.3, etc.) - regex melhorado
        const secoes = [];
        // Dividir o conteúdo por seções numeradas
        const partes = conteudoLimpo.split(/(?=^\d+\.\d+\s)/m);
        
        for (let i = 1; i < partes.length; i++) { // Pular a primeira parte (antes da primeira seção)
            const parte = partes[i].trim();
            const match = parte.match(/^(\d+\.\d+)\s+([^\n]+)/);
            
            if (match) {
                const numero = match[1];
                const titulo = match[2].trim();
                // Pegar todo o conteúdo após o título, removendo o título da primeira linha
                const conteudo = parte.replace(/^\d+\.\d+\s+[^\n]+\n?/, '').trim();
                
                secoes.push({
                    numero,
                    titulo,
                    conteudo
                });
            }
        }
        
        // 5. Extrair elementos especiais
        const listas = extrairListas(conteudoLimpo);
        const exemplos = extrairExemplos(conteudoLimpo);
        const pontosCriticos = extrairPontosCriticos(conteudoLimpo);
        
        // 6. Criar objeto do módulo processado
        const moduloProcessado = {
            id: numeroModulo,
            titulo,
            resumo,
            secoes,
            listas,
            exemplos,
            pontosCriticos,
            audio: `Curso MRS - Mod ${numeroModulo}.wav`,
            conteudoOriginal: conteudoLimpo,
            metadata: {
                linhasOriginais: linhas.length,
                secoesEncontradas: secoes.length,
                listasEncontradas: listas.length,
                exemplosEncontrados: exemplos.length,
                pontosCriticosEncontrados: pontosCriticos.length,
                dataProcessamento: new Date().toISOString()
            }
        };
        
        return moduloProcessado;
        
    } catch (error) {
        console.log(`❌ Erro ao processar arquivo ${caminhoArquivo}: ${error.message}`);
        return null;
    }
}

// Lista de arquivos .txt dos módulos MRS
const arquivosTxt = [
    {
        numero: 1,
        arquivo: 'Módulo 1 Introdução ao Saneamento B.txt'
    },
    {
        numero: 2,
        arquivo: 'Módulo 2 Estrutura do Questionário.txt'
    },
    {
        numero: 3,
        arquivo: 'Módulo 3 Aspectos Legais, Terceiriz.txt'
    },
    {
        numero: 4,
        arquivo: 'Módulo 4 MRS em Áreas Especiais e C.txt'
    },
    {
        numero: 5,
        arquivo: 'Módulo 5 Manejo de Resíduos Sólidos.txt'
    },
    {
        numero: 6,
        arquivo: 'Módulo 6 Unidades de DestinaçãoDisp.txt'
    },
    {
        numero: 7,
        arquivo: 'Módulo 7 Entidades de Catadores, Ve.txt'
    }
];

// Processar cada arquivo
console.log('📁 Processando arquivos .txt:');
arquivosTxt.forEach(item => {
    const caminhoArquivo = path.join('MRS', item.arquivo);
    
    if (fs.existsSync(caminhoArquivo)) {
        console.log(`\n📄 Processando ${item.arquivo}:`);
        
        const moduloProcessado = processarArquivoTxt(caminhoArquivo, item.numero);
        
        if (moduloProcessado) {
            modulosProcessados.push(moduloProcessado);
            
            console.log(`   ✅ Título: ${moduloProcessado.titulo}`);
            console.log(`   📝 Seções: ${moduloProcessado.secoes.length}`);
            console.log(`   📋 Listas: ${moduloProcessado.listas.length}`);
            console.log(`   📝 Exemplos: ${moduloProcessado.exemplos.length}`);
            console.log(`   ⚠️  Pontos críticos: ${moduloProcessado.pontosCriticos.length}`);
            console.log(`   🎵 Áudio: ${moduloProcessado.audio}`);
            
            // Verificar se o resumo foi extraído
            if (moduloProcessado.resumo) {
                console.log(`   📖 Resumo: ${moduloProcessado.resumo.length} caracteres`);
            } else {
                console.log(`   ⚠️  Resumo não encontrado`);
            }
            
        } else {
            console.log(`   ❌ Falha no processamento`);
            processamentoOk = false;
        }
    } else {
        console.log(`❌ Arquivo não encontrado: ${item.arquivo}`);
        processamentoOk = false;
    }
});

// Verificar se todos os módulos foram processados
console.log('\n📊 RESUMO DO PROCESSAMENTO:');
console.log(`   📁 Arquivos processados: ${modulosProcessados.length}/7`);

if (modulosProcessados.length === 7) {
    console.log('   ✅ Todos os módulos processados com sucesso');
} else {
    console.log(`   ❌ Faltam ${7 - modulosProcessados.length} módulos`);
    processamentoOk = false;
}

// Verificar qualidade do processamento
modulosProcessados.forEach(modulo => {
    if (modulo.secoes.length === 0) {
        console.log(`   ⚠️  Módulo ${modulo.id}: Nenhuma seção encontrada`);
    }
    
    if (modulo.resumo.length === 0) {
        console.log(`   ⚠️  Módulo ${modulo.id}: Resumo não encontrado`);
    }
    
    if (modulo.conteudoOriginal.length < 1000) {
        console.log(`   ⚠️  Módulo ${modulo.id}: Conteúdo muito pequeno`);
    }
});

// Salvar módulos processados em arquivo temporário
console.log('\n💾 Salvando módulos processados:');
try {
    if (!fs.existsSync('logs')) {
        fs.mkdirSync('logs');
    }
    
    const arquivoProcessados = path.join('logs', 'modulos-processados.json');
    fs.writeFileSync(arquivoProcessados, JSON.stringify(modulosProcessados, null, 2), 'utf8');
    console.log('✅ Módulos processados salvos em logs/modulos-processados.json');
    
    // Criar resumo do processamento
    const resumoProcessamento = {
        data: new Date().toISOString(),
        totalModulos: modulosProcessados.length,
        modulosProcessados: modulosProcessados.map(m => ({
            id: m.id,
            titulo: m.titulo,
            secoes: m.secoes.length,
            listas: m.listas.length,
            exemplos: m.exemplos.length,
            pontosCriticos: m.pontosCriticos.length
        })),
        status: processamentoOk ? 'SUCESSO' : 'COM_ERROS'
    };
    
    fs.writeFileSync(path.join('logs', 'resumo-processamento.json'), JSON.stringify(resumoProcessamento, null, 2), 'utf8');
    console.log('✅ Resumo do processamento salvo em logs/resumo-processamento.json');
    
} catch (error) {
    console.log(`❌ Erro ao salvar módulos processados: ${error.message}`);
    processamentoOk = false;
}

// Resultado final
console.log('\n' + '='.repeat(50));

if (processamentoOk && modulosProcessados.length === 7) {
    console.log('🎉 PROCESSAMENTO CONCLUÍDO COM SUCESSO!');
    console.log('✅ Todos os 7 módulos processados');
    console.log('✅ Referências bibliográficas removidas');
    console.log('✅ Estrutura preservada');
    console.log('✅ Elementos especiais extraídos');
    console.log('✅ Módulos prontos para criação de cards');
    process.exit(0);
} else {
    console.log('⚠️  PROCESSAMENTO CONCLUÍDO COM PROBLEMAS!');
    console.log('⚠️  Verifique os erros acima antes de continuar.');
    process.exit(1);
}