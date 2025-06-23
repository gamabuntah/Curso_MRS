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

function embaralharQuestoes() {
    try {
        console.log('🔄 Iniciando embaralhamento das questões...');
        
        // Criar backup
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const arquivoBackup = `MRS/Questoes_Av_Final_Padronizadas_COMPLETO_LIMPO_backup_${timestamp}.md`;
        const arquivo = 'MRS/Questoes_Av_Final_Padronizadas_COMPLETO_LIMPO.md';
        
        let conteudo = fs.readFileSync(arquivo, 'utf8');
        fs.writeFileSync(arquivoBackup, conteudo, 'utf8');
        console.log(`💾 Backup criado: ${arquivoBackup}`);
        
        // PASSO 1: Corrigir numeração (51→43, 52→44)
        console.log('🔧 Corrigindo numeração...');
        conteudo = conteudo.replace(/^## Questão 51/gm, '## Questão 43');
        conteudo = conteudo.replace(/^## Questão 52/gm, '## Questão 44');
        
        // PASSO 2: Extrair todas as questões
        const questoes = [];
        const linhas = conteudo.split('\n');
        let questaoAtual = null;
        let linhasQuestao = [];
        
        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i];
            
            if (linha.match(/^## Questão \d+/)) {
                // Salvar questão anterior
                if (questaoAtual && linhasQuestao.length > 0) {
                    questoes.push({
                        numero: questaoAtual,
                        conteudo: linhasQuestao.join('\n')
                    });
                }
                
                // Nova questão
                const match = linha.match(/^## Questão (\d+)/);
                questaoAtual = parseInt(match[1]);
                linhasQuestao = [linha];
            } else if (linha.match(/^## 📊 RESUMO FINAL/)) {
                // Salvar última questão e parar
                if (questaoAtual && linhasQuestao.length > 0) {
                    questoes.push({
                        numero: questaoAtual,
                        conteudo: linhasQuestao.join('\n')
                    });
                }
                break;
            } else if (questaoAtual) {
                linhasQuestao.push(linha);
            }
        }
        
        console.log(`📊 Encontradas ${questoes.length} questões`);
        
        // PASSO 3: Embaralhar questões
        const questoesEmbaralhadas = embaralharArray(questoes);
        console.log('🎲 Questões embaralhadas');
        
        // PASSO 4: Renumerar sequencialmente
        const questoesRenumeradas = questoesEmbaralhadas.map((questao, index) => {
            const novoNumero = index + 1;
            const novoConteudo = questao.conteudo.replace(/^## Questão \d+/, `## Questão ${novoNumero}`);
            return {
                numeroOriginal: questao.numero,
                numero: novoNumero,
                conteudo: novoConteudo
            };
        });
        
        console.log('🔢 Questões renumeradas sequencialmente');
        
        // PASSO 5: Reconstruir arquivo
        const cabecalho = conteudo.substring(0, conteudo.indexOf('## Questão 1'));
        
        let novoConteudo = cabecalho;
        questoesRenumeradas.forEach(questao => {
            novoConteudo += questao.conteudo + '\n\n';
        });
        
        // Adicionar resumo final
        const resumoFinal = `## 📊 RESUMO FINAL

### **Total de Questões Consolidadas:** ${questoesRenumeradas.length}
### **Status:** ✅ **QUESTÕES EMBARALHADAS E RENUMERADAS**

### **Processamento Realizado:**
- Correção: Questão 51 → Questão 43, Questão 52 → Questão 44
- Embaralhamento aleatório de todas as questões
- Renumeração sequencial de 1 a ${questoesRenumeradas.length}

### **Distribuição por Módulos (após embaralhamento):**
- **Módulos 1-7:** ${questoesRenumeradas.length} questões distribuídas aleatoriamente
- **Fundamentos, Estrutura, Limpeza, MRS, Especiais, Destinação, Entidades**

---
**Script executado em:** ${new Date().toLocaleString('pt-BR')}
**Arquivo processado:** ${arquivo}
**Backup criado:** ${arquivoBackup}
**Questões processadas:** ${questoesRenumeradas.length}
**Status:** ✅ **EMBARALHAMENTO CONCLUÍDO COM SUCESSO!**
`;
        
        novoConteudo += resumoFinal;
        
        // Salvar arquivo
        fs.writeFileSync(arquivo, novoConteudo, 'utf8');
        
        console.log(`✅ Arquivo atualizado: ${arquivo}`);
        console.log(`📊 Total de questões processadas: ${questoesRenumeradas.length}`);
        
        // Mostrar mapeamento
        console.log('\n📋 MAPEAMENTO DA NOVA ORDEM (primeiras 10):');
        questoesRenumeradas.slice(0, 10).forEach((questao, index) => {
            console.log(`Questão ${questao.numeroOriginal} → Questão ${index + 1}`);
        });
        
        if (questoesRenumeradas.length > 10) {
            console.log(`... e mais ${questoesRenumeradas.length - 10} questões`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao embaralhar questões:', error.message);
    }
}

// Executar
embaralharQuestoes(); 