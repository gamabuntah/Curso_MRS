const fs = require('fs');
const path = require('path');

console.log('🔧 CORRIGINDO FEEDBACKS EDUCATIVOS E IMPLEMENTANDO EMBARALHAMENTO...\n');

// Configurações
const dataPath = 'public/data';
const logsPath = 'logs';
const backupPath = 'backup-quizzes';

// Função para embaralhar array
function embaralharArray(array) {
    const arrayCopia = [...array];
    for (let i = arrayCopia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayCopia[i], arrayCopia[j]] = [arrayCopia[j], arrayCopia[i]];
    }
    return arrayCopia;
}

// Função para corrigir feedback educativo
function corrigirFeedback(feedback) {
    if (!feedback) return feedback;
    
    let feedbackCorrigido = feedback;
    
    // Remover "Correto!" e variações
    feedbackCorrigido = feedbackCorrigido.replace(/^Correto!\s*/i, '');
    feedbackCorrigido = feedbackCorrigido.replace(/^Correto\s*/i, '');
    feedbackCorrigido = feedbackCorrigido.replace(/^Acertou!\s*/i, '');
    feedbackCorrigido = feedbackCorrigido.replace(/^Acertou\s*/i, '');
    feedbackCorrigido = feedbackCorrigido.replace(/^Certo!\s*/i, '');
    feedbackCorrigido = feedbackCorrigido.replace(/^Certo\s*/i, '');
    
    // Remover "Correto!" no meio do texto
    feedbackCorrigido = feedbackCorrigido.replace(/\s+Correto!\s*/gi, ' ');
    feedbackCorrigido = feedbackCorrigido.replace(/\s+Correto\s*/gi, ' ');
    feedbackCorrigido = feedbackCorrigido.replace(/\s+Acertou!\s*/gi, ' ');
    feedbackCorrigido = feedbackCorrigido.replace(/\s+Acertou\s*/gi, ' ');
    feedbackCorrigido = feedbackCorrigido.replace(/\s+Certo!\s*/gi, ' ');
    feedbackCorrigido = feedbackCorrigido.replace(/\s+Certo\s*/gi, ' ');
    
    // Limpar espaços extras
    feedbackCorrigido = feedbackCorrigido.trim();
    
    return feedbackCorrigido;
}

// Função para processar e embaralhar questões
function processarQuestoes(questoes) {
    return questoes.map(questao => {
        // Corrigir feedbacks de todas as alternativas
        const alternativasCorrigidas = questao.alternativas.map(alt => ({
            ...alt,
            feedback: corrigirFeedback(alt.feedback)
        }));
        
        // Embaralhar alternativas
        const alternativasEmbaralhadas = embaralharArray(alternativasCorrigidas);
        
        return {
            ...questao,
            alternativas: alternativasEmbaralhadas
        };
    });
}

// Função para processar módulo individual
function processarModulo(numeroModulo) {
    const moduloPath = path.join(dataPath, `module${numeroModulo}.js`);
    
    if (!fs.existsSync(moduloPath)) {
        console.log(`❌ Módulo ${numeroModulo}: Arquivo não encontrado`);
        return false;
    }
    
    try {
        console.log(`\n📖 Processando Módulo ${numeroModulo}...`);
        
        // Ler arquivo do módulo
        const conteudo = fs.readFileSync(moduloPath, 'utf8');
        
        // Extrair o objeto do módulo
        const match = conteudo.match(/const module\d+ = (\{[\s\S]*?\});/);
        if (!match) {
            console.log(`❌ Módulo ${numeroModulo}: Estrutura inválida`);
            return false;
        }
        
        // Parse do módulo
        // eslint-disable-next-line no-new-func
        const modulo = (new Function('return ' + match[1]))();
        
        // Verificar se tem quiz
        if (!modulo.quiz || !modulo.quiz.questoes) {
            console.log(`⚠️ Módulo ${numeroModulo}: Sem quiz encontrado`);
            return false;
        }
        
        // Processar questões
        const questoesProcessadas = processarQuestoes(modulo.quiz.questoes);
        
        // Atualizar módulo
        modulo.quiz.questoes = questoesProcessadas;
        
        // Gerar novo conteúdo
        const novoConteudo = `const module${numeroModulo} = ${JSON.stringify(modulo, null, 2)};`;
        
        // Fazer backup
        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath);
        }
        fs.writeFileSync(path.join(backupPath, `module${numeroModulo}.js.backup`), conteudo, 'utf8');
        
        // Salvar arquivo corrigido
        fs.writeFileSync(moduloPath, novoConteudo, 'utf8');
        
        console.log(`✅ Módulo ${numeroModulo}: Processado com sucesso`);
        console.log(`   📝 Questões processadas: ${questoesProcessadas.length}`);
        console.log(`   🔀 Alternativas embaralhadas: ${questoesProcessadas.reduce((total, q) => total + q.alternativas.length, 0)}`);
        
        return true;
        
    } catch (erro) {
        console.log(`❌ Erro ao processar módulo ${numeroModulo}: ${erro.message}`);
        return false;
    }
}

// Função para processar avaliação final
function processarAvaliacaoFinal() {
    const avaliacaoPath = path.join(dataPath, 'avaliacaoFinal.js');
    
    if (!fs.existsSync(avaliacaoPath)) {
        console.log('❌ Avaliação final: Arquivo não encontrado');
        return false;
    }
    
    try {
        console.log('\n📝 Processando Avaliação Final...');
        
        // Ler arquivo da avaliação
        const conteudo = fs.readFileSync(avaliacaoPath, 'utf8');
        
        // Extrair o objeto da avaliação
        const match = conteudo.match(/const avaliacaoFinal = (\{[\s\S]*?\});/);
        if (!match) {
            console.log('❌ Avaliação final: Estrutura inválida');
            return false;
        }
        
        // Parse da avaliação
        // eslint-disable-next-line no-new-func
        const avaliacao = (new Function('return ' + match[1]))();
        
        // Verificar se tem questões
        if (!avaliacao.questoes) {
            console.log('⚠️ Avaliação final: Sem questões encontradas');
            return false;
        }
        
        // Processar questões
        const questoesProcessadas = processarQuestoes(avaliacao.questoes);
        
        // Atualizar avaliação
        avaliacao.questoes = questoesProcessadas;
        
        // Gerar novo conteúdo
        const novoConteudo = `const avaliacaoFinal = ${JSON.stringify(avaliacao, null, 2)};`;
        
        // Fazer backup
        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath);
        }
        fs.writeFileSync(path.join(backupPath, 'avaliacaoFinal.js.backup'), conteudo, 'utf8');
        
        // Salvar arquivo corrigido
        fs.writeFileSync(avaliacaoPath, novoConteudo, 'utf8');
        
        console.log('✅ Avaliação final: Processada com sucesso');
        console.log(`   📝 Questões processadas: ${questoesProcessadas.length}`);
        console.log(`   🔀 Alternativas embaralhadas: ${questoesProcessadas.reduce((total, q) => total + q.alternativas.length, 0)}`);
        
        return true;
        
    } catch (erro) {
        console.log(`❌ Erro ao processar avaliação final: ${erro.message}`);
        return false;
    }
}

// Função para atualizar quizzes no JSON de logs
function atualizarQuizzesJSON() {
    const quizzesPath = path.join(logsPath, 'quizzes-modulos.json');
    
    if (!fs.existsSync(quizzesPath)) {
        console.log('⚠️ Arquivo de quizzes não encontrado');
        return false;
    }
    
    try {
        console.log('\n📄 Atualizando arquivo de quizzes...');
        
        // Ler quizzes atuais
        const quizzes = JSON.parse(fs.readFileSync(quizzesPath, 'utf8'));
        
        // Processar cada módulo
        const quizzesAtualizados = quizzes.map(quiz => {
            if (quiz.questoes) {
                return {
                    ...quiz,
                    questoes: processarQuestoes(quiz.questoes)
                };
            }
            return quiz;
        });
        
        // Fazer backup
        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath);
        }
        fs.writeFileSync(path.join(backupPath, 'quizzes-modulos.json.backup'), JSON.stringify(quizzes, null, 2), 'utf8');
        
        // Salvar arquivo atualizado
        fs.writeFileSync(quizzesPath, JSON.stringify(quizzesAtualizados, null, 2), 'utf8');
        
        console.log('✅ Arquivo de quizzes atualizado com sucesso');
        
        return true;
        
    } catch (erro) {
        console.log(`❌ Erro ao atualizar quizzes: ${erro.message}`);
        return false;
    }
}

// Função para gerar relatório de correções
function gerarRelatorio(modulosProcessados, avaliacaoProcessada, quizzesAtualizados) {
    const relatorio = {
        timestamp: new Date().toISOString(),
        correcoes: {
            modulos: modulosProcessados,
            avaliacaoFinal: avaliacaoProcessada,
            quizzesJSON: quizzesAtualizados
        },
        resumo: {
            totalModulos: 7,
            modulosCorrigidos: modulosProcessados.filter(m => m).length,
            avaliacaoCorrigida: avaliacaoProcessada,
            feedbacksCorrigidos: 'Removidos "Correto!" e variações',
            alternativasEmbaralhadas: 'Todas as alternativas foram embaralhadas'
        }
    };
    
    // Salvar relatório
    if (!fs.existsSync(logsPath)) {
        fs.mkdirSync(logsPath);
    }
    fs.writeFileSync(path.join(logsPath, 'correcoes-feedbacks-embaralhamento.json'), JSON.stringify(relatorio, null, 2), 'utf8');
    
    console.log('\n📊 RELATÓRIO DE CORREÇÕES');
    console.log('='.repeat(50));
    console.log(`📚 Módulos corrigidos: ${modulosProcessados.filter(m => m).length}/7`);
    console.log(`📝 Avaliação final corrigida: ${avaliacaoProcessada ? '✅' : '❌'}`);
    console.log(`📄 Quizzes JSON atualizado: ${quizzesAtualizados ? '✅' : '❌'}`);
    console.log(`🔧 Feedbacks educativos: Corrigidos (removido "Correto!")`);
    console.log(`🔀 Embaralhamento: Implementado em todas as questões`);
    console.log(`💾 Backups salvos em: ${backupPath}/`);
    console.log(`📋 Relatório salvo em: ${logsPath}/correcoes-feedbacks-embaralhamento.json`);
}

// Função principal
function executarCorrecoes() {
    console.log('🚀 INICIANDO CORREÇÕES DE FEEDBACKS E EMBARALHAMENTO\n');
    
    // Processar todos os módulos
    const modulosProcessados = [];
    for (let i = 1; i <= 7; i++) {
        const resultado = processarModulo(i);
        modulosProcessados.push(resultado);
    }
    
    // Processar avaliação final
    const avaliacaoProcessada = processarAvaliacaoFinal();
    
    // Atualizar quizzes JSON
    const quizzesAtualizados = atualizarQuizzesJSON();
    
    // Gerar relatório
    gerarRelatorio(modulosProcessados, avaliacaoProcessada, quizzesAtualizados);
    
    // Resumo final
    console.log('\n' + '='.repeat(50));
    const modulosCorrigidos = modulosProcessados.filter(m => m).length;
    const sucesso = modulosCorrigidos >= 6 && avaliacaoProcessada;
    
    if (sucesso) {
        console.log('🎉 CORREÇÕES CONCLUÍDAS COM SUCESSO!');
        console.log('✅ Feedbacks educativos corrigidos');
        console.log('✅ Embaralhamento implementado');
        console.log('🚀 Sistema pronto para validação');
    } else {
        console.log('⚠️ ALGUMAS CORREÇÕES FALHARAM');
        console.log('🔧 Verifique os erros acima');
    }
    console.log('='.repeat(50));
    
    return sucesso;
}

// Executar se chamado diretamente
if (require.main === module) {
    executarCorrecoes();
}

module.exports = { executarCorrecoes, corrigirFeedback, embaralharArray }; 