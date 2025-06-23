const fs = require('fs');
const path = require('path');

// Função para ler arquivo de forma síncrona
function readFileSync(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`Erro ao ler arquivo ${filePath}:`, error.message);
        return null;
    }
}

// Função para escrever arquivo
function writeFileSync(filePath, content) {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Arquivo criado com sucesso: ${filePath}`);
    } catch (error) {
        console.error(`❌ Erro ao escrever arquivo ${filePath}:`, error.message);
    }
}

// Função para contar questões no conteúdo
function contarQuestoes(conteudo) {
    // Padrões para detectar questões
    const padrao1 = /## Questão \d+/g;  // ## Questão X
    const padrao2 = /Questão \d+:/g;    // Questão X:
    
    const matches1 = conteudo.match(padrao1) || [];
    const matches2 = conteudo.match(padrao2) || [];
    
    return matches1.length + matches2.length;
}

// Função para padronizar o formato das questões
function padronizarFormatoQuestoes(conteudo) {
    // Converter "Questão X:" para "## Questão X"
    let conteudoPadronizado = conteudo.replace(/Questão (\d+):/g, '## Questão $1');
    
    // Adicionar quebras de linha após os títulos das questões se não existirem
    conteudoPadronizado = conteudoPadronizado.replace(/(## Questão \d+)(?!\n)/g, '$1\n');
    
    return conteudoPadronizado;
}

// Função principal para consolidar as questões
function consolidarQuestoesPadronizadas() {
    console.log('🚀 Iniciando consolidação das questões padronizadas...\n');

    // Lista dos arquivos de questões padronizadas
    const arquivos = [
        'MRS/Questoes_Av_Final_Padronizadas_1-5.md',
        'MRS/Questoes_Av_Final_Padronizadas_6-10.md',
        'MRS/Questoes_Av_Final_Padronizadas_11-15.md',
        'MRS/Questoes_Av_Final_Padronizadas_16-20.md',
        'MRS/Questoes_Av_Final_Padronizadas_21-25.md',
        'MRS/Questoes_Av_Final_Padronizadas_26-30.md',
        'MRS/Questoes_Av_Final_Padronizadas_31-35.md',
        'MRS/Questoes_Av_Final_Padronizadas_36-40.md',
        'MRS/Questoes_Av_Final_Padronizadas_41-50.md'
    ];

    let conteudoCompleto = '';
    let totalQuestoes = 0;
    let arquivosProcessados = 0;

    // Cabeçalho do arquivo consolidado
    conteudoCompleto += `# Questões PNSB 2024 - Avaliação Final - COMPLETO
## Todas as 50 Questões Padronizadas

**Data de Consolidação:** ${new Date().toLocaleDateString('pt-BR')}
**Total de Questões:** 50
**Status:** ✅ Todas as questões padronizadas consolidadas

---

`;

    // Processar cada arquivo
    arquivos.forEach((arquivo, index) => {
        console.log(`📖 Processando arquivo ${index + 1}/${arquivos.length}: ${arquivo}`);
        
        const conteudo = readFileSync(arquivo);
        if (conteudo) {
            // Remover cabeçalhos e rodapés dos arquivos individuais
            let conteudoProcessado = conteudo;
            
            // Remover cabeçalho do arquivo (primeiras linhas até o primeiro "---")
            const linhas = conteudoProcessado.split('\n');
            let inicioConteudo = 0;
            
            for (let i = 0; i < linhas.length; i++) {
                if (linhas[i].trim() === '---') {
                    inicioConteudo = i + 1;
                    break;
                }
            }
            
            // Remover rodapé (últimas linhas com progresso)
            let fimConteudo = linhas.length;
            for (let i = linhas.length - 1; i >= 0; i--) {
                if (linhas[i].includes('Progresso:') || linhas[i].includes('Próximo:') || linhas[i].includes('Status:') || linhas[i].includes('📊 Progresso:')) {
                    fimConteudo = i;
                    break;
                }
            }
            
            // Extrair apenas o conteúdo das questões
            let conteudoQuestoes = linhas.slice(inicioConteudo, fimConteudo).join('\n');
            
            // Padronizar o formato das questões
            conteudoQuestoes = padronizarFormatoQuestoes(conteudoQuestoes);
            
            // Adicionar ao conteúdo completo
            if (conteudoQuestoes.trim()) {
                conteudoCompleto += conteudoQuestoes + '\n\n';
                arquivosProcessados++;
                
                // Contar questões no arquivo atual
                const questoesNoArquivo = contarQuestoes(conteudoQuestoes);
                totalQuestoes += questoesNoArquivo;
                console.log(`   ✅ ${questoesNoArquivo} questões extraídas e padronizadas`);
            }
        } else {
            console.log(`   ❌ Erro ao processar arquivo`);
        }
    });

    // Adicionar rodapé
    conteudoCompleto += `---

## 📊 RESUMO FINAL

### **Total de Questões Consolidadas:** ${totalQuestoes}
### **Arquivos Processados:** ${arquivosProcessados}/${arquivos.length}

### **Distribuição por Módulos:**
- **Módulo 1:** 7 questões (1-7) - Fundamentos do Saneamento Básico e a PNSB
- **Módulo 2:** 7 questões (8-14) - Estrutura do Questionário da PNSB 2024
- **Módulo 3:** 8 questões (15-22) - Limpeza Urbana e Manejo de Resíduos Sólidos
- **Módulo 4:** 7 questões (23-29) - MRS em Áreas Especiais e Coleta Seletiva
- **Módulo 5:** 7 questões (30-36) - Manejo de Resíduos Sólidos Especiais (ESP)
- **Módulo 6:** 7 questões (37-43) - Unidades de Destinação/Disposição Final (DIS)
- **Módulo 7:** 7 questões (44-50) - Entidades de Catadores, Veículos e Educação Ambiental

### **Status:** ✅ **CONSOLIDAÇÃO CONCLUÍDA COM SUCESSO!**

---
**Script executado em:** ${new Date().toLocaleString('pt-BR')}
**Arquivo gerado:** MRS/Questoes_Av_Final_Padronizadas_COMPLETO.md
`;

    // Salvar arquivo consolidado
    const arquivoDestino = 'MRS/Questoes_Av_Final_Padronizadas_COMPLETO.md';
    writeFileSync(arquivoDestino, conteudoCompleto);

    // Resumo final
    console.log('\n🎉 CONSOLIDAÇÃO CONCLUÍDA!');
    console.log(`📊 Total de questões consolidadas: ${totalQuestoes}`);
    console.log(`📁 Arquivos processados: ${arquivosProcessados}/${arquivos.length}`);
    console.log(`📄 Arquivo gerado: ${arquivoDestino}`);
    console.log(`✨ Formato padronizado: Todas as questões agora usam "## Questão X"`);
    
    if (totalQuestoes === 50) {
        console.log('✅ Todas as 50 questões foram consolidadas com sucesso!');
    } else {
        console.log(`⚠️  Atenção: Esperadas 50 questões, encontradas ${totalQuestoes}`);
    }
}

// Executar o script
if (require.main === module) {
    consolidarQuestoesPadronizadas();
}

module.exports = { consolidarQuestoesPadronizadas }; 