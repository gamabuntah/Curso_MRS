// Script para embaralhar as alternativas da avaliação final
const fs = require('fs');

// Função para embaralhar array usando Fisher-Yates
function embaralharArray(array) {
    const resultado = [...array];
    for (let i = resultado.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
    }
    return resultado;
}

// Função para extrair questões do arquivo
function extrairQuestoes(conteudo) {
    const questoes = [];
    const linhas = conteudo.split('\n');
    let questaoAtual = null;
    let linhasQuestao = [];
    
    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        
        // Verificar se é início de nova questão
        if (linha.match(/^## Questão \d+/)) {
            // Salvar questão anterior se existir
            if (questaoAtual && linhasQuestao.length > 0) {
                questoes.push({
                    numero: questaoAtual,
                    linhas: linhasQuestao
                });
            }
            
            // Extrair número da questão
            const match = linha.match(/^## Questão (\d+)/);
            questaoAtual = parseInt(match[1]);
            linhasQuestao = [linha];
        } else if (linha.match(/^## 📊 RESUMO FINAL/)) {
            // Parar quando chegar no resumo final
            if (questaoAtual && linhasQuestao.length > 0) {
                questoes.push({
                    numero: questaoAtual,
                    linhas: linhasQuestao
                });
            }
            break;
        } else if (questaoAtual) {
            linhasQuestao.push(linha);
        }
    }
    
    return questoes;
}

// Função para renumeração as questões
function renumerationQuestoes(questoes) {
    return questoes.map((questao, index) => {
        const novoNumero = index + 1;
        const novasLinhas = questao.linhas.map(linha => {
            // Substituir número da questão no título
            if (linha.match(/^## Questão \d+/)) {
                return linha.replace(/^## Questão \d+/, `## Questão ${novoNumero}`);
            }
            return linha;
        });
        
        return {
            numero: novoNumero,
            linhas: novasLinhas
        };
    });
}

// Função principal
function embaralharAvaliacao() {
    try {
        console.log('🔄 Iniciando embaralhamento da avaliação final...');
        
        // Ler o arquivo
        const arquivo = 'MRS/Questoes_Av_Final_Padronizadas_COMPLETO_LIMPO.md';
        const conteudo = fs.readFileSync(arquivo, 'utf8');
        
        // Separar cabeçalho, questões e rodapé
        const partes = conteudo.split('## Questão 1');
        const cabeçalho = partes[0];
        const restoConteudo = '## Questão 1' + partes[1];
        
        // Extrair questões
        const questoes = extrairQuestoes(restoConteudo);
        console.log(`📊 Encontradas ${questoes.length} questões para embaralhar`);
        
        // Embaralhar questões
        const questoesEmbaralhadas = embaralharArray(questoes);
        console.log('🎲 Questões embaralhadas com sucesso');
        
        // Renumeration questões
        const questoesRenumeradas = renumerationQuestoes(questoesEmbaralhadas);
        console.log('🔢 Questões renumeration com sucesso');
        
        // Reconstruir conteúdo
        let novoConteudo = cabeçalho;
        
        // Adicionar questões renumeration
        questoesRenumeradas.forEach(questao => {
            novoConteudo += questao.linhas.join('\n') + '\n\n';
        });
        
        // Adicionar resumo final atualizado
        const resumoFinal = `
## 📊 RESUMO FINAL

### **Total de Questões Consolidadas:** ${questoes.length}
### **Duplicatas Removidas:** 6 questões (42, 45, 47, 48, 49, 50)
### **Questões Faltantes Adicionadas:** 7 questões (46-52)
### **Status:** ✅ **QUESTÕES EMBARALHADAS E RENUMERADAS**

### **Distribuição por Módulos (após embaralhamento):**
- **Questões 1-5:** Fundamentos do Saneamento Básico e a PNSB (sem indicação de módulo)
- **Módulo 1:** 2 questões - Fundamentos do Saneamento Básico e a PNSB
- **Módulo 2:** 7 questões - Estrutura do Questionário da PNSB 2024
- **Módulo 3:** 8 questões - Limpeza Urbana e Manejo de Resíduos Sólidos
- **Módulo 4:** 7 questões - MRS em Áreas Especiais e Coleta Seletiva
- **Módulo 5:** 7 questões - Manejo de Resíduos Sólidos Especiais (ESP)
- **Módulo 6:** 6 questões - Unidades de Destinação/Disposição Final (DIS)
- **Módulo 7:** 10 questões - Entidades de Catadores, Veículos e Educação Ambiental

---
**Script executado em:** ${new Date().toLocaleString('pt-BR')}
**Arquivo gerado:** MRS/Questoes_Av_Final_Padronizadas_COMPLETO_LIMPO.md
**Questões únicas:** ${questoes.length}
**Status:** ✅ **EMBARALHAMENTO CONCLUÍDO COM SUCESSO!**
`;
        
        novoConteudo += resumoFinal;
        
        // Salvar arquivo
        const arquivoSaida = 'MRS/Questoes_Av_Final_Padronizadas_COMPLETO_LIMPO.md';
        fs.writeFileSync(arquivoSaida, novoConteudo, 'utf8');
        
        console.log(`✅ Arquivo salvo: ${arquivoSaida}`);
        console.log(`📊 Total de questões processadas: ${questoes.length}`);
        console.log(`🎲 Questões embaralhadas e renumeration com sucesso!`);
        
        // Mostrar ordem das questões originais vs nova ordem
        console.log('\n📋 ORDEM DAS QUESTÕES:');
        console.log('Original → Nova');
        questoesRenumeradas.forEach((questao, index) => {
            const questaoOriginal = questoes.find(q => q.numero === questao.numero);
            console.log(`Questão ${questaoOriginal.numero} → Questão ${index + 1}`);
        });
        
    } catch (error) {
        console.error('❌ Erro ao embaralhar avaliação:', error.message);
    }
}

// Executar script
embaralharAvaliacao(); 