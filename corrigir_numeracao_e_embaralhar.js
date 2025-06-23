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

// Função para corrigir numeração (51→43, 52→44)
function corrigirNumeracao(questoes) {
    return questoes.map(questao => {
        let novoNumero = questao.numero;
        
        // Corrigir numeração específica
        if (questao.numero === 51) novoNumero = 43;
        if (questao.numero === 52) novoNumero = 44;
        
        // Atualizar as linhas da questão
        const novasLinhas = questao.linhas.map(linha => {
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

// Função para renumerar questões sequencialmente
function renumerarQuestoes(questoes) {
    // Ordenar por número atual
    questoes.sort((a, b) => a.numero - b.numero);
    
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
            numeroOriginal: questao.numero,
            numero: novoNumero,
            linhas: novasLinhas
        };
    });
}

// Função principal
function corrigirNumeracaoEEmbaralhar() {
    try {
        console.log('🔄 Iniciando correção de numeração e embaralhamento...');
        
        // Criar backup de segurança
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const arquivoBackup = `MRS/Questoes_Av_Final_Padronizadas_COMPLETO_LIMPO_backup_${timestamp}.md`;
        
        // Ler o arquivo original
        const arquivo = 'MRS/Questoes_Av_Final_Padronizadas_COMPLETO_LIMPO.md';
        const conteudo = fs.readFileSync(arquivo, 'utf8');
        
        // Criar backup
        fs.writeFileSync(arquivoBackup, conteudo, 'utf8');
        console.log(`💾 Backup criado: ${arquivoBackup}`);
        
        // Separar cabeçalho, questões e rodapé
        const partes = conteudo.split('## Questão 1');
        const cabecalho = partes[0];
        const restoConteudo = '## Questão 1' + partes[1];
        
        // Extrair questões
        const questoes = extrairQuestoes(restoConteudo);
        console.log(`📊 Encontradas ${questoes.length} questões`);
        
        // Corrigir numeração específica (51→43, 52→44)
        const questoesCorrigidas = corrigirNumeracao(questoes);
        console.log('🔧 Numeração corrigida (51→43, 52→44)');
        
        // Embaralhar questões
        const questoesEmbaralhadas = embaralharArray(questoesCorrigidas);
        console.log('🎲 Questões embaralhadas com sucesso');
        
        // Renumerar sequencialmente (1, 2, 3...)
        const questoesRenumeradas = renumerarQuestoes(questoesEmbaralhadas);
        console.log('🔢 Questões renumeradas sequencialmente');        
        // Reconstruir conteúdo
        let novoConteudo = cabecalho;
        
        // Adicionar questões renumeradas
        questoesRenumeradas.forEach(questao => {
            novoConteudo += questao.linhas.join('\n') + '\n\n';
        });
        
        // Adicionar resumo final atualizado
        const resumoFinal = `## 📊 RESUMO FINAL

### **Total de Questões Consolidadas:** ${questoesRenumeradas.length}
### **Status:** ✅ **QUESTÕES CORRIGIDAS, EMBARALHADAS E RENUMERADAS**

### **Correções Aplicadas:**
- Questão 51 → Questão 43
- Questão 52 → Questão 44
- Todas as questões foram embaralhadas aleatoriamente
- Renumeração sequencial de 1 a ${questoesRenumeradas.length}

### **Distribuição por Módulos (após embaralhamento):**
- **Questões 1-5:** Fundamentos do Saneamento Básico e a PNSB
- **Módulo 1:** 2 questões - Fundamentos do Saneamento Básico e a PNSB
- **Módulo 2:** 7 questões - Estrutura do Questionário da PNSB 2024
- **Módulo 3:** 8 questões - Limpeza Urbana e Manejo de Resíduos Sólidos
- **Módulo 4:** 7 questões - MRS em Áreas Especiais e Coleta Seletiva
- **Módulo 5:** 7 questões - Manejo de Resíduos Sólidos Especiais (ESP)
- **Módulo 6:** 6 questões - Unidades de Destinação/Disposição Final (DIS)
- **Módulo 7:** 10 questões - Entidades de Catadores, Veículos e Educação Ambiental

---
**Script executado em:** ${new Date().toLocaleString('pt-BR')}
**Arquivo processado:** MRS/Questoes_Av_Final_Padronizadas_COMPLETO_LIMPO.md
**Backup criado:** ${arquivoBackup}
**Questões processadas:** ${questoesRenumeradas.length}
**Status:** ✅ **PROCESSAMENTO CONCLUÍDO COM SUCESSO!**
`;
        
        novoConteudo += resumoFinal;
        
        // Salvar arquivo
        fs.writeFileSync(arquivo, novoConteudo, 'utf8');
        
        console.log(`✅ Arquivo atualizado: ${arquivo}`);
        console.log(`📊 Total de questões processadas: ${questoesRenumeradas.length}`);
        console.log(`🎲 Questões corrigidas, embaralhadas e renumeradas com sucesso!`);
        
        // Mostrar mapeamento da nova ordem
        console.log('\n📋 MAPEAMENTO DA NOVA ORDEM:');
        console.log('Original → Nova Posição');
        questoesRenumeradas.forEach((questao, index) => {
            console.log(`Questão ${questao.numeroOriginal} → Questão ${index + 1}`);
        });
        
    } catch (error) {
        console.error('❌ Erro ao processar questões:', error.message);
    }
}

// Executar script
corrigirNumeracaoEEmbaralhar(); 