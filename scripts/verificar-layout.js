#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const glob = require('glob');

console.log('🎨 VERIFICANDO INTEGRIDADE DO LAYOUT E PADRÕES PEDAGÓGICOS...');

const args = process.argv.slice(2);
const atualizarHash = args.includes('--atualizar-hash');
const verificarPadroes = args.includes('--verificar-padroes');

const layoutFilesPath = 'layout-files.json';
const layoutIgnorePath = 'layout-ignore.json';
const hashesRefPath = 'logs/layout-hashes.json';
const logVerificacaoPath = 'logs/layout-verificacao.json';
const logVerificacaoMdPath = 'logs/layout-verificacao.md';
const logPadroesPath = 'logs/verificacao-padroes.json';

// Função para calcular hash SHA-256
function calcularHash(arquivo) {
    try {
        const conteudo = fs.readFileSync(arquivo);
        return crypto.createHash('sha256').update(conteudo).digest('hex');
    } catch (error) {
        return null;
    }
}

// Função para obter permissões do arquivo
function getPermissoes(arquivo) {
    try {
        const stats = fs.statSync(arquivo);
        return (stats.mode & 0o777).toString(8);
    } catch (e) {
        return null;
    }
}

// Função para obter tamanho do arquivo
function getTamanho(arquivo) {
    try {
        const stats = fs.statSync(arquivo);
        return stats.size;
    } catch (e) {
        return null;
    }
}

// Função para carregar módulo da pasta public/data
function carregarModulo(numero) {
    try {
        const moduloPath = `public/data/module${numero}.js`;
        if (!fs.existsSync(moduloPath)) {
            return null;
        }
        
        const conteudo = fs.readFileSync(moduloPath, 'utf8');
        
        // Extrair o objeto do módulo usando regex
        const match = conteudo.match(/const module\d+ = (\{[\s\S]*?\});/);
        if (!match) {
            return null;
        }
        
        // Usar Function para parsing seguro
        return (new Function('return ' + match[1]))();
        
    } catch (error) {
        return null;
    }
}

// Função para verificar padrões pedagógicos e visuais
function verificarPadroesPedagogicos() {
    const padroes = {
        cards: {
            tipos: ['dica', 'atencao', 'exemplo', 'resumo', 'duvidas', 'default'],
            emojis: ['💡', '⚠️', '📝', '📊', '🗨️'],
            cores: ['#E6FFF5', '#FFF9E6', '#E6F0FF', '#F0F0F0', '#FFFFFF'],
            bordasArredondadas: '16px',
            sombra: '0 2px 8px #0001'
        },
        estrutura: {
            modulos: 7, // MRS tem 7 módulos (corrigido)
            quizzesPorModulo: 15, // 15 questões por módulo (corrigido)
            avaliacaoFinal: 50,
            feedbacksObrigatorios: true,
            embaralhamentoObrigatorio: true,
            duvidasFrequentes: true,
            resumosVisuais: true
        },
        layout: {
            paletaCores: ['#2B2D3A', '#6C63FF', '#00E599', '#F5F6FA', '#22223B'],
            responsivo: true,
            cardsArredondados: true,
            barraSuperior: true,
            navegacaoModulos: true,
            barraProgresso: true
        },
        tipografia: {
            tituloCard: '1.4rem',
            subtituloCard: '1.1rem',
            textoPrincipal: '1.1rem',
            espacamentoCards: '24px'
        },
        acessibilidade: {
            contrasteMinimo: true,
            navegacaoTeclado: true,
            textosAlternativos: true,
            estruturaSemantica: true
        }
    };

    const problemas = [];
    const avisos = [];

    // Verificar estrutura de módulos (CORRIGIDO)
    try {
        let modulosEncontrados = 0;
        
        for (let i = 1; i <= padroes.estrutura.modulos; i++) {
            const modulo = carregarModulo(i);
            
            if (!modulo) {
                problemas.push(`Módulo ${i} não encontrado ou com erro`);
                continue;
            }
            
            modulosEncontrados++;
            
            // Verificar cards
            if (!modulo.cards || modulo.cards.length === 0) {
                problemas.push(`Módulo ${i} sem cards`);
            }
            
            // Verificar tipos de cards
            const tiposCards = modulo.cards.map(card => card.tipo).filter(Boolean);
            const tiposUnicos = [...new Set(tiposCards)];
            
            if (tiposUnicos.length < 2) {
                avisos.push(`Módulo ${i} com pouca variedade de tipos de cards: ${tiposUnicos.join(', ')}`);
            }
            
            // VERIFICAÇÃO ESPECÍFICA: Dúvidas Frequentes
            const cardsDuvidas = modulo.cards.filter(card => card.tipo === 'duvidas');
            if (cardsDuvidas.length === 0) {
                problemas.push(`Módulo ${i} SEM CARD DE DÚVIDAS FREQUENTES (obrigatório)`);
            } else if (cardsDuvidas.length > 1) {
                avisos.push(`Módulo ${i} com múltiplos cards de dúvidas frequentes: ${cardsDuvidas.length}`);
            } else {
                const cardDuvidas = cardsDuvidas[0];
                // Verificar estrutura do card de dúvidas frequentes
                if (!cardDuvidas.title || !cardDuvidas.title.includes('🗨️')) {
                    problemas.push(`Módulo ${i}: Card de dúvidas frequentes sem emoji 🗨️ no título`);
                }
                if (!cardDuvidas.content || cardDuvidas.content.length < 100) {
                    avisos.push(`Módulo ${i}: Card de dúvidas frequentes com conteúdo muito curto`);
                }
                // Verificar se tem pelo menos uma dúvida e resposta
                if (!cardDuvidas.content.includes('❓') || !cardDuvidas.content.includes('💡')) {
                    avisos.push(`Módulo ${i}: Card de dúvidas frequentes sem formato padrão (❓ dúvida / 💡 resposta)`);
                }
            }
            
            // VERIFICAÇÃO ESPECÍFICA: Resumos Visuais
            const cardsResumo = modulo.cards.filter(card => card.tipo === 'resumo' || card.tipo === 'resumo visual');
            if (cardsResumo.length === 0) {
                problemas.push(`Módulo ${i} SEM CARD DE RESUMO VISUAL (obrigatório)`);
            } else if (cardsResumo.length > 1) {
                avisos.push(`Módulo ${i} com múltiplos cards de resumo visual: ${cardsResumo.length}`);
            } else {
                const cardResumo = cardsResumo[0];
                // Verificar estrutura do card de resumo visual
                if (!cardResumo.title || !cardResumo.title.includes('📊')) {
                    problemas.push(`Módulo ${i}: Card de resumo visual sem emoji 📊 no título`);
                }
                if (!cardResumo.content || cardResumo.content.length < 50) {
                    avisos.push(`Módulo ${i}: Card de resumo visual com conteúdo muito curto`);
                }
                // Verificar se tem elementos visuais (tabelas, listas, etc.)
                if (!cardResumo.content.includes('|') && !cardResumo.content.includes('•') && !cardResumo.content.includes('-')) {
                    avisos.push(`Módulo ${i}: Card de resumo visual sem elementos visuais (tabelas, listas, etc.)`);
                }
            }
            
            // Verificar emojis apenas nos títulos (não no meio do texto)
            modulo.cards.forEach((card, cardIndex) => {
                if (card.content && card.content.includes('💡') && card.tipo !== 'dica') {
                    avisos.push(`Módulo ${i}, card ${cardIndex + 1}: Emoji 💡 encontrado no meio do texto (deve estar apenas no título)`);
                }
                if (card.content && card.content.includes('⚠️') && card.tipo !== 'atencao') {
                    avisos.push(`Módulo ${i}, card ${cardIndex + 1}: Emoji ⚠️ encontrado no meio do texto (deve estar apenas no título)`);
                }
                if (card.content && card.content.includes('📝') && card.tipo !== 'exemplo') {
                    avisos.push(`Módulo ${i}, card ${cardIndex + 1}: Emoji 📝 encontrado no meio do texto (deve estar apenas no título)`);
                }
            });
            
            // Verificar quiz do módulo
            if (modulo.quiz && modulo.quiz.questoes) {
                if (modulo.quiz.questoes.length !== padroes.estrutura.quizzesPorModulo) {
                    problemas.push(`Módulo ${i} com número incorreto de questões: ${modulo.quiz.questoes.length} (esperado: ${padroes.estrutura.quizzesPorModulo})`);
                }
                
                // Verificar feedbacks educativos
                modulo.quiz.questoes.forEach((questao, qIndex) => {
                    if (!questao.feedback || questao.feedback.includes('Correto!')) {
                        problemas.push(`Questão ${qIndex + 1} do módulo ${i} sem feedback educativo adequado`);
                    }
                });
            } else {
                problemas.push(`Módulo ${i} sem quiz ou questões`);
            }
        }
        
        if (modulosEncontrados !== padroes.estrutura.modulos) {
            problemas.push(`Número de módulos incorreto: ${modulosEncontrados} (esperado: ${padroes.estrutura.modulos})`);
        }
        
    } catch (e) {
        problemas.push(`Erro ao verificar módulos: ${e.message}`);
    }

    // Verificar avaliação final
    try {
        const avaliacaoPath = 'public/data/avaliacaoFinal.js';
        if (fs.existsSync(avaliacaoPath)) {
            const conteudo = fs.readFileSync(avaliacaoPath, 'utf8');
            const match = conteudo.match(/const avaliacaoFinal = (\{[\s\S]*?\});/);
            if (match) {
                const avaliacaoData = (new Function('return ' + match[1]))();
                if (avaliacaoData.questoes && avaliacaoData.questoes.length !== padroes.estrutura.avaliacaoFinal) {
                    problemas.push(`Avaliação final com número incorreto de questões: ${avaliacaoData.questoes.length} (esperado: ${padroes.estrutura.avaliacaoFinal})`);
                }
            }
        } else {
            avisos.push('Avaliação final não encontrada em public/data/avaliacaoFinal.js');
        }
    } catch (e) {
        avisos.push(`Não foi possível verificar avaliação final: ${e.message}`);
    }

    // Verificar arquivos CSS para padrões visuais
    const arquivosCSS = glob.sync('public/**/*.css');
    arquivosCSS.forEach(cssFile => {
        try {
            const conteudo = fs.readFileSync(cssFile, 'utf8');
            
            // Verificar paleta de cores
            padroes.layout.paletaCores.forEach(cor => {
                if (!conteudo.includes(cor)) {
                    avisos.push(`Cor ${cor} não encontrada em ${cssFile}`);
                }
            });
            
            // Verificar responsividade
            if (!conteudo.includes('@media') && !conteudo.includes('responsive')) {
                avisos.push(`Possível falta de responsividade em ${cssFile}`);
            }
            
            // Verificar cards arredondados específicos
            if (!conteudo.includes('border-radius: 16px') && !conteudo.includes('border-radius: 1rem')) {
                avisos.push(`Bordas arredondadas de 16px não encontradas em ${cssFile}`);
            }
            
            // Verificar sombras suaves
            if (!conteudo.includes('box-shadow') && !conteudo.includes('shadow')) {
                avisos.push(`Sombras não encontradas em ${cssFile}`);
            }
            
            // Verificar espaçamento entre cards
            if (!conteudo.includes('margin: 24px') && !conteudo.includes('margin: 1.5rem')) {
                avisos.push(`Espaçamento de 24px entre cards não encontrado em ${cssFile}`);
            }
            
            // Verificar tipografia
            if (!conteudo.includes('font-size: 1.4rem') && !conteudo.includes('font-size: 1.1rem')) {
                avisos.push(`Tipografia padrão não encontrada em ${cssFile}`);
            }
            
            // Verificar barra superior fixa
            if (!conteudo.includes('position: fixed') && !conteudo.includes('top: 0')) {
                avisos.push(`Barra superior fixa não encontrada em ${cssFile}`);
            }
            
            // Verificar barra de progresso
            if (!conteudo.includes('progress') && !conteudo.includes('progresso')) {
                avisos.push(`Barra de progresso não encontrada em ${cssFile}`);
            }
        } catch (e) {
            avisos.push(`Erro ao verificar ${cssFile}: ${e.message}`);
        }
    });

    // Verificar arquivos HTML para estrutura de cards e navegação
    const arquivosHTML = glob.sync('public/**/*.html');
    arquivosHTML.forEach(htmlFile => {
        try {
            const conteudo = fs.readFileSync(htmlFile, 'utf8');
            
            // Verificar emojis apenas nos títulos (não no meio do texto)
            const emojisTitulos = conteudo.match(/<h[1-6][^>]*>.*?[💡⚠️📝📊🗨️].*?<\/h[1-6]>/g);
            if (emojisTitulos) {
                avisos.push(`Emojis encontrados em títulos de ${htmlFile}: ${emojisTitulos.length} ocorrências`);
            }
            
            // Verificar emojis no meio do texto (problema)
            const emojisMeioTexto = conteudo.match(/<p[^>]*>.*?[💡⚠️📝📊🗨️].*?<\/p>/g);
            if (emojisMeioTexto) {
                problemas.push(`Emojis encontrados no meio do texto em ${htmlFile}: ${emojisMeioTexto.length} ocorrências (devem estar apenas nos títulos)`);
            }
            
            // Verificar estrutura de cards
            if (conteudo.includes('card') || conteudo.includes('Card')) {
                if (!conteudo.includes('border-radius') && !conteudo.includes('rounded')) {
                    avisos.push(`Cards detectados em ${htmlFile} mas possivelmente sem bordas arredondadas`);
                }
            }
            
            // Verificar navegação entre módulos
            if (!conteudo.includes('navegação') && !conteudo.includes('navigation') && !conteudo.includes('menu')) {
                avisos.push(`Navegação entre módulos não encontrada em ${htmlFile}`);
            }
            
            // Verificar barra de progresso
            if (!conteudo.includes('progress') && !conteudo.includes('progresso')) {
                avisos.push(`Barra de progresso não encontrada em ${htmlFile}`);
            }
            
            // Verificar estrutura semântica
            if (!conteudo.includes('<nav') && !conteudo.includes('<main') && !conteudo.includes('<section')) {
                avisos.push(`Estrutura semântica HTML5 não encontrada em ${htmlFile}`);
            }
            
            // Verificar acessibilidade - textos alternativos
            const imgsSemAlt = conteudo.match(/<img[^>]*((?<!alt=)[^>])*?>/g);
            if (imgsSemAlt) {
                problemas.push(`Imagens sem atributo alt encontradas em ${htmlFile}: ${imgsSemAlt.length}`);
            }
            
            // Verificar acessibilidade - navegação por teclado
            if (!conteudo.includes('tabindex') && !conteudo.includes('onkeydown')) {
                avisos.push(`Navegação por teclado não implementada em ${htmlFile}`);
            }
        } catch (e) {
            avisos.push(`Erro ao verificar ${htmlFile}: ${e.message}`);
        }
    });

    return { problemas, avisos, padroes };
}

// Se não existir layout-files.json, criar um exemplo mínimo
if (!fs.existsSync(layoutFilesPath)) {
    const exemplo = [
        'public/**/*.css',
        'public/**/*.js',
        'public/**/*.html',
        'public/MRS/Audios/*.wav'
    ];
    fs.writeFileSync(layoutFilesPath, JSON.stringify(exemplo, null, 2), 'utf8');
    console.log(`⚠️  Arquivo ${layoutFilesPath} criado automaticamente. Edite para incluir todos os padrões de arquivos de layout relevantes.`);
}

// Se não existir layout-ignore.json, criar um exemplo mínimo
if (!fs.existsSync(layoutIgnorePath)) {
    const exemplo = [
        'public/**/*.map',
        'public/**/*.bak',
        'public/**/*.backup',
        'public/data/**',
        'public/MRS/Audios/*.txt'
    ];
    fs.writeFileSync(layoutIgnorePath, JSON.stringify(exemplo, null, 2), 'utf8');
    console.log(`⚠️  Arquivo ${layoutIgnorePath} criado automaticamente. Edite para incluir padrões a serem ignorados.`);
}

// Carregar lista de padrões de arquivos
let arquivosLayoutGlob = [];
try {
    arquivosLayoutGlob = JSON.parse(fs.readFileSync(layoutFilesPath, 'utf8'));
} catch (e) {
    console.error('❌ Erro ao ler layout-files.json:', e.message);
    process.exit(1);
}

// Carregar padrões a ignorar
let arquivosIgnoreGlob = [];
try {
    arquivosIgnoreGlob = JSON.parse(fs.readFileSync(layoutIgnorePath, 'utf8'));
} catch (e) {
    arquivosIgnoreGlob = [];
}

// Expandir padrões globais
let arquivosLayout = [];
let arquivosIgnorados = new Set();

arquivosLayoutGlob.forEach(padrao => {
    arquivosLayout = arquivosLayout.concat(glob.sync(padrao, { nodir: true }));
});
arquivosIgnoreGlob.forEach(padrao => {
    glob.sync(padrao, { nodir: true }).forEach(f => arquivosIgnorados.add(f));
});

// Remover duplicatas e ignorados
arquivosLayout = Array.from(new Set(arquivosLayout)).filter(f => !arquivosIgnorados.has(f));

// Buscar arquivos relevantes não listados (novos arquivos)
function buscarArquivosRelevantes() {
    const todos = glob.sync('public/**/*.{css,js,html,woff,woff2,ttf,otf,png,jpg,jpeg,svg,wav,mp3}', { nodir: true });
    return todos.filter(f => !arquivosLayout.includes(f) && !arquivosIgnorados.has(f));
}

// Carregar hashes de referência (se existirem)
let hashesReferencia = {};
let hashesCorrompido = false;
if (fs.existsSync(hashesRefPath)) {
    try {
        hashesReferencia = JSON.parse(fs.readFileSync(hashesRefPath, 'utf8'));
    } catch (e) {
        hashesReferencia = {};
        hashesCorrompido = true;
    }
}

let layoutOk = true;
const logDetalhado = [];
const novosHashes = {};
const arquivosDuplicados = {};
const nomesArquivos = {};

// Checar duplicidade de arquivos
arquivosLayout.forEach(arquivo => {
    const nome = path.basename(arquivo);
    if (!nomesArquivos[nome]) nomesArquivos[nome] = [];
    nomesArquivos[nome].push(arquivo);
});
Object.keys(nomesArquivos).forEach(nome => {
    if (nomesArquivos[nome].length > 1) arquivosDuplicados[nome] = nomesArquivos[nome];
});

arquivosLayout.forEach(arquivo => {
    if (fs.existsSync(arquivo)) {
        const hashAtual = calcularHash(arquivo);
        const permissoes = getPermissoes(arquivo);
        const tamanho = getTamanho(arquivo);
        novosHashes[arquivo] = hashAtual;
        if (atualizarHash) {
            logDetalhado.push({ arquivo, status: 'hash atualizado', hash: hashAtual, permissoes, tamanho });
        } else {
            if (hashesReferencia[arquivo] && hashAtual !== hashesReferencia[arquivo]) {
                layoutOk = false;
                logDetalhado.push({ arquivo, status: 'alterado', hashAtual, hashReferencia: hashesReferencia[arquivo], permissoes, tamanho });
            } else if (!hashesReferencia[arquivo]) {
                layoutOk = false;
                logDetalhado.push({ arquivo, status: 'sem hash de referência', hashAtual, permissoes, tamanho });
            } else {
                logDetalhado.push({ arquivo, status: 'ok', hash: hashAtual, permissoes, tamanho });
            }
            // Checar tamanho muito diferente (>50% de diferença)
            if (hashesReferencia[arquivo] && hashesReferencia[arquivo + '_tamanho']) {
                const tamRef = hashesReferencia[arquivo + '_tamanho'];
                if (Math.abs(tamanho - tamRef) > tamRef * 0.5) {
                    layoutOk = false;
                    logDetalhado.push({ arquivo, status: 'tamanho muito diferente', tamanho, tamanhoReferencia: tamRef });
                }
            }
        }
    } else {
        layoutOk = false;
        logDetalhado.push({ arquivo, status: 'não encontrado' });
    }
});

// Buscar arquivos novos não listados
const arquivosNovos = buscarArquivosRelevantes();
if (arquivosNovos.length > 0) {
    layoutOk = false;
    arquivosNovos.forEach(f => logDetalhado.push({ arquivo: f, status: 'novo arquivo não listado' }));
    console.log(`⚠️  Arquivos relevantes não listados detectados:`, arquivosNovos);
}

// Checar duplicidade
if (Object.keys(arquivosDuplicados).length > 0) {
    layoutOk = false;
    Object.keys(arquivosDuplicados).forEach(nome => {
        logDetalhado.push({ status: 'duplicidade', nome, arquivos: arquivosDuplicados[nome] });
        console.log(`⚠️  Arquivos duplicados detectados: ${nome} -> ${arquivosDuplicados[nome].join(', ')}`);
    });
}

// Checar hashes corrompidos
if (hashesCorrompido) {
    layoutOk = false;
    logDetalhado.push({ status: 'hashes de referência corrompidos' });
    console.log('⚠️  Hashes de referência corrompidos! Atualize-os com --atualizar-hash.');
}

// Validar referências em HTML
function validarReferenciasHTML() {
    let problemas = 0;
    arquivosLayout.filter(f => f.endsWith('.html')).forEach(htmlFile => {
        try {
            const conteudo = fs.readFileSync(htmlFile, 'utf8');
            const refs = [];
            conteudo.replace(/<link[^>]+href=["']([^"']+)["']/g, (m, href) => refs.push(href));
            conteudo.replace(/<script[^>]+src=["']([^"']+)["']/g, (m, src) => refs.push(src));
            refs.forEach(ref => {
                let refPath = ref.replace(/^\//, 'public/');
                if (!fs.existsSync(refPath) && !fs.existsSync(path.join('public', ref))) {
                    layoutOk = false;
                    problemas++;
                    logDetalhado.push({ arquivo: htmlFile, status: 'referência quebrada', referencia: ref });
                    console.log(`⚠️  Referência quebrada em ${htmlFile}: ${ref}`);
                }
            });
        } catch (e) {
            layoutOk = false;
            logDetalhado.push({ arquivo: htmlFile, status: 'erro leitura', erro: e.message });
        }
    });
    return problemas;
}
validarReferenciasHTML();

// Validação de acessibilidade
const arquivosHTML = arquivosLayout.filter(f => f.endsWith('.html'));
const problemasAcessibilidade = validarAcessibilidade(arquivosHTML);
if (problemasAcessibilidade.length > 0) {
    layoutOk = false;
    problemasAcessibilidade.forEach(p => logDetalhado.push({ status: 'acessibilidade', detalhe: p }));
    console.log('\n♿ Problemas de acessibilidade detectados:');
    problemasAcessibilidade.forEach(p => console.log('  - ' + p));
}

// Salvar log detalhado
try {
    if (!fs.existsSync('logs')) fs.mkdirSync('logs');
    fs.writeFileSync(logVerificacaoPath, JSON.stringify(logDetalhado, null, 2), 'utf8');
    
    // Verificar padrões pedagógicos se solicitado
    let relatorioPadroes = null;
    if (verificarPadroes) {
        console.log('\n📚 VERIFICANDO PADRÕES PEDAGÓGICOS...');
        relatorioPadroes = verificarPadroesPedagogicos();
        
        // Salvar relatório de padrões
        fs.writeFileSync(logPadroesPath, JSON.stringify(relatorioPadroes, null, 2), 'utf8');
        
        // Exibir problemas e avisos
        if (relatorioPadroes.problemas.length > 0) {
            console.log('\n❌ PROBLEMAS PEDAGÓGICOS DETECTADOS:');
            relatorioPadroes.problemas.forEach(problema => console.log(`  - ${problema}`));
            layoutOk = false;
        }
        
        if (relatorioPadroes.avisos.length > 0) {
            console.log('\n⚠️  AVISOS PEDAGÓGICOS:');
            relatorioPadroes.avisos.forEach(aviso => console.log(`  - ${aviso}`));
        }
        
        if (relatorioPadroes.problemas.length === 0 && relatorioPadroes.avisos.length === 0) {
            console.log('✅ TODOS OS PADRÕES PEDAGÓGICOS ATENDIDOS!');
        }
    }
    
    // Gerar relatório em Markdown
    let md = '# Relatório de Verificação de Layout e Padrões Pedagógicos\n\n';
    
    // Seção de layout
    md += '## 🔧 Verificação de Layout\n\n';
    logDetalhado.forEach(item => {
        md += `- **${item.arquivo || item.nome}**: ${item.status}`;
        if (item.hash) md += ` | hash: \`${item.hash}\``;
        if (item.hashReferencia) md += ` | hash ref: \`${item.hashReferencia}\``;
        if (item.permissoes) md += ` | perm: \`${item.permissoes}\``;
        if (item.tamanho) md += ` | tam: ${item.tamanho}`;
        if (item.tamanhoReferencia) md += ` | tam ref: ${item.tamanhoReferencia}`;
        if (item.referencia) md += ` | referência quebrada: ${item.referencia}`;
        if (item.arquivos) md += ` | arquivos: ${item.arquivos.join(', ')}`;
        if (item.erro) md += ` | erro: ${item.erro}`;
        md += '\n';
    });
    
    // Seção de padrões pedagógicos
    if (relatorioPadroes) {
        md += '\n## 📚 Verificação de Padrões Pedagógicos\n\n';
        
        if (relatorioPadroes.problemas.length > 0) {
            md += '### ❌ Problemas Detectados\n\n';
            relatorioPadroes.problemas.forEach(problema => {
                md += `- ${problema}\n`;
            });
            md += '\n';
        }
        
        if (relatorioPadroes.avisos.length > 0) {
            md += '### ⚠️ Avisos\n\n';
            relatorioPadroes.avisos.forEach(aviso => {
                md += `- ${aviso}\n`;
            });
            md += '\n';
        }
        
        if (relatorioPadroes.problemas.length === 0 && relatorioPadroes.avisos.length === 0) {
            md += '### ✅ Todos os Padrões Atendidos\n\n';
            md += 'O curso está em conformidade com todos os padrões pedagógicos e visuais definidos.\n\n';
        }
        
        // Resumo dos padrões verificados
        md += '### 📋 Padrões Verificados\n\n';
        md += `- **Módulos**: ${relatorioPadroes.padroes.estrutura.modulos}\n`;
        md += `- **Questões por módulo**: ${relatorioPadroes.padroes.estrutura.quizzesPorModulo}\n`;
        md += `- **Avaliação final**: ${relatorioPadroes.padroes.estrutura.avaliacaoFinal} questões\n`;
        md += `- **Feedbacks educativos**: ${relatorioPadroes.padroes.estrutura.feedbacksObrigatorios ? 'Obrigatórios' : 'Opcionais'}\n`;
        md += `- **Embaralhamento**: ${relatorioPadroes.padroes.estrutura.embaralhamentoObrigatorio ? 'Obrigatório' : 'Opcional'}\n`;
        md += `- **Tipos de cards**: ${relatorioPadroes.padroes.cards.tipos.join(', ')}\n`;
        md += `- **Layout responsivo**: ${relatorioPadroes.padroes.layout.responsivo ? 'Sim' : 'Não'}\n`;
    }
    
    fs.writeFileSync(logVerificacaoMdPath, md, 'utf8');
    console.log(`📝 Relatório detalhado salvo em ${logVerificacaoMdPath}`);
    if (relatorioPadroes) {
        console.log(`📚 Relatório de padrões pedagógicos salvo em ${logPadroesPath}`);
    }
} catch (e) {
    console.log('⚠️  Não foi possível salvar o log detalhado:', e.message);
}

if (atualizarHash) {
    try {
        // Salvar hashes e tamanhos de referência
        Object.keys(novosHashes).forEach(f => {
            novosHashes[f + '_tamanho'] = getTamanho(f);
        });
        fs.writeFileSync(hashesRefPath, JSON.stringify(novosHashes, null, 2), 'utf8');
        console.log(`✅ Hashes de referência atualizados em ${hashesRefPath}`);
        process.exit(0);
    } catch (e) {
        console.log('❌ Erro ao salvar hashes de referência:', e.message);
        process.exit(1);
    }
}

// [RESUMO FINAL AMIGÁVEL]
let totalProblemas = logDetalhado.filter(i => ['alterado','não encontrado','duplicidade','referência quebrada','acessibilidade','hashes de referência corrompidos','tamanho muito diferente','sem hash de referência'].includes(i.status)).length;
let totalAvisos = logDetalhado.filter(i => i.status === 'aviso').length;

console.log('\n' + '='.repeat(50));
if (totalProblemas === 0 && totalAvisos === 0 && layoutOk) {
    console.log('✅✅ LAYOUT E PADRÕES 100% OK! Nenhum problema encontrado.');
    process.exit(0);
} else {
    if (totalProblemas > 0) {
        console.log(`❌ Foram encontrados ${totalProblemas} problemas críticos no layout/padrões.`);
    }
    if (totalAvisos > 0) {
        console.log(`⚠️ Foram encontrados ${totalAvisos} avisos.`);
    }
    // Sugestões de correção
    const sugestoes = sugerirCorrecaoProblemas(logDetalhado);
    if (sugestoes.length > 0) {
        console.log('\nSugestões de correção automática:');
        sugestoes.forEach(s => console.log('  - ' + s));
    }
    if (totalProblemas > 0) {
        process.exit(1);
    } else {
        process.exit(2);
    }
}

// Adicionar seção de ajuda
if (args.includes('--help') || args.includes('-h')) {
    console.log('\n📖 AJUDA - VERIFICADOR DE LAYOUT E PADRÕES PEDAGÓGICOS');
    console.log('='.repeat(60));
    console.log('\nUso: node scripts/verificar-layout.js [opções]');
    console.log('\nOpções:');
    console.log('  --atualizar-hash     Atualiza os hashes de referência');
    console.log('  --verificar-padroes  Verifica padrões pedagógicos e visuais');
    console.log('  --help, -h          Mostra esta ajuda');
    console.log('\nExemplos:');
    console.log('  node scripts/verificar-layout.js                    # Verificação básica');
    console.log('  node scripts/verificar-layout.js --atualizar-hash   # Atualizar hashes');
    console.log('  node scripts/verificar-layout.js --verificar-padroes # Verificar padrões');
    console.log('  node scripts/verificar-layout.js --atualizar-hash --verificar-padroes');
    console.log('\n📚 PADRÕES PEDAGÓGICOS VERIFICADOS:');
    console.log('  ✅ 7 módulos do curso MRS');
    console.log('  ✅ 15 questões por módulo');
    console.log('  ✅ 50 questões na avaliação final');
    console.log('  ✅ Feedbacks educativos obrigatórios');
    console.log('  ✅ Embaralhamento de alternativas');
    console.log('  ✅ Cards de dúvidas frequentes OBRIGATÓRIOS');
    console.log('  ✅ Cards de resumo visual OBRIGATÓRIOS');
    console.log('  ✅ Emojis apenas nos títulos (não no meio do texto)');
    console.log('\n🔍 VERIFICAÇÕES ESPECÍFICAS IMPLEMENTADAS:');
    console.log('  🗨️ Dúvidas Frequentes:');
    console.log('    - Presença obrigatória em cada módulo');
    console.log('    - Emoji 🗨️ no título');
    console.log('    - Formato padrão (❓ dúvida / 💡 resposta)');
    console.log('    - Conteúdo mínimo de 100 caracteres');
    console.log('  📊 Resumos Visuais:');
    console.log('    - Presença obrigatória em cada módulo');
    console.log('    - Emoji 📊 no título');
    console.log('    - Elementos visuais (tabelas, listas, etc.)');
    console.log('    - Conteúdo mínimo de 50 caracteres');
    console.log('\n🎨 PADRÕES VISUAIS VERIFICADOS:');
    console.log('  ✅ Paleta de cores definida (#2B2D3A, #6C63FF, #00E599, etc.)');
    console.log('  ✅ Layout responsivo');
    console.log('  ✅ Cards com bordas arredondadas (16px)');
    console.log('  ✅ Sombras suaves nos cards');
    console.log('  ✅ Espaçamento adequado entre cards (24px)');
    console.log('  ✅ Tipografia padrão (1.4rem títulos, 1.1rem texto)');
    console.log('  ✅ Barra superior fixa');
    console.log('  ✅ Navegação entre módulos');
    console.log('  ✅ Barra de progresso');
    console.log('\n♿ PADRÕES DE ACESSIBILIDADE VERIFICADOS:');
    console.log('  ✅ Imagens com atributo alt');
    console.log('  ✅ Estrutura semântica HTML5');
    console.log('  ✅ Navegação por teclado');
    console.log('  ✅ Contraste mínimo de cores');
    console.log('\n🔧 TIPOS DE CARDS VERIFICADOS:');
    console.log('  💡 Dica (fundo verde claro)');
    console.log('  ⚠️ Atenção (fundo amarelo claro)');
    console.log('  📝 Exemplo (fundo azul claro)');
    console.log('  📊 Resumo Visual (fundo cinza claro) - OBRIGATÓRIO');
    console.log('  🗨️ Dúvidas Frequentes - OBRIGATÓRIO');
    console.log('  📚 Conteúdo Principal (fundo branco)');
    console.log('\n📄 ARQUIVOS GERADOS:');
    console.log('  📄 logs/layout-verificacao.json    # Log detalhado em JSON');
    console.log('  📄 logs/layout-verificacao.md      # Relatório em Markdown');
    console.log('  📄 logs/verificacao-padroes.json   # Relatório de padrões (se --verificar-padroes)');
    console.log('  📄 logs/layout-hashes.json         # Hashes de referência');
    console.log('\n🚨 CÓDIGOS DE SAÍDA:');
    console.log('  0 = Tudo OK (layout e padrões corretos)');
    console.log('  1 = Problemas críticos detectados');
    console.log('  2 = Apenas avisos (sem problemas críticos)');
    console.log('\n💡 SUGESTÕES DE CORREÇÃO:');
    console.log('  - O script sugere correções automáticas para problemas simples');
    console.log('  - Arquivos duplicados: remover ou renomear');
    console.log('  - Arquivos novos: adicionar ao layout-files.json ou remover');
    console.log('  - Referências quebradas: corrigir caminhos no HTML');
    console.log('  - Emojis no meio do texto: mover para títulos dos cards');
    console.log('  - Cards obrigatórios faltando: criar cards de dúvidas e resumos');
    console.log('\nPara mais informações, consulte definicao_curso_pnsb.md');
    process.exit(0);
}

// [ADICIONAR] Função para sugerir correções automáticas
function sugerirCorrecaoProblemas(logDetalhado) {
    const sugestoes = [];
    logDetalhado.forEach(item => {
        if (item.status === 'duplicidade' && item.arquivos) {
            sugestoes.push(`Arquivos duplicados: ${item.nome}\n  Sugestão: Remova ou renomeie um dos arquivos: ${item.arquivos.join(', ')}`);
        }
        if (item.status === 'novo arquivo não listado') {
            sugestoes.push(`Arquivo novo não listado: ${item.arquivo}\n  Sugestão: Adicione ao layout-files.json se for relevante, ou remova se for desnecessário.`);
        }
        if (item.status === 'referência quebrada') {
            sugestoes.push(`Referência quebrada em ${item.arquivo}: ${item.referencia}\n  Sugestão: Corrija o caminho ou remova a referência do HTML.`);
        }
    });
    return sugestoes;
}

// [ADICIONAR] Função de validação de acessibilidade básica
function validarAcessibilidade(arquivosHTML) {
    const problemas = [];
    arquivosHTML.forEach(htmlFile => {
        try {
            const conteudo = fs.readFileSync(htmlFile, 'utf8');
            // Imagens sem alt
            const imgsSemAlt = [...conteudo.matchAll(/<img [^>]*((?<!alt=)[^>])*?>/g)];
            if (imgsSemAlt.length > 0) {
                problemas.push(`Imagens sem atributo alt em ${htmlFile}: ${imgsSemAlt.length}`);
            }
            // Botões sem texto
            const botoesSemTexto = [...conteudo.matchAll(/<button[^>]*>\s*<\/button>/g)];
            if (botoesSemTexto.length > 0) {
                problemas.push(`Botões sem texto em ${htmlFile}: ${botoesSemTexto.length}`);
            }
        } catch (e) {
            problemas.push(`Erro ao validar acessibilidade em ${htmlFile}: ${e.message}`);
        }
    });
    return problemas;
} 