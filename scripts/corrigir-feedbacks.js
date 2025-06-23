const fs = require('fs');
const path = require('path');

// Expressões de congratulação a serem removidas
const congratulacoes = [
    'Perfeito!',
    'Correto!',
    'Excelente!',
    'Muito bem!',
    'Ótimo!',
    'Parabéns!',
    'Perfeito! Correto!',
    'Excelente! Correto!',
    'Muito bem! Correto!',
    'Ótimo! Correto!',
    'Parabéns! Correto!'
];

// Função para limpar feedback removendo congratulações
function limparFeedback(feedback) {
    if (!feedback || typeof feedback !== 'string') {
        return feedback;
    }
    
    let feedbackLimpo = feedback;
    
    // Remove expressões de congratulação
    congratulacoes.forEach(congratulacao => {
        feedbackLimpo = feedbackLimpo.replace(new RegExp(congratulacao, 'gi'), '').trim();
    });
    
    // Remove múltiplos espaços
    feedbackLimpo = feedbackLimpo.replace(/\s+/g, ' ');
    
    // Remove pontos duplos no início
    feedbackLimpo = feedbackLimpo.replace(/^:\s*/, '');
    
    return feedbackLimpo;
}

// Função para processar um módulo
function processarModulo(caminhoArquivo) {
    try {
        console.log(`📝 Processando: ${caminhoArquivo}`);
        
        // Lê o arquivo
        const conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
        
        // Extrai o nome do módulo do arquivo
        const nomeModulo = path.basename(caminhoArquivo, '.js');
        
        // Cria um contexto isolado para executar o código
        const sandbox = {};
        const script = conteudo.replace(`window.${nomeModulo}`, 'sandbox.module');
        
        // Executa o código no sandbox
        eval(script);
        
        // Obtém o objeto do módulo
        const moduleObj = sandbox.module;
        
        // Detecta onde estão as questões
        let questoes = null;
        if (moduleObj && moduleObj.quiz && Array.isArray(moduleObj.quiz.questoes)) {
            questoes = moduleObj.quiz.questoes;
        } else if (moduleObj && Array.isArray(moduleObj.questoes)) {
            questoes = moduleObj.questoes;
        }
        
        if (!questoes) {
            console.log(`⚠️ Módulo sem questões válidas: ${caminhoArquivo}`);
            return false;
        }
        
        let alteracoes = 0;
        
        // Processa cada questão
        questoes.forEach((questao, index) => {
            if (questao.alternativas) {
                questao.alternativas.forEach((alternativa, altIndex) => {
                    if (alternativa.feedback) {
                        const feedbackOriginal = alternativa.feedback;
                        const feedbackLimpo = limparFeedback(alternativa.feedback);
                        
                        if (feedbackOriginal !== feedbackLimpo) {
                            alternativa.feedback = feedbackLimpo;
                            alteracoes++;
                            console.log(`  🔄 Questão ${index + 1}, Alternativa ${altIndex + 1}: Feedback corrigido`);
                        }
                    }
                });
            }
        });
        
        if (alteracoes > 0) {
            // Reconstrói o código do módulo
            const novoCodigo = `window.${nomeModulo} = ${JSON.stringify(moduleObj, null, 2)};`;
            
            // Salva o arquivo
            fs.writeFileSync(caminhoArquivo, novoCodigo, 'utf8');
            console.log(`✅ ${alteracoes} feedbacks corrigidos em ${caminhoArquivo}`);
            return true;
        } else {
            console.log(`ℹ️ Nenhuma alteração necessária em ${caminhoArquivo}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Erro ao processar ${caminhoArquivo}:`, error.message);
        return false;
    }
}

// Função principal
function main() {
    console.log('🧹 INICIANDO CORREÇÃO DE FEEDBACKS DAS QUESTÕES OTIMIZADAS...\n');
    
    const pastaQuestoes = path.join(__dirname, '../public/data/browser/questoes-otimizadas');
    const arquivos = [
        'module1.js',
        'module2.js', 
        'module3.js',
        'module4.js',
        'module5.js',
        'module6.js',
        'module7.js',
        'avaliacaoFinal.js'
    ];
    
    let totalAlteracoes = 0;
    let arquivosProcessados = 0;
    
    arquivos.forEach(arquivo => {
        const caminhoCompleto = path.join(pastaQuestoes, arquivo);
        
        if (fs.existsSync(caminhoCompleto)) {
            const alterado = processarModulo(caminhoCompleto);
            if (alterado) {
                totalAlteracoes++;
            }
            arquivosProcessados++;
        } else {
            console.log(`⚠️ Arquivo não encontrado: ${caminhoCompleto}`);
        }
    });
    
    console.log('\n📊 RESUMO DA CORREÇÃO:');
    console.log(`✅ Arquivos processados: ${arquivosProcessados}`);
    console.log(`✅ Arquivos alterados: ${totalAlteracoes}`);
    console.log(`✅ Expressões removidas: ${congratulacoes.join(', ')}`);
    console.log('\n🎯 Correção de feedbacks concluída!');
}

// Executa o script
if (require.main === module) {
    main();
}

module.exports = { limparFeedback, processarModulo }; 