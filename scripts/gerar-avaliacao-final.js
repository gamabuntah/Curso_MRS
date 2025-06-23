#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏁 GERANDO AVALIAÇÃO FINAL (50 QUESTÕES)...\n');

let avaliacaoOk = true;

// Carregar quizzes dos módulos do arquivo JSON
console.log('📂 Carregando quizzes dos módulos:');
const caminhoQuizzes = path.join('logs', 'quizzes-modulos.json');

if (!fs.existsSync(caminhoQuizzes)) {
    console.log(`❌ Arquivo não encontrado: ${caminhoQuizzes}`);
    console.log('💡 Execute primeiro o script gerar-questoes-modulos.js');
    process.exit(1);
}

try {
    const quizzesData = JSON.parse(fs.readFileSync(caminhoQuizzes, 'utf8'));
    console.log(`✅ ${quizzesData.length} módulos carregados com sucesso`);
    
    // Validar estrutura dos dados
    if (!Array.isArray(quizzesData)) {
        throw new Error('Dados não estão em formato de array');
    }
    
    // Validar se todos os 7 módulos estão presentes
    if (quizzesData.length !== 7) {
        console.log(`⚠️  Aviso: ${quizzesData.length} módulos encontrados (esperado: 7)`);
    }
    
    // Validar estrutura de cada módulo
    quizzesData.forEach((modulo, index) => {
        if (!modulo.id || !modulo.titulo || !Array.isArray(modulo.questoes)) {
            throw new Error(`Estrutura inválida no módulo ${index + 1}`);
        }
        if (modulo.questoes.length === 0) {
            console.log(`⚠️  Módulo ${modulo.id}: Nenhuma questão disponível`);
        }
    });
    
    // Função de similaridade para evitar questões repetidas
    function similaridade(str1, str2) {
        const set1 = new Set(str1.toLowerCase().split(/\W+/));
        const set2 = new Set(str2.toLowerCase().split(/\W+/));
        const inter = new Set([...set1].filter(x => set2.has(x)));
        return inter.size / Math.max(set1.size, set2.size);
    }
    
    // Função para embaralhar array
    function embaralhar(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Função para extrair tema da pergunta de forma mais robusta
    function extrairTema(pergunta) {
        // Tentar extrair tema antes do primeiro ":"
        const match = pergunta.match(/^(.*?):/);
        if (match) {
            return match[1].trim();
        }
        
        // Se não encontrar ":", tentar extrair palavras-chave
        const palavras = pergunta.split(/\s+/).slice(0, 3).join(' ');
        return palavras;
    }
    
    // Função para verificar se questão já existe (evitar duplicatas)
    function questaoJaExiste(questao, questoesExistentes) {
        for (const q of questoesExistentes) {
            if (similaridade(q.pergunta, questao.pergunta) > 0.8) {
                return true;
            }
        }
        return false;
    }
    
    // Função para verificar qualidade da questão
    function verificarQualidadeQuestao(questao) {
        const problemas = [];
        
        // Verificar se a pergunta tem conteúdo mínimo
        if (!questao.pergunta || questao.pergunta.length < 20) {
            problemas.push('Pergunta muito curta');
        }
        
        // Verificar se tem 4 alternativas
        if (!questao.alternativas || questao.alternativas.length !== 4) {
            problemas.push('Número incorreto de alternativas');
        }
        
        // Verificar se tem exatamente uma alternativa correta
        const alternativasCorretas = questao.alternativas.filter(alt => alt.correta);
        if (alternativasCorretas.length !== 1) {
            problemas.push('Número incorreto de alternativas corretas');
        }
        
        // Verificar se todas as alternativas têm feedback
        const alternativasSemFeedback = questao.alternativas.filter(alt => !alt.feedback);
        if (alternativasSemFeedback.length > 0) {
            problemas.push('Alternativas sem feedback');
        }
        
        return {
            valida: problemas.length === 0,
            problemas
        };
    }
    
    // Função para selecionar questões balanceadas por módulo
    function selecionarQuestoesBalanceadas(quizzesData, totalQuestoes) {
        const questoesSelecionadas = [];
        const questoesPorModulo = Math.floor(totalQuestoes / quizzesData.length);
        const questoesExtras = totalQuestoes % quizzesData.length;
        const temasUsados = new Set();
        const perguntasSet = new Set();
        const modulosComQuestoes = new Set();
        
        console.log(`📊 Distribuição planejada: ${questoesPorModulo} questões por módulo + ${questoesExtras} extras`);
        
        // Primeira passada: garantir pelo menos uma questão de cada módulo
        console.log('\n🎯 Garantindo representação de todos os módulos:');
        quizzesData.forEach((modulo, idx) => {
            const questoesDisponiveis = modulo.questoes || [];
            if (questoesDisponiveis.length === 0) {
                console.log(`⚠️  Módulo ${modulo.id}: Nenhuma questão disponível`);
                return;
            }
            
            // Embaralhar questões do módulo
            const questoesEmbaralhadas = embaralhar([...questoesDisponiveis]);
            
            // Selecionar pelo menos uma questão de cada módulo
            let questaoSelecionada = false;
            for (const questao of questoesEmbaralhadas) {
                // Verificar qualidade da questão
                const qualidade = verificarQualidadeQuestao(questao);
                if (!qualidade.valida) {
                    continue;
                }
                
                // Verificar se não é muito similar a questões já selecionadas
                if (!questaoJaExiste(questao, questoesSelecionadas)) {
                    questoesSelecionadas.push(questao);
                    modulosComQuestoes.add(modulo.id);
                    const temaQuestao = extrairTema(questao.pergunta);
                    temasUsados.add(temaQuestao);
                    perguntasSet.add(questao.pergunta);
                    questaoSelecionada = true;
                    console.log(`✅ Módulo ${modulo.id}: 1 questão garantida`);
                    break;
                }
            }
            
            if (!questaoSelecionada) {
                console.log(`⚠️  Módulo ${modulo.id}: Não foi possível selecionar questão única`);
            }
        });
        
        // Segunda passada: distribuir questões restantes
        console.log('\n📈 Distribuindo questões restantes:');
        const questoesRestantes = totalQuestoes - questoesSelecionadas.length;
        const questoesPorModuloRestantes = Math.floor(questoesRestantes / modulosComQuestoes.size);
        
        quizzesData.forEach((modulo, idx) => {
            if (!modulosComQuestoes.has(modulo.id)) return;
            
            const questoesDisponiveis = modulo.questoes || [];
            const questoesEmbaralhadas = embaralhar([...questoesDisponiveis]);
            
            let questoesAdicionadas = 0;
            let tentativas = 0;
            const maxTentativas = questoesDisponiveis.length * 2;
            
            for (const questao of questoesEmbaralhadas) {
                if (questoesAdicionadas >= questoesPorModuloRestantes || tentativas >= maxTentativas) break;
                
                // Verificar qualidade da questão
                const qualidade = verificarQualidadeQuestao(questao);
                if (!qualidade.valida) {
                    tentativas++;
                    continue;
                }
                
                // Verificar se não é muito similar a questões já selecionadas
                if (!questaoJaExiste(questao, questoesSelecionadas)) {
                    const temaQuestao = extrairTema(questao.pergunta);
                    if (!temasUsados.has(temaQuestao) || temasUsados.size < 25) {
                        questoesSelecionadas.push(questao);
                        questoesAdicionadas++;
                        temasUsados.add(temaQuestao);
                        perguntasSet.add(questao.pergunta);
                    }
                }
                tentativas++;
            }
            
            if (questoesAdicionadas > 0) {
                console.log(`✅ Módulo ${modulo.id}: +${questoesAdicionadas} questões adicionadas`);
            }
        });
        
        // Terceira passada: completar até o total desejado
        if (questoesSelecionadas.length < totalQuestoes) {
            console.log(`\n🔄 Completando até ${totalQuestoes} questões...`);
            
            let tentativas = 0;
            const maxTentativas = 500;
            
            while (questoesSelecionadas.length < totalQuestoes && tentativas < maxTentativas) {
                const moduloAleatorio = quizzesData[Math.floor(Math.random() * quizzesData.length)];
                const questoesDisponiveis = moduloAleatorio.questoes || [];
                
                if (questoesDisponiveis.length > 0) {
                    const questaoAleatoria = questoesDisponiveis[Math.floor(Math.random() * questoesDisponiveis.length)];
                    
                    // Verificar qualidade da questão
                    const qualidade = verificarQualidadeQuestao(questaoAleatoria);
                    if (!qualidade.valida) {
                        tentativas++;
                        continue;
                    }
                    
                    // Verificar se não é muito similar a questões já selecionadas
                    if (!questaoJaExiste(questaoAleatoria, questoesSelecionadas)) {
                        questoesSelecionadas.push(questaoAleatoria);
                        console.log(`➕ Questão extra adicionada do Módulo ${moduloAleatorio.id}`);
                    }
                }
                tentativas++;
            }
            
            if (tentativas >= maxTentativas) {
                console.log(`⚠️  Atingido limite de tentativas para completar questões extras`);
            }
        }
        
        return questoesSelecionadas.slice(0, totalQuestoes);
    }
    
    // Gerar avaliação final com distribuição balanceada
    console.log('\n🏁 Selecionando questões para avaliação final:');
    const questoesAvaliacao = selecionarQuestoesBalanceadas(quizzesData, 50);
    
    // Embaralhar todas as questões finais
    const questoesFinaisEmbaralhadas = embaralhar([...questoesAvaliacao]);
    
    // Validar avaliação final
    if (questoesFinaisEmbaralhadas.length !== 50) {
        console.log(`❌ Avaliação final gerada com ${questoesFinaisEmbaralhadas.length} questões (esperado: 50)`);
        avaliacaoOk = false;
    } else {
        console.log('✅ Avaliação final com 50 questões gerada');
    }
    
    // Analisar distribuição por módulo
    console.log('\n📊 Análise da distribuição por módulo:');
    const distribuicao = {};
    questoesFinaisEmbaralhadas.forEach(questao => {
        const moduloOrigem = quizzesData.find(m => 
            m.questoes.some(q => q.pergunta === questao.pergunta)
        );
        if (moduloOrigem) {
            distribuicao[moduloOrigem.id] = (distribuicao[moduloOrigem.id] || 0) + 1;
        }
    });
    
    Object.keys(distribuicao).sort().forEach(moduloId => {
        const modulo = quizzesData.find(m => m.id == moduloId);
        console.log(`- Módulo ${moduloId} (${modulo.titulo}): ${distribuicao[moduloId]} questões`);
    });
    
    // Verificar se todos os módulos estão representados
    const modulosRepresentados = Object.keys(distribuicao).length;
    if (modulosRepresentados < 7) {
        console.log(`⚠️  Apenas ${modulosRepresentados}/7 módulos estão representados`);
    } else {
        console.log(`✅ Todos os 7 módulos estão representados`);
    }
    
    // Análise de qualidade das questões selecionadas
    console.log('\n🔍 Análise de qualidade das questões:');
    let questoesComProblemas = 0;
    const problemasDetectados = [];
    
    questoesFinaisEmbaralhadas.forEach((questao, index) => {
        const qualidade = verificarQualidadeQuestao(questao);
        if (!qualidade.valida) {
            questoesComProblemas++;
            problemasDetectados.push(`Questão ${index + 1}: ${qualidade.problemas.join(', ')}`);
        }
    });
    
    if (questoesComProblemas > 0) {
        console.log(`⚠️  ${questoesComProblemas} questões com problemas detectados:`);
        problemasDetectados.slice(0, 5).forEach(problema => console.log(`  - ${problema}`));
        if (problemasDetectados.length > 5) {
            console.log(`  ... e mais ${problemasDetectados.length - 5} problemas`);
        }
    } else {
        console.log('✅ Todas as questões passaram na verificação de qualidade');
    }
    
    // Salvar avaliação final
    console.log('\n💾 Salvando avaliação final:');
    try {
        const avaliacaoFinal = {
            curso: "Manejo de Resíduos Sólidos",
            dataGeracao: new Date().toISOString(),
            totalQuestoes: questoesFinaisEmbaralhadas.length,
            distribuicaoPorModulo: distribuicao,
            modulosRepresentados: modulosRepresentados,
            questoes: questoesFinaisEmbaralhadas
        };
        
        const caminho = path.join('public', 'data', 'avaliacaoFinal.js');
        const conteudoArquivo = `const avaliacaoFinal = ${JSON.stringify(avaliacaoFinal, null, 2)};\n\nif (typeof module !== 'undefined' && module.exports) {\n    module.exports = avaliacaoFinal;\n}`;
        fs.writeFileSync(caminho, conteudoArquivo, 'utf8');
        console.log('✅ Arquivo public/data/avaliacaoFinal.js criado');
    } catch (error) {
        console.log(`❌ Erro ao salvar avaliação final: ${error.message}`);
        avaliacaoOk = false;
    }
    
    // Salvar resumo detalhado da avaliação
    console.log('\n📋 Salvando resumo detalhado da avaliação:');
    try {
        const resumoAvaliacao = {
            data: new Date().toISOString(),
            totalQuestoes: questoesFinaisEmbaralhadas.length,
            distribuicaoPorModulo: distribuicao,
            modulosRepresentados: modulosRepresentados,
            modulos: quizzesData.map(m => ({
                id: m.id,
                titulo: m.titulo,
                questoesDisponiveis: m.questoes ? m.questoes.length : 0,
                questoesSelecionadas: distribuicao[m.id] || 0
            })),
            qualidade: {
                questoesUnicas: questoesFinaisEmbaralhadas.length,
                repeticoesDetectadas: 0,
                coberturaModulos: modulosRepresentados,
                questoesComProblemas: questoesComProblemas,
                problemasDetectados: problemasDetectados
            },
            status: avaliacaoOk ? 'SUCESSO' : 'COM_ERROS'
        };
        
        fs.writeFileSync(path.join('logs', 'resumo-avaliacao-final.json'), JSON.stringify(resumoAvaliacao, null, 2), 'utf8');
        console.log('✅ Resumo salvo em logs/resumo-avaliacao-final.json');
    } catch (error) {
        console.log(`❌ Erro ao salvar resumo da avaliação: ${error.message}`);
        avaliacaoOk = false;
    }
    
    // Resultado final
    console.log('\n' + '='.repeat(60));
    if (avaliacaoOk) {
        console.log('🎉 AVALIAÇÃO FINAL GERADA COM SUCESSO!');
        console.log(`📊 Total de questões: ${questoesFinaisEmbaralhadas.length}`);
        console.log(`📈 Cobertura de módulos: ${modulosRepresentados}/7`);
        console.log(`🎯 Média por módulo: ${(questoesFinaisEmbaralhadas.length / modulosRepresentados).toFixed(1)} questões`);
        console.log(`✅ Qualidade: ${questoesComProblemas === 0 ? 'Excelente' : 'Com observações'}`);
        process.exit(0);
    } else {
        console.log('⚠️  GERAÇÃO DA AVALIAÇÃO FINAL CONCLUÍDA COM PROBLEMAS!');
        process.exit(1);
    }

} catch (error) {
    console.log(`❌ Erro ao carregar quizzes: ${error.message}`);
    process.exit(1);
} 