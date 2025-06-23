const fs = require('fs');
const path = require('path');

console.log('🔍 VALIDANDO FUNCIONALIDADES ESPECÍFICAS DO SISTEMA MRS...\n');

// Configurações
const publicPath = 'public';
const dataPath = path.join(publicPath, 'data');
const logPath = 'logs/validacao-funcionalidades.json';
const QUESTOES_ESPERADAS = 15; // Mantido conforme implementação atual
const TOTAL_MODULOS = 7; // Ajustado para MRS (7 módulos em vez de 8)

// Paleta de cores definida no curso
const PALETA_CORES = {
    primaria: '#2B2D3A',
    secundaria: '#6C63FF', 
    destaque: '#00E599',
    fundo: '#F5F6FA',
    texto: '#22223B'
};

// Função para parse seguro de módulo JS
function parseModuloJS(moduloPath, numeroModulo) {
    try {
        const conteudo = fs.readFileSync(moduloPath, 'utf8');
        
        // Extrair o objeto do módulo usando regex
        const match = conteudo.match(/const module\d+ = (\{[\s\S]*?\});/);
        if (!match) {
            throw new Error('Não foi possível localizar o objeto do módulo');
        }
        
        // Usar Function para parsing seguro
        // eslint-disable-next-line no-new-func
        return (new Function('return ' + match[1]))();
        
    } catch (erro) {
        throw new Error(`Erro ao parsear módulo ${numeroModulo}: ${erro.message}`);
    }
}

// Função para validar feedbacks educativos
function validarFeedbacksEducativos(questoes) {
    const problemas = [];
    
    questoes.forEach((questao, index) => {
        questao.alternativas.forEach((alt, altIndex) => {
            if (alt.feedback) {
                // Verificar se contém "Correto!" (não deve conter)
                if (alt.feedback.toLowerCase().includes('correto!') || 
                    alt.feedback.toLowerCase().includes('correto') ||
                    alt.feedback.toLowerCase().includes('acertou')) {
                    problemas.push(`Questão ${index + 1}, Alternativa ${altIndex + 1}: Feedback contém "Correto!" (deve ser apenas explicativo)`);
                }
                
                // Verificar se é muito curto (deve ser explicativo)
                if (alt.feedback.length < 20) {
                    problemas.push(`Questão ${index + 1}, Alternativa ${altIndex + 1}: Feedback muito curto (deve ser explicativo)`);
                }
            }
        });
    });
    
    return problemas;
}

// Função para validar embaralhamento de alternativas
function validarEmbaralhamento(questoes) {
    const problemas = [];
    
    questoes.forEach((questao, index) => {
        // Verificar se as alternativas não estão sempre na mesma ordem
        const alternativasCorretas = questao.alternativas.filter(alt => alt.correta === true);
        if (alternativasCorretas.length === 1) {
            const posicaoCorreta = questao.alternativas.findIndex(alt => alt.correta === true);
            
            // Se a alternativa correta está sempre na mesma posição, pode indicar falta de embaralhamento
            // Mas isso é apenas um aviso, não um erro, pois o embaralhamento pode ser feito no frontend
            if (posicaoCorreta === 0) {
                problemas.push(`Questão ${index + 1}: Alternativa correta sempre na primeira posição (verificar se há embaralhamento no frontend)`);
            }
        }
    });
    
    return problemas;
}

// Função para validar cards especiais obrigatórios
function validarCardsEspeciais(cards) {
    const problemas = [];
    const tiposEncontrados = cards.map(card => card.type).filter(Boolean);
    
    // Verificar se tem card de dúvidas frequentes
    if (!tiposEncontrados.includes('duvidas')) {
        problemas.push('Card "🗨️ Dúvidas Frequentes" não encontrado (obrigatório)');
    }
    
    // Verificar se tem card de resumo visual
    if (!tiposEncontrados.includes('resumo visual')) {
        problemas.push('Card "📊 Resumo Visual" não encontrado (obrigatório)');
    }
    
    // Verificar se tem pelo menos um card de dica
    if (!tiposEncontrados.includes('dica')) {
        problemas.push('Card "💡 Dica" não encontrado (recomendado)');
    }
    
    // Verificar se tem pelo menos um card de atenção
    if (!tiposEncontrados.includes('atencao')) {
        problemas.push('Card "⚠️ Atenção" não encontrado (recomendado)');
    }
    
    return problemas;
}

// Função para validar estrutura específica de cards
function validarEstruturaEspecificaCards(cards) {
    const problemas = [];
    
    cards.forEach((card, index) => {
        // Verificar estrutura obrigatória
        if (!card.title || typeof card.title !== 'string') {
            problemas.push(`Card ${index + 1}: Title obrigatório e deve ser string`);
        }
        
        if (!card.content || typeof card.content !== 'string') {
            problemas.push(`Card ${index + 1}: Content obrigatório e deve ser string`);
        }
        
        // Verificar se title não está vazio
        if (card.title && card.title.trim().length === 0) {
            problemas.push(`Card ${index + 1}: Title não pode estar vazio`);
        }
        
        // Verificar se content não está vazio
        if (card.content && card.content.trim().length === 0) {
            problemas.push(`Card ${index + 1}: Content não pode estar vazio`);
        }
        
        // Verificar se title tem tamanho adequado (não muito longo)
        if (card.title && card.title.length > 200) {
            problemas.push(`Card ${index + 1}: Title muito longo (máximo 200 caracteres)`);
        }
        
        // Verificar se content tem tamanho mínimo
        if (card.content && card.content.length < 10) {
            problemas.push(`Card ${index + 1}: Content muito curto (mínimo 10 caracteres)`);
        }
        
        // Verificar tipos válidos
        const tiposValidos = ['default', 'dica', 'atencao', 'exemplo', 'duvidas', 'resumo visual'];
        if (card.type && !tiposValidos.includes(card.type)) {
            problemas.push(`Card ${index + 1}: Tipo inválido "${card.type}" (tipos válidos: ${tiposValidos.join(', ')})`);
        }
        
        // Verificar se emojis estão apenas nos títulos
        const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
        
        if (card.content && emojiRegex.test(card.content)) {
            problemas.push(`Card ${index + 1}: Emojis encontrados no conteúdo (devem estar apenas no título)`);
        }
        
        // Verificar estrutura de cards especiais
        if (card.type === 'duvidas') {
            if (!card.content.includes('❓') && !card.content.includes('Dúvida')) {
                problemas.push(`Card ${index + 1}: Card de dúvidas deve conter estrutura de dúvidas (❓ ou "Dúvida")`);
            }
        }
        
        if (card.type === 'resumo visual') {
            if (!card.content.includes('|') && !card.content.includes('Tabela') && !card.content.includes('📊')) {
                problemas.push(`Card ${index + 1}: Card de resumo visual deve conter tabela ou estrutura visual`);
            }
        }
    });
    
    return problemas;
}

// Função para validar estrutura de cards
function validarEstruturaCards(moduloPath, numeroModulo) {
    try {
        const modulo = parseModuloJS(moduloPath, numeroModulo);
        
        if (!modulo.cards || !Array.isArray(modulo.cards) || modulo.cards.length === 0) {
            return { valido: false, erro: 'Cards vazios ou não é array' };
        }
        
        const problemas = [];
        let cardsValidos = 0;
        
        // Validar estrutura básica
        modulo.cards.forEach((card, index) => {
            // Verificar campos obrigatórios (estrutura atual)
            if (!card.title || !card.content) {
                problemas.push(`Card ${index + 1}: Title ou content ausente`);
                return;
            }
            
            // Verificar tipos de card válidos (estrutura atual)
            const tiposValidos = ['default', 'dica', 'atencao', 'exemplo', 'duvidas', 'resumo visual'];
            if (card.type && !tiposValidos.includes(card.type)) {
                problemas.push(`Card ${index + 1}: Tipo inválido "${card.type}"`);
                return;
            }
            
            // Verificar se emojis estão apenas nos títulos
            const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
            
            if (card.content && emojiRegex.test(card.content)) {
                problemas.push(`Card ${index + 1}: Emojis encontrados no conteúdo (devem estar apenas no título)`);
            }
            
            cardsValidos++;
        });
        
        // Validar estrutura específica
        const problemasEstruturaEspecifica = validarEstruturaEspecificaCards(modulo.cards);
        problemas.push(...problemasEstruturaEspecifica);
        
        // Validar cards especiais obrigatórios
        const problemasCardsEspeciais = validarCardsEspeciais(modulo.cards);
        problemas.push(...problemasCardsEspeciais);
        
        return {
            valido: problemas.length === 0,
            totalCards: modulo.cards.length,
            cardsValidos: cardsValidos,
            problemas: problemas,
            tiposCards: [...new Set(modulo.cards.map(c => c.type).filter(Boolean))]
        };
        
    } catch (erro) {
        return { valido: false, erro: erro.message };
    }
}

// Função para validar questões integradas
function validarQuestoesIntegradas(moduloPath, numeroModulo) {
    try {
        const modulo = parseModuloJS(moduloPath, numeroModulo);
        
        if (!modulo.quiz || !modulo.quiz.questoes || !Array.isArray(modulo.quiz.questoes)) {
            return { valido: false, erro: 'Quiz não encontrado ou estrutura inválida' };
        }
        
        const questoes = modulo.quiz.questoes;
        if (questoes.length === 0) {
            return { valido: false, erro: 'Quiz vazio' };
        }
        
        const problemas = [];
        let questoesValidas = 0;
        
        questoes.forEach((questao, index) => {
            // Verificar campos obrigatórios (estrutura atual)
            if (!questao.pergunta || !questao.alternativas || !Array.isArray(questao.alternativas)) {
                problemas.push(`Questão ${index + 1}: Pergunta ou alternativas ausentes`);
                return;
            }
            
            // Verificar se há pelo menos 2 alternativas
            if (questao.alternativas.length < 2) {
                problemas.push(`Questão ${index + 1}: Mínimo de 2 alternativas necessário`);
                return;
            }
            
            // Verificar se há exatamente uma alternativa correta
            const alternativasCorretas = questao.alternativas.filter(alt => alt.correta === true);
            if (alternativasCorretas.length !== 1) {
                problemas.push(`Questão ${index + 1}: Deve ter exatamente 1 alternativa correta (encontradas: ${alternativasCorretas.length})`);
                return;
            }
            
            // Verificar se todas as alternativas têm texto e feedback
            questao.alternativas.forEach((alt, altIndex) => {
                if (!alt.texto) {
                    problemas.push(`Questão ${index + 1}, Alternativa ${altIndex + 1}: Texto ausente`);
                }
                if (!alt.feedback) {
                    problemas.push(`Questão ${index + 1}, Alternativa ${altIndex + 1}: Feedback ausente`);
                }
            });
            
            questoesValidas++;
        });
        
        // Validar feedbacks educativos
        const problemasFeedbacks = validarFeedbacksEducativos(questoes);
        problemas.push(...problemasFeedbacks);
        
        // Validar embaralhamento
        const problemasEmbaralhamento = validarEmbaralhamento(questoes);
        problemas.push(...problemasEmbaralhamento);
        
        return {
            valido: problemas.length === 0,
            totalQuestoes: questoes.length,
            questoesValidas: questoesValidas,
            problemas: problemas,
            questoesEsperadas: QUESTOES_ESPERADAS
        };
        
    } catch (erro) {
        return { valido: false, erro: erro.message };
    }
}

// Função para validar paleta de cores
function validarPaletaCores() {
    console.log('\n🎨 VALIDANDO PALETA DE CORES...');
    
    const cssPath = path.join(publicPath, 'style.css');
    if (!fs.existsSync(cssPath)) {
        console.log('❌ Arquivo CSS não encontrado');
        return false;
    }
    
    try {
        const css = fs.readFileSync(cssPath, 'utf8');
        const coresEncontradas = [];
        
        Object.entries(PALETA_CORES).forEach(([nome, cor]) => {
            if (css.includes(cor)) {
                coresEncontradas.push(nome);
                console.log(`✅ Cor ${nome} (${cor}) encontrada`);
            } else {
                console.log(`⚠️ Cor ${nome} (${cor}) não encontrada`);
            }
        });
        
        return coresEncontradas.length >= 3; // Pelo menos 3 cores da paleta
        
    } catch (erro) {
        console.log(`❌ Erro ao validar paleta de cores: ${erro.message}`);
        return false;
    }
}

// Função para validar sistema de certificação
function validarCertificacao() {
    console.log('\n🎓 VALIDANDO SISTEMA DE CERTIFICAÇÃO...');
    
    const certificacaoArquivos = [
        { caminho: path.join(publicPath, 'certificate-generator.js'), descricao: 'Gerador de certificados' },
        { caminho: path.join(publicPath, 'certificate-manager.js'), descricao: 'Gerenciador de certificados' },
        { caminho: path.join(publicPath, 'certificate-modal.html'), descricao: 'Modal de certificado' }
    ];
    
    let arquivosOk = 0;
    certificacaoArquivos.forEach(arquivo => {
        if (fs.existsSync(arquivo.caminho)) {
            console.log(`✅ ${arquivo.descricao}: OK`);
            arquivosOk++;
        } else {
            console.log(`❌ ${arquivo.descricao}: NÃO ENCONTRADO`);
        }
    });
    
    return arquivosOk >= 2; // Pelo menos 2 dos 3 arquivos
}

// Função para validar sistema de progresso detalhado
function validarProgressoDetalhado() {
    console.log('\n📈 VALIDANDO SISTEMA DE PROGRESSO DETALHADO...');
    
    const progressoArquivos = [
        { caminho: path.join(publicPath, 'progress-manager.js'), descricao: 'Gerenciador de progresso' },
        { caminho: path.join(publicPath, 'progress-config.json'), descricao: 'Configuração de progresso' }
    ];
    
    let arquivosOk = 0;
    let funcionalidadesProgresso = 0;
    
    progressoArquivos.forEach(arquivo => {
        if (fs.existsSync(arquivo.caminho)) {
            console.log(`✅ ${arquivo.descricao}: OK`);
            arquivosOk++;
            
            // Verificar funcionalidades específicas no progress-manager.js
            if (arquivo.descricao === 'Gerenciador de progresso') {
                try {
                    const conteudo = fs.readFileSync(arquivo.caminho, 'utf8');
                    
                    // Verificar localStorage
                    if (conteudo.includes('localStorage')) {
                        console.log('✅ localStorage configurado para salvar progresso');
                        funcionalidadesProgresso++;
                    } else {
                        console.log('⚠️ localStorage não encontrado no gerenciador de progresso');
                    }
                    
                    // Verificar funções de progresso por módulo
                    if (conteudo.includes('modulo') || conteudo.includes('module')) {
                        console.log('✅ Funções de progresso por módulo encontradas');
                        funcionalidadesProgresso++;
                    } else {
                        console.log('⚠️ Funções de progresso por módulo não encontradas');
                    }
                    
                    // Verificar funções de quiz
                    if (conteudo.includes('quiz') || conteudo.includes('questao')) {
                        console.log('✅ Funções de progresso de quiz encontradas');
                        funcionalidadesProgresso++;
                    } else {
                        console.log('⚠️ Funções de progresso de quiz não encontradas');
                    }
                    
                    // Verificar funções de avaliação final
                    if (conteudo.includes('avaliacao') || conteudo.includes('final')) {
                        console.log('✅ Funções de progresso de avaliação final encontradas');
                        funcionalidadesProgresso++;
                    } else {
                        console.log('⚠️ Funções de progresso de avaliação final não encontradas');
                    }
                    
                    // Verificar funções de certificado
                    if (conteudo.includes('certificado') || conteudo.includes('certificate')) {
                        console.log('✅ Funções de progresso de certificado encontradas');
                        funcionalidadesProgresso++;
                    } else {
                        console.log('⚠️ Funções de progresso de certificado não encontradas');
                    }
                    
                } catch (e) {
                    console.log('❌ Erro ao verificar funcionalidades de progresso');
                }
            }
        } else {
            console.log(`❌ ${arquivo.descricao}: NÃO ENCONTRADO`);
        }
    });
    
    // Verificar se o progress-config.json tem estrutura adequada
    if (fs.existsSync(progressoArquivos[1].caminho)) {
        try {
            const config = JSON.parse(fs.readFileSync(progressoArquivos[1].caminho, 'utf8'));
            
            if (config.modulos && Array.isArray(config.modulos)) {
                console.log(`✅ Configuração de módulos: ${config.modulos.length} módulos`);
                funcionalidadesProgresso++;
            } else {
                console.log('⚠️ Configuração de módulos não encontrada');
            }
            
            if (config.avaliacaoFinal) {
                console.log('✅ Configuração de avaliação final encontrada');
                funcionalidadesProgresso++;
            } else {
                console.log('⚠️ Configuração de avaliação final não encontrada');
            }
            
        } catch (e) {
            console.log('❌ Erro ao verificar configuração de progresso');
        }
    }
    
    return arquivosOk >= 1 && funcionalidadesProgresso >= 3; // Pelo menos 1 arquivo e 3 funcionalidades
}

// Função para validar navegação entre módulos
function validarNavegacao() {
    console.log('\n🧭 VALIDANDO NAVEGAÇÃO ENTRE MÓDULOS...');
    
    const modulosExistentes = [];
    for (let i = 1; i <= TOTAL_MODULOS; i++) {
        const moduloPath = path.join(dataPath, `module${i}.js`);
        if (fs.existsSync(moduloPath)) {
            modulosExistentes.push(i);
        }
    }
    
    if (modulosExistentes.length === 0) {
        console.log('❌ Nenhum módulo encontrado');
        return false;
    }
    
    console.log(`✅ Módulos encontrados: ${modulosExistentes.join(', ')}`);
    
    // Verificar sequência
    const sequenciaCorreta = modulosExistentes.every((modulo, index) => {
        return modulo === index + 1;
    });
    
    if (sequenciaCorreta) {
        console.log('✅ Sequência de módulos correta');
    } else {
        console.log('⚠️ Sequência de módulos com gaps');
    }
    
    return true;
}

// Função para validar integração com áudios
function validarIntegracaoAudios() {
    console.log('\n🎵 VALIDANDO INTEGRAÇÃO COM ÁUDIOS...');
    
    const audioPath = path.join(publicPath, 'MRS', 'Audios');
    if (!fs.existsSync(audioPath)) {
        console.log('❌ Pasta de áudios não encontrada');
        return false;
    }
    
    const arquivos = fs.readdirSync(audioPath);
    const audiosWav = arquivos.filter(arq => arq.endsWith('.wav'));
    
    // Verificar se os nomes dos áudios seguem o padrão esperado
    const padraoEsperado = /Curso MRS - Mod \d+\.wav/;
    const audiosCorretos = audiosWav.filter(audio => padraoEsperado.test(audio));
    
    if (audiosCorretos.length === audiosWav.length) {
        console.log('✅ Todos os áudios seguem o padrão de nomenclatura');
    } else {
        console.log(`⚠️ ${audiosWav.length - audiosCorretos.length} áudios não seguem o padrão`);
    }
    
    // Verificar se há áudio para cada módulo
    const modulosComAudio = [];
    for (let i = 1; i <= TOTAL_MODULOS; i++) {
        const audioEsperado = `Curso MRS - Mod ${i}.wav`;
        if (audiosWav.includes(audioEsperado)) {
            modulosComAudio.push(i);
        }
    }
    
    console.log(`📻 Módulos com áudio: ${modulosComAudio.join(', ')}`);
    
    return audiosWav.length >= TOTAL_MODULOS;
}

// Função para validar responsividade
function validarResponsividade() {
    console.log('\n📱 VALIDANDO RESPONSIVIDADE...');
    
    const cssPath = path.join(publicPath, 'style.css');
    if (!fs.existsSync(cssPath)) {
        console.log('❌ Arquivo CSS não encontrado');
        return false;
    }
    
    try {
        const css = fs.readFileSync(cssPath, 'utf8');
        
        const mediaQueries = css.match(/@media[^{]+{/g);
        const flexbox = css.includes('display: flex') || css.includes('display:flex');
        const grid = css.includes('display: grid') || css.includes('display:grid');
        const viewport = css.includes('viewport') || css.includes('width=device-width');
        
        console.log(`📐 Media queries encontradas: ${mediaQueries ? mediaQueries.length : 0}`);
        console.log(`🔲 Flexbox utilizado: ${flexbox ? '✅' : '❌'}`);
        console.log(`🔳 Grid utilizado: ${grid ? '✅' : '❌'}`);
        console.log(`📱 Viewport configurado: ${viewport ? '✅' : '❌'}`);
        
        return mediaQueries && mediaQueries.length > 0;
        
    } catch (erro) {
        console.log(`❌ Erro ao ler CSS: ${erro.message}`);
        return false;
    }
}

// Função para validar acessibilidade
function validarAcessibilidade() {
    console.log('\n♿ VALIDANDO ACESSIBILIDADE...');
    
    const htmlPath = path.join(publicPath, 'index.html');
    if (!fs.existsSync(htmlPath)) {
        console.log('❌ Arquivo HTML não encontrado');
        return false;
    }
    
    try {
        const html = fs.readFileSync(htmlPath, 'utf8');
        
        const altTags = (html.match(/alt=/g) || []).length;
        const ariaLabels = (html.match(/aria-label=/g) || []).length;
        const semanticTags = (html.match(/<main>|<nav>|<section>|<article>|<header>|<footer>/g) || []).length;
        const headings = (html.match(/<h[1-6][^>]*>/g) || []).length;
        
        console.log(`🖼️ Imagens com alt: ${altTags}`);
        console.log(`🏷️ Aria-labels: ${ariaLabels}`);
        console.log(`📄 Tags semânticas: ${semanticTags}`);
        console.log(`📋 Headings: ${headings}`);
        
        return altTags > 0 && headings > 0;
        
    } catch (erro) {
        console.log(`❌ Erro ao ler HTML: ${erro.message}`);
        return false;
    }
}

// Função para validar lista de questões incorretas na avaliação final
function validarListaQuestoesIncorretas() {
    console.log('\n📝 VALIDANDO LISTA DE QUESTÕES INCORRETAS...');
    
    const avaliacaoPath = path.join(dataPath, 'avaliacaoFinal.js');
    if (!fs.existsSync(avaliacaoPath)) {
        console.log('❌ Arquivo de avaliação final não encontrado');
        return false;
    }
    
    try {
        const conteudo = fs.readFileSync(avaliacaoPath, 'utf8');
        const match = conteudo.match(/const avaliacaoFinal = (\{[\s\S]*?\});/);
        
        if (!match) {
            console.log('❌ Estrutura de avaliação final inválida');
            return false;
        }
        
        // eslint-disable-next-line no-new-func
        const avaliacao = (new Function('return ' + match[1]))();
        
        if (!avaliacao.questoes || !Array.isArray(avaliacao.questoes)) {
            console.log('❌ Questões da avaliação final não encontradas');
            return false;
        }
        
        // Verificar se há estrutura para identificar questões incorretas
        let questoesComFeedback = 0;
        let questoesComEstruturaIncorreta = 0;
        
        avaliacao.questoes.forEach((questao, index) => {
            if (questao.alternativas && Array.isArray(questao.alternativas)) {
                const alternativasComFeedback = questao.alternativas.filter(alt => alt.feedback);
                if (alternativasComFeedback.length > 0) {
                    questoesComFeedback++;
                }
                
                // Verificar se há estrutura para identificar respostas incorretas
                const alternativasIncorretas = questao.alternativas.filter(alt => alt.correta === false);
                if (alternativasIncorretas.length > 0) {
                    questoesComEstruturaIncorreta++;
                }
            }
        });
        
        console.log(`✅ Questões com feedback: ${questoesComFeedback}/${avaliacao.questoes.length}`);
        console.log(`✅ Questões com estrutura para incorretas: ${questoesComEstruturaIncorreta}/${avaliacao.questoes.length}`);
        
        // Verificar se o frontend tem funcionalidade para mostrar questões incorretas
        const scriptPath = path.join(publicPath, 'script.js');
        if (fs.existsSync(scriptPath)) {
            const scriptConteudo = fs.readFileSync(scriptPath, 'utf8');
            
            if (scriptConteudo.includes('incorreta') || scriptConteudo.includes('errada') || scriptConteudo.includes('wrong')) {
                console.log('✅ Funcionalidade para questões incorretas encontrada no frontend');
                return questoesComFeedback >= avaliacao.questoes.length * 0.8; // Pelo menos 80% das questões
            } else {
                console.log('⚠️ Funcionalidade para questões incorretas não encontrada no frontend');
                return false;
            }
        } else {
            console.log('❌ Arquivo script.js não encontrado');
            return false;
        }
        
    } catch (erro) {
        console.log(`❌ Erro ao validar lista de questões incorretas: ${erro.message}`);
        return false;
    }
}

// Função para validar avaliação final
function validarAvaliacaoFinal() {
    console.log('\n📝 VALIDANDO AVALIAÇÃO FINAL...');
    
    const avaliacaoPath = path.join(dataPath, 'avaliacaoFinal.js');
    if (!fs.existsSync(avaliacaoPath)) {
        console.log('❌ Arquivo de avaliação final não encontrado');
        return false;
    }
    
    try {
        const conteudo = fs.readFileSync(avaliacaoPath, 'utf8');
        const match = conteudo.match(/const avaliacaoFinal = (\{[\s\S]*?\});/);
        
        if (!match) {
            console.log('❌ Estrutura de avaliação final inválida');
            return false;
        }
        
        // eslint-disable-next-line no-new-func
        const avaliacao = (new Function('return ' + match[1]))();
        
        if (!avaliacao.questoes || !Array.isArray(avaliacao.questoes)) {
            console.log('❌ Questões da avaliação final não encontradas');
            return false;
        }
        
        console.log(`✅ Avaliação final: ${avaliacao.questoes.length} questões`);
        
        // Validar estrutura das questões
        let questoesValidas = 0;
        avaliacao.questoes.forEach((questao, index) => {
            if (questao.pergunta && questao.alternativas && Array.isArray(questao.alternativas)) {
                const alternativasCorretas = questao.alternativas.filter(alt => alt.correta === true);
                if (alternativasCorretas.length === 1) {
                    questoesValidas++;
                }
            }
        });
        
        console.log(`✅ Questões válidas: ${questoesValidas}/${avaliacao.questoes.length}`);
        
        // Validar feedbacks educativos na avaliação final
        const problemasFeedbacks = validarFeedbacksEducativos(avaliacao.questoes);
        if (problemasFeedbacks.length > 0) {
            console.log(`⚠️ Problemas nos feedbacks: ${problemasFeedbacks.length} encontrados`);
        }
        
        return questoesValidas >= 45; // Pelo menos 90% das questões válidas
        
    } catch (erro) {
        console.log(`❌ Erro ao validar avaliação final: ${erro.message}`);
        return false;
    }
}

// Função para validar embaralhamento da avaliação final
function validarEmbaralhamentoAvaliacaoFinal() {
    console.log('\n🔀 VALIDANDO EMBARALHAMENTO DA AVALIAÇÃO FINAL...');
    
    const avaliacaoPath = path.join(dataPath, 'avaliacaoFinal.js');
    if (!fs.existsSync(avaliacaoPath)) {
        console.log('❌ Arquivo de avaliação final não encontrado');
        return false;
    }
    
    try {
        const conteudo = fs.readFileSync(avaliacaoPath, 'utf8');
        const match = conteudo.match(/const avaliacaoFinal = (\{[\s\S]*?\});/);
        
        if (!match) {
            console.log('❌ Estrutura de avaliação final inválida');
            return false;
        }
        
        // eslint-disable-next-line no-new-func
        const avaliacao = (new Function('return ' + match[1]))();
        
        if (!avaliacao.questoes || !Array.isArray(avaliacao.questoes)) {
            console.log('❌ Questões da avaliação final não encontradas');
            return false;
        }
        
        const questoes = avaliacao.questoes;
        const problemas = [];
        let questoesComEmbaralhamento = 0;
        let questoesSemEmbaralhamento = 0;
        
        questoes.forEach((questao, index) => {
            const alternativasCorretas = questao.alternativas.filter(alt => alt.correta === true);
            if (alternativasCorretas.length === 1) {
                const posicaoCorreta = questao.alternativas.findIndex(alt => alt.correta === true);
                
                // Verificar se a alternativa correta está sempre na primeira posição
                if (posicaoCorreta === 0) {
                    problemas.push(`Questão ${index + 1}: Alternativa correta sempre na primeira posição`);
                    questoesSemEmbaralhamento++;
                } else {
                    questoesComEmbaralhamento++;
                }
            }
        });
        
        console.log(`✅ Questões com embaralhamento: ${questoesComEmbaralhamento}/${questoes.length}`);
        console.log(`⚠️ Questões sem embaralhamento: ${questoesSemEmbaralhamento}/${questoes.length}`);
        
        if (problemas.length > 0) {
            console.log(`🔧 Questões que precisam de embaralhamento: ${problemas.slice(0, 5).join(', ')}${problemas.length > 5 ? '...' : ''}`);
        }
        
        // Considerar válido se pelo menos 80% das questões estão embaralhadas
        const percentualEmbaralhado = (questoesComEmbaralhamento / questoes.length) * 100;
        const valido = percentualEmbaralhado >= 80;
        
        console.log(`📊 Percentual de embaralhamento: ${percentualEmbaralhado.toFixed(1)}%`);
        console.log(`🎯 Status: ${valido ? '✅ EMBARALHAMENTO ADEQUADO' : '❌ EMBARALHAMENTO INSUFICIENTE'}`);
        
        return valido;
        
    } catch (erro) {
        console.log(`❌ Erro ao validar embaralhamento da avaliação final: ${erro.message}`);
        return false;
    }
}

// Função principal de validação
function executarValidacaoCompleta() {
    console.log('🔍 INICIANDO VALIDAÇÃO COMPLETA DE FUNCIONALIDADES\n');
    
    const resultados = {
        navegacao: validarNavegacao(),
        audios: validarIntegracaoAudios(),
        responsividade: validarResponsividade(),
        acessibilidade: validarAcessibilidade(),
        avaliacaoFinal: validarAvaliacaoFinal(),
        embaralhamentoAvaliacao: validarEmbaralhamentoAvaliacaoFinal(),
        paletaCores: validarPaletaCores(),
        certificacao: validarCertificacao(),
        progresso: validarProgressoDetalhado(),
        questoesIncorretas: validarListaQuestoesIncorretas()
    };
    
    // Validar módulos individuais
    console.log('\n📚 VALIDANDO MÓDULOS INDIVIDUAIS...');
    const modulosValidos = [];
    const modulosComQuizzes = [];
    const detalhesModulos = [];
    
    for (let i = 1; i <= TOTAL_MODULOS; i++) {
        const moduloPath = path.join(dataPath, `module${i}.js`);
        
        if (fs.existsSync(moduloPath)) {
            console.log(`\n📖 Módulo ${i}:`);
            
            // Validar cards
            const resultadoCards = validarEstruturaCards(moduloPath, i);
            const resultadoQuestoes = validarQuestoesIntegradas(moduloPath, i);
            
            const detalheModulo = {
                modulo: i,
                cards: resultadoCards,
                questoes: resultadoQuestoes
            };
            detalhesModulos.push(detalheModulo);
            
            if (resultadoCards.valido) {
                console.log(`   ✅ Cards válidos: ${resultadoCards.cardsValidos}/${resultadoCards.totalCards}`);
                console.log(`   📋 Tipos de cards: ${resultadoCards.tiposCards.join(', ')}`);
                modulosValidos.push(i);
            } else {
                console.log(`   ❌ Problemas nos cards: ${resultadoCards.erro || resultadoCards.problemas.join(', ')}`);
            }
            
            if (resultadoQuestoes.valido) {
                console.log(`   ✅ Quiz válido: ${resultadoQuestoes.questoesValidas}/${resultadoQuestoes.totalQuestoes} questões`);
                modulosComQuizzes.push(i);
            } else {
                console.log(`   ❌ Problemas no quiz: ${resultadoQuestoes.erro || resultadoQuestoes.problemas.join(', ')}`);
            }
        } else {
            console.log(`\n📖 Módulo ${i}: ❌ Arquivo não encontrado`);
        }
    }
    
    // Salvar log detalhado
    try {
        if (!fs.existsSync('logs')) fs.mkdirSync('logs');
        const logCompleto = {
            timestamp: new Date().toISOString(),
            resultados: resultados,
            modulos: detalhesModulos,
            resumo: {
                modulosValidos: modulosValidos.length,
                modulosComQuizzes: modulosComQuizzes.length,
                totalModulos: TOTAL_MODULOS
            }
        };
        fs.writeFileSync(logPath, JSON.stringify(logCompleto, null, 2), 'utf8');
        console.log(`\n📄 Log detalhado salvo em ${logPath}`);
    } catch (e) {
        console.log('⚠️  Não foi possível salvar o log detalhado:', e.message);
    }
    
    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA VALIDAÇÃO DE FUNCIONALIDADES');
    console.log('='.repeat(60));
    
    console.log(`🧭 Navegação: ${resultados.navegacao ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`🎵 Integração áudios: ${resultados.audios ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`📱 Responsividade: ${resultados.responsividade ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`♿ Acessibilidade: ${resultados.acessibilidade ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`📝 Avaliação final: ${resultados.avaliacaoFinal ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`🔀 Embaralhamento avaliação: ${resultados.embaralhamentoAvaliacao ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`🎨 Paleta de cores: ${resultados.paletaCores ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`🎓 Certificação: ${resultados.certificacao ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`📈 Progresso detalhado: ${resultados.progresso ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`📋 Questões incorretas: ${resultados.questoesIncorretas ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`📚 Módulos válidos: ${modulosValidos.length}/${TOTAL_MODULOS}`);
    console.log(`❓ Módulos com quizzes: ${modulosComQuizzes.length}/${TOTAL_MODULOS}`);
    
    // Verificação de sucesso
    const sucesso = resultados.navegacao && 
                   resultados.audios && 
                   modulosValidos.length >= TOTAL_MODULOS - 1 &&
                   modulosComQuizzes.length >= TOTAL_MODULOS - 1 &&
                   resultados.avaliacaoFinal &&
                   resultados.embaralhamentoAvaliacao &&
                   resultados.progresso;
    
    console.log('\n' + '='.repeat(60));
    if (sucesso) {
        console.log('🎉 VALIDAÇÃO DE FUNCIONALIDADES CONCLUÍDA COM SUCESSO!');
        console.log('✅ Todas as funcionalidades principais estão válidas');
        console.log('🚀 Sistema pronto para uso em produção');
    } else {
        console.log('⚠️ PROBLEMAS DETECTADOS NA VALIDAÇÃO');
        console.log('🔧 Verifique os itens marcados com ❌');
        console.log('📋 Execute os scripts de correção se necessário');
    }
    console.log('='.repeat(60));
    
    return sucesso;
}

// Executar validação se chamado diretamente
if (require.main === module) {
    executarValidacaoCompleta();
}

module.exports = { executarValidacaoCompleta }; 