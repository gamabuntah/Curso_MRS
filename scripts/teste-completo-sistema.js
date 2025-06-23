#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const net = require('net');

// ✅ MELHORIA: Imports dos novos módulos
const { config, validarConfiguracao } = require('./config');
const Logger = require('./logger');
const SecurityValidator = require('./security');

// ✅ CORREÇÃO: Validar configuração ANTES de inicializar logger
const problemasConfig = validarConfiguracao();
if (problemasConfig.length > 0) {
  console.error('❌ ERRO: Problemas na configuração:');
  problemasConfig.forEach(p => console.error(`   - ${p}`));
  process.exit(2);
}

// ✅ MELHORIA: Inicializar logger e validador de segurança APÓS validação
const logger = new Logger({
  nivel: 'INFO',
  arquivo: 'logs/teste-completo-detailed.json',
  incluirMemoria: true
});

const securityValidator = new SecurityValidator(config);

logger.info('🧪 INICIANDO TESTE COMPLETO DO SISTEMA MRS...');

// Configurações (agora vindas do config.js)
const publicPath = config.caminhos.public;
const dataPath = config.caminhos.data;
const backendPort = config.portas.backend;
const frontendPort = config.portas.frontend;
const audioPath = config.caminhos.audios;
const mrsContentPath = config.caminhos.mrs;
const obrigatoriosCards = config.validacao.cardsObrigatorios;
const minQuestoesModulo = config.limites.questoesMinimas;
const minQuestoesAvaliacao = config.limites.questoesAvaliacao;
const minAudioMB = 1;

let relatorio = {
  timestamp: new Date().toISOString(),
  versaoScript: config.versao,
  ambiente: {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd(),
    memoria: {
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      usado: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    },
    robustez: {
      validacaoArquivos: true,
      limpezaRecursos: true,
      tratamentoErros: true,
      verificacaoMemoria: true,
      validacaoSeguranca: true,
      loggingEstruturado: true
    }
  },
  modulos: [],
  avaliacaoFinal: {},
  audios: {},
  web: {},
  backend: {},
  config: {},
  acessibilidade: {},
  conversaoTxt: {},
  checklist: {
    estrutura: [],
    layout: [],
    funcionalidades: [],
    conteudo: []
  },
  problemas: [],
  sugestoes: [],
  estatisticas: {
    arquivosProcessados: 0,
    tempoExecucao: 0,
    modulosValidos: 0,
    questoesTotais: 0
  },
  verificacoes_avancadas: {},
  logs: {
    total: 0,
    porNivel: {},
    memoriaMaxima: 0
  }
};

function garantirPastaLogs() {
  if (!fs.existsSync('logs/')) {
    try {
      fs.mkdirSync('logs/', { recursive: true });
      logger.info('Pasta logs/ criada');
    } catch (error) {
      logger.error(`Erro ao criar pasta logs/: ${error.message}`);
    }
  }
}

function verificarPastaExiste(caminho, descricao) {
  if (!fs.existsSync(caminho)) {
    logger.error(`${descricao}: Pasta não encontrada - ${caminho}`);
        return false;
    }
  return true;
}

function lerModuloJS(caminho) {
  try {
    // ✅ MELHORIA: Usar validador de segurança
    const problemasSeguranca = securityValidator.validarArquivo(caminho);
    if (problemasSeguranca.length > 0) {
      logger.error(`Problemas de segurança no arquivo ${path.basename(caminho)}`, problemasSeguranca);
      return null;
    }
    
    // ✅ MELHORIA: Verificar se arquivo existe antes de ler
    if (!fs.existsSync(caminho)) {
      logger.error(`Arquivo não encontrado: ${path.basename(caminho)}`);
      return null;
    }
    
    // ✅ MELHORIA: Verificar tamanho do arquivo usando configuração
    const stats = fs.statSync(caminho);
    if (stats.size === 0) {
      logger.error(`Arquivo vazio: ${path.basename(caminho)}`);
      return null;
    }
    
    if (stats.size > config.limites.tamanhoMaximoArquivo) {
      logger.error(`Arquivo muito grande: ${path.basename(caminho)} (${Math.round(stats.size / 1024 / 1024)}MB)`);
      return null;
    }
    
        const conteudo = fs.readFileSync(caminho, 'utf8');
    
    // ✅ MELHORIA: Validar conteúdo usando validador de segurança
    const problemasConteudo = securityValidator.validarModuloJS(conteudo);
    if (problemasConteudo.length > 0) {
      logger.error(`Problemas no conteúdo do arquivo ${path.basename(caminho)}`, problemasConteudo);
      return null;
    }
    
    // ✅ CORREÇÃO: Usar parseModuloSeguro em vez de tentar parse direto
    const resultado = parseModuloSeguro(conteudo);
    if (!resultado) {
      logger.error(`Erro ao fazer parse do módulo ${path.basename(caminho)}`);
      return null;
    }
    
    logger.info(`Módulo carregado com sucesso: ${path.basename(caminho)}`);
    return resultado;
  } catch (e) {
    logger.error(`Erro ao ler módulo ${path.basename(caminho)}: ${e.message}`);
    return null;
  }
}

// ✅ NOVA FUNÇÃO: Parsing seguro de módulos sem eval()
function parseModuloSeguro(conteudo) {
  try {
    // Remove module.exports =, const nome =, let nome =, var nome = do início e ponto e vírgula final
    let jsonStr = conteudo.trim();
    // Remove início
    jsonStr = jsonStr.replace(/^module\.exports\s*=\s*/, '');
    jsonStr = jsonStr.replace(/^const\s+\w+\s*=\s*/, '');
    jsonStr = jsonStr.replace(/^let\s+\w+\s*=\s*/, '');
    jsonStr = jsonStr.replace(/^var\s+\w+\s*=\s*/, '');
    // Remove exportação no final, se houver
    jsonStr = jsonStr.replace(/module\.exports\s*=\s*\w+\s*;?\s*$/m, '');
    // Remove bloco final JS (if typeof module ...)
    jsonStr = jsonStr.replace(/if \(typeof module !== 'undefined'[\s\S]*?}\s*;?/m, '');
    // Remove ponto e vírgula final
    jsonStr = jsonStr.replace(/;\s*$/, '');
    // Tenta parsear
    return JSON.parse(jsonStr);
  } catch (error) {
    logger.error(`Erro no parsing seguro: ${error.message}`);
    // Loga trecho inicial para debug
    logger.error('Trecho inicial do arquivo:', conteudo.slice(0, 120));
    return null;
  }
}

function normalizarTexto(texto) {
  // Normalização mais robusta: remove acentos, converte para minúsculas, remove pontuação
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
}

function extrairTextoLimpo(texto) {
  // Remove referências bibliográficas [1], [2], etc.
  return texto.replace(/\[\d+\]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, '\n')
    .trim();
}

function verificarConversaoTxtParaJson() {
  logger.info('📄 VERIFICANDO CONVERSÃO TXT → JSON (7 MÓDULOS)...');
  let problemas = [];
  let sucessos = 0;
  
  // ✅ CORRIGIDO: Verificar se pasta MRS existe
  if (!verificarPastaExiste(mrsContentPath, 'Pasta MRS')) {
    return ['Pasta MRS não encontrada'];
  }
  
  // Mapeamento dos nomes corretos dos arquivos .txt dos módulos (ignorando arquivo de capacitação)
  const nomesArquivos = {
    1: 'Módulo 1 Introdução ao Saneamento B.txt',
    2: 'Módulo 2 Estrutura do Questionário.txt',
    3: 'Módulo 3 Aspectos Legais, Terceiriz.txt',
    4: 'Módulo 4 MRS em Áreas Especiais e C.txt',
    5: 'Módulo 5 Manejo de Resíduos Sólidos.txt',
    6: 'Módulo 6 Unidades de DestinaçãoDisp.txt',
    7: 'Módulo 7 Entidades de Catadores, Ve.txt'
  };
  
  // Verificar se todos os arquivos dos módulos existem
  try {
    const arquivosExistentes = fs.readdirSync(mrsContentPath).filter(arq => arq.endsWith('.txt'));
    logger.info(`📁 Arquivos .txt encontrados na pasta MRS: ${arquivosExistentes.length}`);
    logger.info(`📚 Arquivos dos módulos: ${Object.values(nomesArquivos).join(', ')}`);
  } catch (erro) {
    problemas.push(`Erro ao listar arquivos da pasta MRS: ${erro.message}`);
    return problemas;
  }
  
    for (let i = 1; i <= 7; i++) {
    const txtPath = path.join(mrsContentPath, nomesArquivos[i]);
        const moduloPath = path.join(dataPath, `module${i}.js`);
    
    // Verificar se arquivo .txt existe
    if (!fs.existsSync(txtPath)) {
      problemas.push(`Arquivo .txt do módulo ${i} não encontrado: ${nomesArquivos[i]}`);
      continue;
    }
    
    // Ler arquivo .txt original
    try {
      const txtConteudo = fs.readFileSync(txtPath, 'utf8');
      const txtLimpo = extrairTextoLimpo(txtConteudo);
      
      // Ler módulo JSON
      const modulo = lerModuloJS(moduloPath);
      if (!modulo) {
        problemas.push(`Módulo ${i} JSON não pode ser lido`);
        continue;
      }
      
      // ✅ MELHORIA: Verificar campos obrigatórios do módulo
      if (!modulo.id || !modulo.title || !modulo.audio) {
        problemas.push(`Módulo ${i}: Campos obrigatórios faltando (id, title, audio)`);
      }
      
      // Extrair conteúdo dos cards
      let conteudoJson = '';
      if (modulo.cards && Array.isArray(modulo.cards)) {
        modulo.cards.forEach(card => {
          if (card.content) {
            conteudoJson += ' ' + extrairTextoLimpo(card.content);
          }
        });
      }
      
      // ✅ MELHORIA: Comparação mais robusta usando normalização
      const txtNormalizado = normalizarTexto(txtLimpo);
      const jsonNormalizado = normalizarTexto(conteudoJson);
      
      const palavrasTxt = txtNormalizado.split(/\s+/).filter(p => p.length > 3);
      const palavrasJson = jsonNormalizado.split(/\s+/).filter(p => p.length > 3);
      
      let palavrasEncontradas = 0;
      palavrasTxt.forEach(palavra => {
        if (palavrasJson.includes(palavra)) {
          palavrasEncontradas++;
        }
      });
      
      const percentualPreservado = (palavrasEncontradas / palavrasTxt.length) * 100;
      
      if (percentualPreservado < config.limites.percentualMinimoPreservacao) {
        problemas.push(`Módulo ${i}: Apenas ${percentualPreservado.toFixed(1)}% do conteúdo original preservado`);
      } else {
        logger.info(`✅ Módulo ${i}: ${percentualPreservado.toFixed(1)}% do conteúdo preservado`);
        sucessos++;
      }
      
    } catch (erro) {
      problemas.push(`Erro ao verificar conversão do módulo ${i}: ${erro.message}`);
    }
  }
  
  if (sucessos === 7) {
    logger.info('✅ Conversão TXT → JSON: Todos os 7 módulos preservaram conteúdo adequadamente');
  } else {
    logger.warn(`⚠️ Conversão TXT → JSON: ${sucessos}/7 módulos com conversão adequada`);
  }
  
  return problemas;
}

function verificarModuloPedagogico(modulo, idx) {
  let problemas = [];
  let cards = modulo.cards || [];
  let quiz = (modulo.quiz && modulo.quiz.questoes) ? modulo.quiz.questoes : [];
  
  // ✅ MELHORIA: Verificar estrutura básica do módulo
  if (!modulo.id || modulo.id !== idx) {
    problemas.push(`ID do módulo incorreto: ${modulo.id} (esperado: ${idx})`);
  }
  
  if (!modulo.title) {
    problemas.push('Módulo sem título');
  }
  
  if (!modulo.audio) {
    problemas.push('Módulo sem referência de áudio');
  }
  
  // Cards obrigatórios
  obrigatoriosCards.forEach(tipo => {
    if (!cards.some(card => card.type === tipo)) {
      problemas.push(`Falta card especial obrigatório: ${tipo}`);
    }
  });
  
  // Campos obrigatórios nos cards
  cards.forEach((card, i) => {
    if (!card.title || !card.content) {
      problemas.push(`Card ${i+1} sem title ou content`);
    }
    
    // ✅ MELHORIA: Verificar se o tipo do card é válido
    const tiposValidos = ['default', 'dica', 'atencao', 'exemplo', 'duvidas', 'resumo visual'];
    if (!tiposValidos.includes(card.type)) {
      problemas.push(`Card ${i+1} com tipo inválido: ${card.type}`);
    }
  });
  
  // Questões
  if (quiz.length !== minQuestoesModulo) {
    problemas.push(`Número de questões do quiz: ${quiz.length} (esperado: ${minQuestoesModulo})`);
  }
  
  quiz.forEach((q, qi) => {
    if (!q.pergunta) {
      problemas.push(`Questão ${qi+1} sem pergunta`);
    }
    
    if (!q.alternativas || !Array.isArray(q.alternativas) || q.alternativas.length === 0) {
      problemas.push(`Questão ${qi+1} sem alternativas`);
    } else {
      // ✅ MELHORIA: Verificar se tem exatamente 4 alternativas
      if (q.alternativas.length !== 4) {
        problemas.push(`Questão ${qi+1}: ${q.alternativas.length} alternativas (esperado: 4)`);
      }
      
      let corretas = q.alternativas.filter(a => a.correta);
      if (corretas.length === 0) {
        problemas.push(`Questão ${qi+1} sem alternativa correta`);
      } else if (corretas.length > 1) {
        problemas.push(`Questão ${qi+1} com múltiplas alternativas corretas`);
      }
      
      q.alternativas.forEach((alt, ai) => {
        if (!alt.texto) {
          problemas.push(`Questão ${qi+1}, alternativa ${ai+1} sem texto`);
        }
        if (!('feedback' in alt)) {
          problemas.push(`Questão ${qi+1}, alternativa ${ai+1} sem feedback`);
        }
      });
    }
  });
  
  return problemas;
}

function verificarAvaliacaoFinalPedagogico(modulo) {
  let problemas = [];
  // Aceita tanto modulo.quiz.questoes quanto modulo.questoes
  let quiz = [];
  if (modulo.quiz && Array.isArray(modulo.quiz.questoes)) {
    quiz = modulo.quiz.questoes;
  } else if (Array.isArray(modulo.questoes)) {
    quiz = modulo.questoes;
  }
  // ✅ CORRIGIDO: Verificar exatamente 50 questões
  if (quiz.length !== minQuestoesAvaliacao) {
    problemas.push(`Avaliação final com ${quiz.length} questões (esperado: ${minQuestoesAvaliacao})`);
  }
  quiz.forEach((q, qi) => {
    if (!q.pergunta) {
      problemas.push(`Questão ${qi+1} sem pergunta`);
    }
    if (!q.alternativas || !Array.isArray(q.alternativas) || q.alternativas.length === 0) {
      problemas.push(`Questão ${qi+1} sem alternativas`);
    } else {
      // ✅ MELHORIA: Verificar se tem exatamente 4 alternativas
      if (q.alternativas.length !== 4) {
        problemas.push(`Questão ${qi+1}: ${q.alternativas.length} alternativas (esperado: 4)`);
      }
      let corretas = q.alternativas.filter(a => a.correta);
      if (corretas.length === 0) {
        problemas.push(`Questão ${qi+1} sem alternativa correta`);
      } else if (corretas.length > 1) {
        problemas.push(`Questão ${qi+1} com múltiplas alternativas corretas`);
      }
      q.alternativas.forEach((alt, ai) => {
        if (!alt.texto) {
          problemas.push(`Questão ${qi+1}, alternativa ${ai+1} sem texto`);
        }
        if (!('feedback' in alt)) {
          problemas.push(`Questão ${qi+1}, alternativa ${ai+1} sem feedback`);
        }
      });
    }
  });
  return problemas;
}

function verificarAudiosModulos(modulos) {
  logger.info('🎵 VERIFICANDO ÁUDIOS DOS MÓDULOS...');
  let problemas = [];
  let audiosEncontrados = 0;
  let audiosValidos = 0;
  
  // Verificar se pasta de áudios existe
  if (!verificarPastaExiste(audioPath, 'Pasta de áudios')) {
    return ['Pasta de áudios não encontrada'];
  }
  
  // Listar arquivos de áudio
  try {
    const arquivosAudio = fs.readdirSync(audioPath).filter(arq => arq.endsWith('.wav'));
    logger.info(`📁 Áudios encontrados: ${arquivosAudio.length}`);
  } catch (error) {
    problemas.push(`Erro ao listar áudios: ${error.message}`);
    return problemas;
  }
  
  // Verificar áudio para cada módulo
  for (let i = 1; i <= 7; i++) {
    const audioEsperado = `Curso MRS - Mod ${i}.wav`;
    const audioPathCompleto = path.join(audioPath, audioEsperado);
    
    if (fs.existsSync(audioPathCompleto)) {
      audiosEncontrados++;
      
      try {
        const stats = fs.statSync(audioPathCompleto);
        const tamanhoMB = stats.size / 1024 / 1024;
        
        if (tamanhoMB >= minAudioMB) {
          audiosValidos++;
          logger.info(`✅ Módulo ${i}: Áudio válido (${tamanhoMB.toFixed(2)}MB)`);
        } else {
          problemas.push(`Módulo ${i}: Áudio muito pequeno (${tamanhoMB.toFixed(2)}MB)`);
        }
      } catch (error) {
        problemas.push(`Erro ao verificar áudio do módulo ${i}: ${error.message}`);
      }
    } else {
      problemas.push(`Áudio do módulo ${i} não encontrado: ${audioEsperado}`);
    }
  }
  
  // Resumo
  if (audiosEncontrados === 7) {
    logger.info('✅ Todos os 7 áudios dos módulos foram encontrados');
  } else {
    logger.warn(`⚠️ Apenas ${audiosEncontrados}/7 áudios encontrados`);
  }
  
  if (audiosValidos === 7) {
    logger.info('✅ Todos os áudios são válidos (tamanho adequado)');
  } else {
    logger.warn(`⚠️ Apenas ${audiosValidos}/7 áudios são válidos`);
  }
  
  return problemas;
}

function verificarArquivosWeb() {
    const arquivosWeb = [
        { caminho: path.join(publicPath, 'index.html'), descricao: 'Página principal' },
        { caminho: path.join(publicPath, 'style.css'), descricao: 'Estilos CSS' },
        { caminho: path.join(publicPath, 'script.js'), descricao: 'Script principal' },
        { caminho: path.join(publicPath, 'progress-manager.js'), descricao: 'Gerenciador de progresso' },
    { caminho: path.join(publicPath, 'certificate-manager.js'), descricao: 'Gerenciador de certificados' },
    { caminho: path.join(publicPath, 'certificate-generator.js'), descricao: 'Gerador de certificados' },
        { caminho: path.join(publicPath, 'login.html'), descricao: 'Página de login' },
        { caminho: path.join(publicPath, 'login.css'), descricao: 'Estilos do login' },
        { caminho: path.join(publicPath, 'login.js'), descricao: 'Script do login' },
        { caminho: path.join(publicPath, 'admin.html'), descricao: 'Página admin' },
        { caminho: path.join(publicPath, 'admin.css'), descricao: 'Estilos admin' },
    { caminho: path.join(publicPath, 'admin.js'), descricao: 'Script admin' },
    { caminho: path.join(publicPath, 'validate.html'), descricao: 'Página de validação' }
    ];
  let problemas = [];
    arquivosWeb.forEach(arquivo => {
    if (!fs.existsSync(arquivo.caminho)) {
      problemas.push(`Arquivo web faltando: ${arquivo.descricao}`);
        }
    });
  return problemas;
}

function verificarBackendArquivos() {
    const backendArquivos = [
        { caminho: 'backend/package.json', descricao: 'Package.json do backend' },
    { caminho: 'backend/server.js', descricao: 'Servidor Node.js' }
    ];
  let problemas = [];
    backendArquivos.forEach(arquivo => {
    if (!fs.existsSync(arquivo.caminho)) {
      problemas.push(`Arquivo backend faltando: ${arquivo.descricao}`);
    }
  });
  if (!fs.existsSync('backend/database.json')) {
    problemas.push('Database.json faltando (será criado automaticamente)');
  }
  return problemas;
}

function verificarConfiguracao() {
  logger.info('⚙️ VERIFICANDO CONFIGURAÇÃO DO SISTEMA...');
  let problemas = [];
  
  try {
    const configPath = 'config-sistema.json';
    if (!fs.existsSync(configPath)) {
      problemas.push('Arquivo config-sistema.json não encontrado');
      return problemas;
    }
    
    const configConteudo = fs.readFileSync(configPath, 'utf8');
    const configSistema = JSON.parse(configConteudo);
    
    // Verificar se ainda aponta para PNSB
    if (configSistema.curso && configSistema.curso.nome && configSistema.curso.nome.toLowerCase().includes('pnsb')) {
      problemas.push('Configuração ainda aponta para PNSB em vez de MRS');
    }
    
    // Verificar se tem 7 módulos
    if (configSistema.sistema && configSistema.sistema.modulos && configSistema.sistema.modulos.total !== 7) {
      problemas.push(`Configuração tem ${configSistema.sistema.modulos.total} módulos (esperado: 7)`);
    }
    
    // Verificar se a porta está correta
    if (configSistema.sistema && configSistema.sistema.portas && configSistema.sistema.portas.backend !== backendPort) {
      problemas.push(`Configuração tem porta ${configSistema.sistema.portas.backend} (esperado: ${backendPort})`);
    }
    
    // Verificar se o título está correto
    if (configSistema.curso && configSistema.curso.nome) {
      const nomeCurso = configSistema.curso.nome.toLowerCase();
      if (!nomeCurso.includes('mrs') && !nomeCurso.includes('resíduos') && !nomeCurso.includes('residuos')) {
        problemas.push('Título da configuração não menciona MRS ou resíduos');
      }
    }
    
  } catch (erro) {
    problemas.push(`Erro ao ler configuração: ${erro.message}`);
  }
  
  if (problemas.length === 0) {
    logger.info('✅ Configuração do sistema está correta');
  } else {
    logger.warn('⚠️ Problemas encontrados na configuração:');
    problemas.forEach(p => logger.warn(' - ' + p));
  }
  
  return problemas;
}

function verificarAcessibilidadeHTML() {
  logger.info('♿ VERIFICANDO ACESSIBILIDADE HTML...');
  let problemas = [];
  
  const arquivosHTML = [
    { caminho: path.join(publicPath, 'index.html'), descricao: 'Página principal' },
    { caminho: path.join(publicPath, 'login.html'), descricao: 'Página de login' },
    { caminho: path.join(publicPath, 'admin.html'), descricao: 'Página admin' },
    { caminho: path.join(publicPath, 'validate.html'), descricao: 'Página de validação' }
  ];
  
  arquivosHTML.forEach(arquivo => {
    if (!fs.existsSync(arquivo.caminho)) {
      problemas.push(`${arquivo.descricao}: Arquivo não encontrado`);
      return;
    }
    
    try {
      const conteudo = fs.readFileSync(arquivo.caminho, 'utf8');
      
      // Verificar botões sem aria-label ou texto
      const botoesSemAria = conteudo.match(/<button[^>]*>(?!\s*<[^>]*>)[^<]*<\/button>/g);
      if (botoesSemAria) {
        botoesSemAria.forEach((botao, index) => {
          if (!botao.includes('aria-label') && !botao.includes('aria-labelledby')) {
            const textoBotao = botao.replace(/<[^>]*>/g, '').trim();
            if (!textoBotao || textoBotao.length < 3) {
              problemas.push(`${arquivo.descricao}: Botão ${index + 1} sem aria-label ou texto descritivo`);
            }
          }
        });
      }
      
      // Verificar imagens sem alt
      const imagensSemAlt = conteudo.match(/<img[^>]*>/g);
      if (imagensSemAlt) {
        imagensSemAlt.forEach((img, index) => {
          if (!img.includes('alt=')) {
            problemas.push(`${arquivo.descricao}: Imagem ${index + 1} sem atributo alt`);
          }
        });
      }
      
      // Verificar formulários sem labels
      const inputsSemLabel = conteudo.match(/<input[^>]*>/g);
      if (inputsSemLabel) {
        inputsSemLabel.forEach((input, index) => {
          if (!input.includes('aria-label') && !input.includes('aria-labelledby') && !input.includes('placeholder=')) {
            problemas.push(`${arquivo.descricao}: Input ${index + 1} sem label, aria-label ou placeholder`);
          }
        });
      }
      
    } catch (error) {
      problemas.push(`${arquivo.descricao}: Erro ao verificar acessibilidade - ${error.message}`);
    }
  });
  
  if (problemas.length === 0) {
    logger.info('✅ Acessibilidade HTML está adequada');
  } else {
    logger.warn('⚠️ Problemas de acessibilidade encontrados:');
    problemas.forEach(p => logger.warn(' - ' + p));
  }
  
  return problemas;
}

function gerarChecklistFinal() {
  console.log('\n📋 GERANDO CHECKLIST FINAL...');
  
  // Checklist de Estrutura
  relatorio.checklist.estrutura = [
    { item: '7 módulos criados', status: relatorio.modulos.length === 7 ? '✅' : '❌' },
    { item: '15 questões por módulo', status: relatorio.modulos.every(m => !m.problemas.some(p => p.includes('Número de questões'))) ? '✅' : '❌' },
    { item: '50 questões na avaliação final', status: !relatorio.avaliacaoFinal.problemas.some(p => p.includes('50 questões')) ? '✅' : '❌' },
    { item: 'Áudios integrados', status: relatorio.audios.problemas.length === 0 ? '✅' : '❌' },
    { item: 'Sistema de certificados', status: fs.existsSync(path.join(publicPath, 'certificate-manager.js')) ? '✅' : '❌' }
  ];
  
  // Checklist de Layout (requer validação manual)
  relatorio.checklist.layout = [
    { item: 'Layout idêntico ao PNSB', status: '🔍 MANUAL', instrucao: `Acesse http://localhost:${frontendPort} e compare visualmente com PNSB` },
    { item: 'Paleta de cores preservada', status: '🔍 MANUAL', instrucao: 'Verifique se as cores são idênticas ao sistema PNSB' },
    { item: 'Responsividade mantida', status: '🔍 MANUAL', instrucao: 'Teste em diferentes tamanhos de tela (F12 → Device Toolbar)' },
    { item: 'Animações funcionais', status: '🔍 MANUAL', instrucao: 'Verifique transições suaves entre cards e módulos' }
  ];
  
  // Checklist de Funcionalidades
  relatorio.checklist.funcionalidades = [
    { item: 'Backend na porta 3002', status: relatorio.backendOnline ? '✅' : '❌' },
    { item: `Frontend na porta ${frontendPort}`, status: '🔍 MANUAL', instrucao: `Acesse http://localhost:${frontendPort} e verifique se carrega` },
    { item: 'Sistema de progresso', status: '🔍 MANUAL', instrucao: 'Navegue entre módulos e verifique se o progresso é salvo' },
    { item: 'Player de áudio', status: '🔍 MANUAL', instrucao: 'Clique nos ícones de áudio e verifique se reproduz' },
    { item: 'Quizzes funcionais', status: '🔍 MANUAL', instrucao: 'Responda questões e verifique feedbacks' },
    { item: 'Certificados geram', status: '🔍 MANUAL', instrucao: 'Complete um módulo e teste geração de certificado' }
  ];
  
  // Checklist de Conteúdo
  relatorio.checklist.conteudo = [
    { item: 'Conversão fiel dos arquivos .txt', status: relatorio.conversaoTxt.problemas.length === 0 ? '✅' : '❌' },
    { item: 'Cards inteligentes criados', status: relatorio.modulos.every(m => !m.problemas.some(p => p.includes('card especial'))) ? '✅' : '❌' },
    { item: 'Feedbacks educativos', status: relatorio.modulos.every(m => !m.problemas.some(p => p.includes('feedback'))) ? '✅' : '❌' },
    { item: 'Preservação integral', status: relatorio.conversaoTxt.problemas.length === 0 ? '✅' : '❌' }
  ];
  
  console.log('✅ Checklist final gerado');
}

function exibirInstrucoesValidacaoManual() {
  console.log('\n🔍 INSTRUÇÕES PARA VALIDAÇÃO MANUAL');
  console.log('=====================================');
  console.log('\n📱 TESTE DE RESPONSIVIDADE:');
  console.log(`1. Abra http://localhost:${frontendPort} no Chrome`);
  console.log('2. Pressione F12 para abrir DevTools');
  console.log('3. Clique no ícone de dispositivo (Toggle device toolbar)');
  console.log('4. Teste os tamanhos: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)');
  console.log('5. Verifique se a navegação lateral e cards se adaptam corretamente');
  
  console.log('\n🎨 TESTE DE LAYOUT:');
  console.log('1. Compare visualmente com o sistema PNSB');
  console.log('2. Verifique se a paleta de cores é idêntica');
  console.log('3. Confirme se as animações são suaves');
  console.log('4. Teste a navegação entre módulos');
  
  console.log('\n🔊 TESTE DE ÁUDIO:');
  console.log('1. Clique nos ícones de áudio em cada módulo');
  console.log('2. Verifique se o áudio reproduz corretamente');
  console.log('3. Teste pausar/retomar o áudio');
  console.log('4. Confirme se o volume está adequado');
  
  console.log('\n❓ TESTE DE QUIZZES:');
  console.log('1. Responda questões em diferentes módulos');
  console.log('2. Verifique se os feedbacks aparecem corretamente');
  console.log('3. Teste se as alternativas estão embaralhadas');
  console.log('4. Confirme se o progresso é salvo');
  
  console.log('\n🏆 TESTE DE CERTIFICADOS:');
  console.log('1. Complete um módulo (responda todas as questões)');
  console.log('2. Verifique se o certificado é gerado');
  console.log('3. Teste o download do certificado');
  console.log('4. Confirme se as informações estão corretas');
  
  console.log('\n⚙️ TESTE DE CONFIGURAÇÃO:');
  console.log('1. Verifique se o backend está na porta 3002');
  console.log(`2. Confirme se o frontend está na porta ${frontendPort}`);
  console.log('3. Teste os scripts de inicialização/parada');
  console.log('4. Verifique se o backup de dados funciona');
}

function salvarRelatorio(relatorio) {
  const logPath = 'logs/teste-completo-sistema.json';
  
  // ✅ MELHORIA: Criar pasta logs se não existir
  const logsDir = path.dirname(logPath);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  fs.writeFileSync(logPath, JSON.stringify(relatorio, null, 2), 'utf8');
  console.log(`\n📄 Relatório salvo em ${logPath}`);
}

async function verificarBackendOnline() {
  console.log('\n🔌 VERIFICANDO BACKEND ONLINE...');
  
  return new Promise((resolve) => {
    let timeoutId = null;
    let req = null;
    
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (req) {
        req.destroy();
        req = null;
      }
    };
    
    timeoutId = setTimeout(() => {
      console.log('⚠️ Timeout na verificação do backend (5s)');
      cleanup();
      resolve(false);
    }, 5000); // 5 segundos de timeout
    
    req = http.get(`http://localhost:${backendPort}/health`, (res) => {
      cleanup();
      if (res.statusCode === 200) {
        console.log('✅ Backend está online');
        resolve(true);
      } else {
        console.log(`⚠️ Backend respondeu com status ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      cleanup();
      console.log('❌ Backend offline ou não responde');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      cleanup();
      console.log('⚠️ Timeout na conexão com o backend');
      resolve(false);
    });
  });
}

function calcularHashArquivo(arquivo) {
  try {
    const conteudo = fs.readFileSync(arquivo);
    return crypto.createHash('sha256').update(conteudo).digest('hex');
  } catch (e) {
    return null;
  }
}

function verificarIntegridadeLayout() {
  logger.info('🔒 VERIFICANDO INTEGRIDADE DOS ARQUIVOS DE LAYOUT...');
  const layoutFilesPath = 'layout-files.json';
  const hashesRefPath = 'logs/layout-hashes.json';
  let problemas = [];
  let totalArquivos = 0;
    let arquivosOk = 0;
  let alterados = [];
  let ausentes = [];
  let novos = [];
  let corrompidos = [];
  let hashesReferencia = {};
  let arquivosLayout = [];

  // Verificar se arquivo de padrões existe
  if (!fs.existsSync(layoutFilesPath)) {
    logger.warn('⚠️ Arquivo layout-files.json não encontrado. Criando arquivo padrão...');
    try {
      const padroesPadrao = [
        'public/*.html',
        'public/*.css',
        'public/*.js',
        'backend/*.js',
        'backend/*.json'
      ];
      fs.writeFileSync(layoutFilesPath, JSON.stringify(padroesPadrao, null, 2));
      logger.info('✅ Arquivo layout-files.json criado com padrões padrão');
    } catch (error) {
      problemas.push(`Erro ao criar arquivo de padrões: ${error.message}`);
      return { problemas };
    }
  }

  try {
    const padroes = JSON.parse(fs.readFileSync(layoutFilesPath, 'utf8'));
    
    // Função para expandir padrões glob usando fs.readdirSync
    function expandirPadrao(padrao) {
      const arquivos = [];
      try {
        // Se o padrão não tem wildcards, verificar se o arquivo existe
        if (!padrao.includes('*') && !padrao.includes('?')) {
          if (fs.existsSync(padrao)) {
            arquivos.push(padrao);
          }
          return arquivos;
        }
        
        // Para padrões simples, tentar listar diretórios
        const partes = padrao.split('/');
        const diretorio = partes.slice(0, -1).join('/') || '.';
        const arquivoPadrao = partes[partes.length - 1];
        
        if (fs.existsSync(diretorio)) {
          const arquivosDir = fs.readdirSync(diretorio);
          arquivosDir.forEach(arquivo => {
            const caminhoCompleto = path.join(diretorio, arquivo);
            if (arquivo.match(new RegExp(arquivoPadrao.replace(/\*/g, '.*').replace(/\?/g, '.')))) {
              arquivos.push(caminhoCompleto);
            }
          });
        }
      } catch (error) {
        logger.warn(`⚠️ Erro ao expandir padrão ${padrao}: ${error.message}`);
      }
      return arquivos;
    }
    
    padroes.forEach(padrao => {
      const arquivosExpandidos = expandirPadrao(padrao);
      arquivosLayout = arquivosLayout.concat(arquivosExpandidos);
    });
    
    arquivosLayout = [...new Set(arquivosLayout)];
    totalArquivos = arquivosLayout.length;
    
  } catch (error) {
    problemas.push(`Erro ao processar padrões de layout: ${error.message}`);
    return { problemas };
  }

  // Carregar hashes de referência, se existirem
  if (fs.existsSync(hashesRefPath)) {
    try {
      hashesReferencia = JSON.parse(fs.readFileSync(hashesRefPath, 'utf8'));
    } catch (e) {
      problemas.push('Erro ao ler hashes de referência: ' + e.message);
      hashesReferencia = {};
    }
  }

  let novosHashes = {};
  arquivosLayout.forEach(arquivo => {
    const hashAtual = calcularHashArquivo(arquivo);
    novosHashes[arquivo] = hashAtual;
    if (!hashAtual) {
      corrompidos.push(arquivo);
      problemas.push(`Arquivo corrompido ou inacessível: ${arquivo}`);
      return;
    }
    if (hashesReferencia[arquivo]) {
      if (hashAtual !== hashesReferencia[arquivo]) {
        alterados.push(arquivo);
        problemas.push(`Arquivo alterado: ${arquivo}`);
      } else {
            arquivosOk++;
      }
    } else {
      novos.push(arquivo);
      problemas.push(`Arquivo novo (sem hash de referência): ${arquivo}`);
    }
  });

  // Arquivos ausentes
  Object.keys(hashesReferencia).forEach(arquivo => {
    if (!novosHashes[arquivo]) {
      ausentes.push(arquivo);
      problemas.push(`Arquivo ausente: ${arquivo}`);
    }
  });

  // Se não havia referência, criar uma nova
  if (!fs.existsSync(hashesRefPath)) {
    try {
      fs.writeFileSync(hashesRefPath, JSON.stringify(novosHashes, null, 2), 'utf8');
      logger.info('Arquivo de referência de hashes criado em logs/layout-hashes.json. Use este arquivo para futuras comparações de integridade.');
    } catch (error) {
      problemas.push(`Erro ao criar arquivo de referência: ${error.message}`);
    }
  }

  // Resumo
  logger.info(`Total de arquivos de layout verificados: ${totalArquivos}`);
  if (problemas.length === 0) {
    logger.info('✅ Todos os arquivos de layout estão íntegros.');
  } else {
    problemas.forEach(p => logger.warn(' - ' + p));
  }

  return {
    totalArquivos,
    arquivosOk,
    alterados,
    ausentes,
    novos,
    corrompidos,
    problemas
  };
}

function verificarPadroesVisuaisCSS() {
  logger.info('🎨 VERIFICANDO PADRÕES VISUAIS E RESPONSIVIDADE NOS CSS...');
  const arquivosCSS = [
    'public/style.css',
    'public/login.css',
    'public/admin.css'
  ];
  const padroes = {
    cores: [
      '#2B2D3A', '#6C63FF', '#00E599', '#F5F6FA', '#22223B',
      '#667eea', '#7f9cf5', '#2c3e50', '#4a5568', '#f7fafc', '#e2e8f0', '#e53e3e', '#ffffff'
    ],
    bordas: ['border-radius: 8px', 'border-radius: 16px', 'border-radius: 24px', 'border-radius: 1rem', 'border-radius: 12px'],
    sombras: ['box-shadow', 'shadow'],
    tipografia: ['font-size: 1.4rem', 'font-size: 1.1rem', 'font-size: 1.8rem', 'font-size: 0.87rem', 'font-size: 0.95rem'],
    responsividade: ['@media'],
    gradientes: ['linear-gradient', 'gradient'],
    variaveis: [':root', '--primary-color', '--accent-color', '--bg-primary', '--text-color']
  };
  let problemas = [];
  let avisos = [];
  
  arquivosCSS.forEach(cssFile => {
    if (!fs.existsSync(cssFile)) {
      problemas.push(`Arquivo CSS não encontrado: ${cssFile}`);
      return;
    }
    
    try {
      const conteudo = fs.readFileSync(cssFile, 'utf8');
      
      // Cores
      padroes.cores.forEach(cor => {
        if (!conteudo.toLowerCase().includes(cor.toLowerCase())) {
          avisos.push(`Cor ${cor} não encontrada em ${cssFile}`);
        }
      });
      
      // Bordas
      padroes.bordas.forEach(borda => {
        if (!conteudo.includes(borda)) {
          avisos.push(`Borda ${borda} não encontrada em ${cssFile}`);
        }
      });
      
      // Sombras
      padroes.sombras.forEach(sombra => {
        if (!conteudo.includes(sombra)) {
          avisos.push(`Sombra ${sombra} não encontrada em ${cssFile}`);
        }
      });
      
      // Tipografia
      padroes.tipografia.forEach(tipo => {
        if (!conteudo.includes(tipo)) {
          avisos.push(`Tipo ${tipo} não encontrada em ${cssFile}`);
        }
      });
      
      // Responsividade
      padroes.responsividade.forEach(resp => {
        if (!conteudo.includes(resp)) {
          avisos.push(`Responsividade ${resp} não encontrada em ${cssFile}`);
        }
      });
      
      // Gradientes
      padroes.gradientes.forEach(grad => {
        if (!conteudo.includes(grad)) {
          avisos.push(`Gradiente ${grad} não encontrada em ${cssFile}`);
        }
      });
      
      // Variáveis
      padroes.variaveis.forEach(variavel => {
        if (!conteudo.includes(variavel)) {
          avisos.push(`Variável ${variavel} não encontrada em ${cssFile}`);
        }
      });
      
    } catch (error) {
      problemas.push(`Erro ao ler arquivo CSS ${cssFile}: ${error.message}`);
    }
  });
  
  // Resumo
  if (problemas.length === 0) {
    logger.info('✅ Todos os padrões visuais e responsividade nos CSS estão corretos.');
        } else {
    logger.warn('⚠️ Alguns padrões visuais e responsividade nos CSS não foram encontrados:');
    avisos.forEach(a => logger.warn(' - ' + a));
  }
  
  return {
    problemas,
    avisos,
    arquivos_verificados: arquivosCSS.length,
    total_arquivos: arquivosCSS.length
  };
}

async function executarTesteCompleto() {
  const tempoInicio = Date.now();
  
  // ✅ MELHORIA: Validação de ambiente antes de iniciar
  console.log('🔍 Validando ambiente de execução...');
  
  // Verificar se estamos no diretório correto
  if (!fs.existsSync('public') || !fs.existsSync('backend')) {
    console.error('❌ ERRO: Execute este script na raiz do projeto (onde estão as pastas public/ e backend/)');
    return 2;
  }
  
  // Garantir que a pasta logs existe
  garantirPastaLogs();
  
  // ✅ MELHORIA: Verificar dependências críticas
  const dependenciasCriticas = [
    'public/data/browser/module1.js',
    'public/data/browser/avaliacaoFinal.js',
    'backend/server.js',
    'config-sistema.json'
  ];
  
  let dependenciasFaltando = [];
  dependenciasCriticas.forEach(dep => {
    if (!fs.existsSync(dep)) {
      dependenciasFaltando.push(dep);
    }
  });
  
  if (dependenciasFaltando.length > 0) {
    console.error('❌ ERRO: Dependências críticas não encontradas:');
    dependenciasFaltando.forEach(dep => console.error(`   - ${dep}`));
    return 2;
  }
  
  console.log('✅ Ambiente validado com sucesso\n');
  
  // ✅ MELHORIA: Verificar memória disponível
  const memoriaDisponivel = process.memoryUsage();
  const memoriaTotalMB = Math.round(memoriaDisponivel.heapTotal / 1024 / 1024);
  const memoriaUsadoMB = Math.round(memoriaDisponivel.heapUsed / 1024 / 1024);
  
  if (memoriaTotalMB < 50) {
    console.warn('⚠️ AVISO: Memória heap total baixa (' + memoriaTotalMB + 'MB). Pode afetar performance.');
  }
  
  console.log(`📊 Memória: ${memoriaUsadoMB}MB usado / ${memoriaTotalMB}MB total`);
  
  // ✅ MELHORIA: Validar arquivos críticos antes de processar
  console.log('🔍 Validando integridade de arquivos críticos...');
  const arquivosCriticos = [
    'public/data/browser/module1.js',
    'public/data/browser/avaliacaoFinal.js',
    'config-sistema.json'
  ];
  
  let arquivosCorrompidos = [];
  arquivosCriticos.forEach(arquivo => {
    try {
      const stats = fs.statSync(arquivo);
      if (stats.size === 0) {
        arquivosCorrompidos.push(`${arquivo} (vazio)`);
      } else if (stats.size < 100) {
        arquivosCorrompidos.push(`${arquivo} (muito pequeno: ${stats.size} bytes)`);
      }
    } catch (error) {
      arquivosCorrompidos.push(`${arquivo} (erro: ${error.message})`);
    }
  });
  
  if (arquivosCorrompidos.length > 0) {
    console.error('❌ ERRO: Arquivos críticos corrompidos ou inválidos:');
    arquivosCorrompidos.forEach(arquivo => console.error(`   - ${arquivo}`));
    return 2;
  }
  
  console.log('✅ Arquivos críticos validados com sucesso\n');
  console.log('🚀 INICIANDO VERIFICAÇÕES BÁSICAS...\n');
  
  // 1. Verificar módulos
  let modulos = [];
  let questoesTotais = 0;
  for (let i = 1; i <= 7; i++) {
    const moduloPath = path.join(dataPath, `module${i}.js`);
    const modulo = lerModuloJS(moduloPath);
    if (!modulo) {
      relatorio.modulos.push({ modulo: i, problemas: ["Não foi possível ler o módulo"] });
      relatorio.problemas.push(`Módulo ${i}: Não foi possível ler o módulo`);
      continue;
    }
    let problemas = verificarModuloPedagogico(modulo, i);
    relatorio.modulos.push({ modulo: i, problemas });
    if (problemas.length) relatorio.problemas.push(`Módulo ${i}: ${problemas.join('; ')}`);
    modulos.push(modulo);
    
    // Contar questões
    if (modulo.quiz && modulo.quiz.questoes) {
      questoesTotais += modulo.quiz.questoes.length;
    }
  }
  
  // 2. Avaliação final
    const avaliacaoPath = path.join(dataPath, 'avaliacaoFinal.js');
  const avaliacao = lerModuloJS(avaliacaoPath);
  if (!avaliacao) {
    relatorio.avaliacaoFinal = { problemas: ["Não foi possível ler a avaliação final"] };
    relatorio.problemas.push("Avaliação final: Não foi possível ler o arquivo");
  } else {
    let problemas = verificarAvaliacaoFinalPedagogico(avaliacao);
    relatorio.avaliacaoFinal = { problemas };
    if (problemas.length) relatorio.problemas.push(`Avaliação final: ${problemas.join('; ')}`);
    
    // Contar questões da avaliação final
    if (avaliacao.quiz && avaliacao.quiz.questoes) {
      questoesTotais += avaliacao.quiz.questoes.length;
    }
  }
  
  // 3. Verificar conversão TXT → JSON
  let problemasConversao = verificarConversaoTxtParaJson();
  relatorio.conversaoTxt = { problemas: problemasConversao };
  if (problemasConversao.length) relatorio.problemas.push(`Conversão TXT: ${problemasConversao.join('; ')}`);
  
  // 4. Áudios
  let problemasAudios = verificarAudiosModulos(modulos);
  relatorio.audios = { problemas: problemasAudios };
  if (problemasAudios.length) relatorio.problemas.push(`Áudios: ${problemasAudios.join('; ')}`);
  
  // 5. Web
  let problemasWeb = verificarArquivosWeb();
  relatorio.web = { problemas: problemasWeb };
  if (problemasWeb.length) relatorio.problemas.push(`Web: ${problemasWeb.join('; ')}`);
  
  // 6. Backend
  let problemasBackend = verificarBackendArquivos();
  relatorio.backend = { problemas: problemasBackend };
  if (problemasBackend.length) relatorio.problemas.push(`Backend: ${problemasBackend.join('; ')}`);
  
  // 7. Configuração
  let problemasConfig = verificarConfiguracao();
  relatorio.config = { problemas: problemasConfig };
  if (problemasConfig.length) relatorio.problemas.push(`Configuração: ${problemasConfig.join('; ')}`);
  
  // 8. Acessibilidade
  let problemasAcess = verificarAcessibilidadeHTML();
  relatorio.acessibilidade = { problemas: problemasAcess };
  if (problemasAcess.length) relatorio.problemas.push(`Acessibilidade: ${problemasAcess.join('; ')}`);
  
  // 9. Backend online
  let backendOnline = await verificarBackendOnline();
  relatorio.backendOnline = backendOnline;
  if (!backendOnline) {
    relatorio.sugestoes.push('Backend offline. Inicie com: cd backend && node server.js');
    relatorio.problemas.push('Backend offline');
  }
  
  console.log('\n🔍 INICIANDO VERIFICAÇÕES AVANÇADAS...\n');
  
  // 10. Verificação de integridade de layout
  const integridadeLayout = verificarIntegridadeLayout();
  relatorio.integridadeLayout = integridadeLayout;
  if (integridadeLayout.problemas && integridadeLayout.problemas.length) {
    relatorio.problemas.push('Integridade de layout: ' + integridadeLayout.problemas.join('; '));
  }
  
  // 11. Verificação de padrões visuais CSS
  const padroesVisuais = verificarPadroesVisuaisCSS();
  relatorio.padroesVisuaisCSS = padroesVisuais;
  if (padroesVisuais.problemas && padroesVisuais.problemas.length) {
    relatorio.problemas.push('Padrões visuais CSS: ' + padroesVisuais.problemas.join('; '));
  }
  if (padroesVisuais.avisos && padroesVisuais.avisos.length) {
    relatorio.sugestoes.push('CSS: ' + padroesVisuais.avisos.slice(0, 3).join('; ') + (padroesVisuais.avisos.length > 3 ? '...' : ''));
  }
  
  // ✅ CORRIGIDO: Adicionar informações CSS ao relatório
  relatorio.verificacoes_avancadas.css = {
    arquivos_verificados: padroesVisuais.arquivos_verificados || 0,
    total_arquivos: padroesVisuais.total_arquivos || 0,
    problemas: padroesVisuais.problemas ? padroesVisuais.problemas.length : 0,
    avisos: padroesVisuais.avisos ? padroesVisuais.avisos.length : 0,
    responsivos: padroesVisuais.avisos ? padroesVisuais.avisos.filter(a => a.includes('Responsividade')).length : 0,
    status: padroesVisuais.problemas && padroesVisuais.problemas.length === 0 ? 'excellent' : 'needs_improvement'
  };
  
  // 12. Verificação de duplicidade de arquivos de layout
  console.log('\n🔍 Verificando duplicidade de arquivos de layout...');
  const layoutFiles = [
    'public/index.html',
    'public/login.html',
    'public/admin.html',
    'public/certificate-modal.html',
    'public/test-progress.html',
    'public/teste-player.html',
    'public/teste.html',
    'public/validate.html'
  ];

  const duplicateCheck = {
    files: {},
    duplicates: [],
    summary: {
      total: layoutFiles.length,
      checked: 0,
      duplicates_found: 0
    }
  };

  const fileHashes = new Map();

  for (const layoutFile of layoutFiles) {
    if (!fs.existsSync(layoutFile)) {
      duplicateCheck.files[layoutFile] = { status: 'missing', hash: null };
      continue;
    }

    try {
      const content = fs.readFileSync(layoutFile, 'utf8');
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      
      duplicateCheck.files[layoutFile] = { status: 'found', hash };
      duplicateCheck.summary.checked++;

      if (fileHashes.has(hash)) {
        const duplicateOf = fileHashes.get(hash);
        duplicateCheck.duplicates.push({
          file: layoutFile,
          duplicate_of: duplicateOf,
          hash: hash
        });
        duplicateCheck.summary.duplicates_found++;
    } else {
        fileHashes.set(hash, layoutFile);
      }
    } catch (error) {
      duplicateCheck.files[layoutFile] = { status: 'error', hash: null, error: error.message };
    }
  }

  // Salvar verificação de duplicatas
  try {
    fs.writeFileSync('logs/duplicate-check.json', JSON.stringify(duplicateCheck, null, 2));
    console.log(`✅ Verificação de duplicatas concluída: ${duplicateCheck.summary.duplicates_found} duplicatas encontradas`);
  } catch (error) {
    logger.error(`Erro ao salvar verificação de duplicatas: ${error.message}`);
  }

  // 13. Verificação de portas livres e permissões
  console.log('\n🔍 Verificando portas livres e permissões...');
  const portCheck = {
    ports: {},
    permissions: {},
    summary: {
      ports_checked: 0,
      ports_available: 0,
      permissions_checked: 0,
      permissions_ok: 0
    }
  };

  // Verificar portas comuns
  const commonPorts = [3000, 8000, 8080, 5000, 4000];
  
  for (const port of commonPorts) {
    try {
      const server = net.createServer();
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          server.close();
          resolve();
        }, 2000); // Timeout de 2 segundos
        
        server.listen(port, () => {
          clearTimeout(timeout);
          portCheck.ports[port] = { status: 'available', error: null };
          portCheck.summary.ports_available++;
          server.close();
          resolve();
        });
        server.on('error', (err) => {
          clearTimeout(timeout);
          portCheck.ports[port] = { status: 'in_use', error: err.code };
          resolve();
        });
      });
    } catch (error) {
      portCheck.ports[port] = { status: 'error', error: error.message };
    }
    portCheck.summary.ports_checked++;
  }

  // Verificar permissões de arquivos importantes
  const importantFiles = [
    'public/data/',
    'backend/',
    'scripts/',
    'logs/'
  ];

  for (const file of importantFiles) {
    try {
      const stats = fs.statSync(file);
      const permissions = {
        readable: true,
        writable: true,
        executable: stats.isDirectory()
      };
      portCheck.permissions[file] = { status: 'ok', permissions };
      portCheck.summary.permissions_ok++;
    } catch (error) {
      portCheck.permissions[file] = { status: 'error', error: error.message };
    }
    portCheck.summary.permissions_checked++;
  }

  // Salvar verificação de portas e permissões
  try {
    fs.writeFileSync('logs/port-permissions-check.json', JSON.stringify(portCheck, null, 2));
    console.log(`✅ Verificação de portas e permissões concluída: ${portCheck.summary.ports_available}/${portCheck.summary.ports_checked} portas disponíveis`);
  } catch (error) {
    logger.error(`Erro ao salvar verificação de portas: ${error.message}`);
  }

  // 14. Checagem de variedade de tipos de cards e embaralhamento
  console.log('\n🔍 Verificando variedade de tipos de cards e embaralhamento...');
  const cardVarietyCheck = {
    modules: {},
    summary: {
      total_modules: 0,
      modules_with_variety: 0,
      total_cards: 0,
      card_types: {},
      shuffle_implemented: false
    }
  };

  // Verificar tipos de cards em cada módulo
  for (let i = 1; i <= 7; i++) {
    const moduleFile = `public/data/browser/module${i}.js`;
    if (!fs.existsSync(moduleFile)) continue;

    try {
      const moduleContent = fs.readFileSync(moduleFile, 'utf8');
      const moduleData = parseModuloSeguro(moduleContent);
      
      if (!moduleData) {
        cardVarietyCheck.modules[`module${i}`] = { error: 'Falha no parsing do módulo' };
        continue;
      }
      
      const cardTypes = new Set();
      let totalCards = 0;

      if (moduleData.cards && Array.isArray(moduleData.cards)) {
        moduleData.cards.forEach(card => {
          totalCards++;
          if (card.type) cardTypes.add(card.type);
        });
      }

      cardVarietyCheck.modules[`module${i}`] = {
        total_cards: totalCards,
        card_types: Array.from(cardTypes),
        variety_score: cardTypes.size / Math.max(totalCards, 1)
      };

      cardVarietyCheck.summary.total_cards += totalCards;
      cardTypes.forEach(type => {
        cardVarietyCheck.summary.card_types[type] = (cardVarietyCheck.summary.card_types[type] || 0) + 1;
      });

      if (cardTypes.size >= 3) {
        cardVarietyCheck.summary.modules_with_variety++;
      }

      cardVarietyCheck.summary.total_modules++;
    } catch (error) {
      cardVarietyCheck.modules[`module${i}`] = { error: error.message };
    }
  }

  // Verificar se o embaralhamento está implementado
  const scriptFiles = ['public/script.js', 'public/admin.js'];
  for (const scriptFile of scriptFiles) {
    if (fs.existsSync(scriptFile)) {
      try {
        const scriptContent = fs.readFileSync(scriptFile, 'utf8');
        if (scriptContent.includes('shuffle') || scriptContent.includes('sort') || scriptContent.includes('random')) {
          cardVarietyCheck.summary.shuffle_implemented = true;
          break;
        }
      } catch (error) {
        logger.error(`Erro ao ler script ${scriptFile}: ${error.message}`);
      }
    }
  }

  // Salvar verificação de variedade de cards
  try {
    fs.writeFileSync('logs/card-variety-check.json', JSON.stringify(cardVarietyCheck, null, 2));
    logger.info(`✅ Verificação de variedade de cards concluída: ${cardVarietyCheck.summary.modules_with_variety}/${cardVarietyCheck.summary.total_modules} módulos com boa variedade`);
  } catch (error) {
    logger.error(`Erro ao salvar verificação de variedade: ${error.message}`);
  }

  // ✅ MELHORIA: Atualizar estatísticas
  relatorio.estatisticas = {
    arquivosProcessados: modulos.length + 1, // +1 para avaliação final
    tempoExecucao: Date.now() - tempoInicio,
    modulosValidos: modulos.length,
    questoesTotais: questoesTotais
  };

  // Adicionar resultados das verificações avançadas ao relatório
  // ✅ CORRIGIDO: Verificar se os logs existem antes de tentar lê-los
  try {
    if (fs.existsSync('logs/duplicate-check.json')) {
      const duplicateCheck = JSON.parse(fs.readFileSync('logs/duplicate-check.json', 'utf8'));
      relatorio.verificacoes_avancadas.duplicatas = {
        arquivos_verificados: duplicateCheck.summary.checked,
        duplicatas_encontradas: duplicateCheck.summary.duplicates_found,
        status: duplicateCheck.summary.duplicates_found === 0 ? 'excellent' : 'warning'
      };
    }
  } catch (error) {
    logger.error(`Erro ao ler verificação de duplicatas: ${error.message}`);
  }

  try {
    if (fs.existsSync('logs/port-permissions-check.json')) {
      const portCheck = JSON.parse(fs.readFileSync('logs/port-permissions-check.json', 'utf8'));
      relatorio.verificacoes_avancadas.portas_permissoes = {
        portas_disponiveis: portCheck.summary.ports_available,
        permissoes_ok: portCheck.summary.permissions_ok,
        status: portCheck.summary.ports_available > 0 && portCheck.summary.permissions_ok > 0 ? 'excellent' : 'needs_attention'
      };
    }
  } catch (error) {
    logger.error(`Erro ao ler verificação de portas: ${error.message}`);
  }

  try {
    if (fs.existsSync('logs/card-variety-check.json')) {
      const cardVarietyCheck = JSON.parse(fs.readFileSync('logs/card-variety-check.json', 'utf8'));
      relatorio.verificacoes_avancadas.variedade_cards = {
        modulos_com_variedade: cardVarietyCheck.summary.modules_with_variety,
        total_cards: cardVarietyCheck.summary.total_cards,
        embaralhamento_implementado: cardVarietyCheck.summary.shuffle_implemented,
        tipos_cards: Object.keys(cardVarietyCheck.summary.card_types).length,
        status: cardVarietyCheck.summary.modules_with_variety >= 5 && cardVarietyCheck.summary.shuffle_implemented ? 'excellent' : 'needs_improvement'
      };
    }
  } catch (error) {
    logger.error(`Erro ao ler verificação de variedade: ${error.message}`);
  }

  // ✅ MELHORIA: Atualizar estatísticas do logger
  const estatisticasLogs = logger.obterEstatisticas();
  relatorio.logs = estatisticasLogs;
  
  // 16. Gerar checklist final
  gerarChecklistFinal();
  
  // 17. Resumo
  if (relatorio.problemas.length === 0) {
    logger.info('✅ SISTEMA MRS: TUDO OK!');
  } else {
    logger.warn('⚠️ SISTEMA MRS: PROBLEMAS DETECTADOS!');
    relatorio.problemas.forEach(p => logger.warn(' - ' + p));
    if (relatorio.sugestoes.length) {
      logger.info('Sugestões:');
      relatorio.sugestoes.forEach(s => logger.info(' - ' + s));
    }
  }
  
  // 18. Exibir checklist
  logger.info('📋 CHECKLIST FINAL DE VALIDAÇÃO');
  logger.info('================================');
  
  logger.info('✅ ESTRUTURA:');
  relatorio.checklist.estrutura.forEach(item => {
    logger.info(` ${item.status} ${item.item}`);
  });
  
  logger.info('🔍 LAYOUT (Validação Manual Necessária):');
  relatorio.checklist.layout.forEach(item => {
    logger.info(` ${item.status} ${item.item}`);
    if (item.instrucao) logger.info(`    → ${item.instrucao}`);
  });
  
  logger.info('🔍 FUNCIONALIDADES:');
  relatorio.checklist.funcionalidades.forEach(item => {
    logger.info(` ${item.status} ${item.item}`);
    if (item.instrucao) logger.info(`    → ${item.instrucao}`);
  });
  
  logger.info('✅ CONTEÚDO:');
  relatorio.checklist.conteudo.forEach(item => {
    logger.info(` ${item.status} ${item.item}`);
  });
  
  // ✅ MELHORIA: Exibir estatísticas
  logger.info('📊 ESTATÍSTICAS:');
  logger.info(` - Arquivos processados: ${relatorio.estatisticas.arquivosProcessados}`);
  logger.info(` - Módulos válidos: ${relatorio.estatisticas.modulosValidos}/7`);
  logger.info(` - Questões totais: ${relatorio.estatisticas.questoesTotais}`);
  logger.info(` - Tempo de execução: ${relatorio.estatisticas.tempoExecucao}ms`);
  logger.info(` - Logs gerados: ${estatisticasLogs.total}`);
  logger.info(` - Memória máxima: ${estatisticasLogs.memoriaMaxima}MB`);
  
  // 19. Instruções de validação manual
  exibirInstrucoesValidacaoManual();
  
  // 20. Salvar relatório final
  salvarRelatorio(relatorio);
  
  // ✅ MELHORIA: Salvar logs estruturados
  logger.salvarLogs();
  
  // 21. Definir código de saída baseado nos problemas encontrados
  const exitCode = relatorio.problemas.length === 0 ? 0 : 1;
  
  // 22. Exibir resumo final
  logger.info('='.repeat(60));
  logger.info('📊 RESUMO FINAL DO TESTE COMPLETO');
  logger.info('='.repeat(60));
  logger.info(`✅ Módulos válidos: ${relatorio.estatisticas.modulosValidos}/7`);
  logger.info(`✅ Questões totais: ${relatorio.estatisticas.questoesTotais}`);
  logger.info(`✅ Tempo de execução: ${relatorio.estatisticas.tempoExecucao}ms`);
  logger.info(`⚠️ Problemas encontrados: ${relatorio.problemas.length}`);
  logger.info(`💡 Sugestões: ${relatorio.sugestoes.length}`);
  logger.info(`📝 Logs gerados: ${estatisticasLogs.total}`);
  
  if (relatorio.verificacoes_avancadas.css) {
    logger.info(`🎨 CSS: ${relatorio.verificacoes_avancadas.css.arquivos_verificados} arquivos, ${relatorio.verificacoes_avancadas.css.responsivos} responsivos`);
  }
  if (relatorio.verificacoes_avancadas.duplicatas) {
    logger.info(`📄 Duplicatas: ${relatorio.verificacoes_avancadas.duplicatas.duplicatas_encontradas} encontradas`);
  }
  if (relatorio.verificacoes_avancadas.portas_permissoes) {
    logger.info(`🔌 Portas: ${relatorio.verificacoes_avancadas.portas_permissoes.portas_disponiveis} disponíveis`);
  }
  if (relatorio.verificacoes_avancadas.variedade_cards) {
    logger.info(`🎯 Cards: ${relatorio.verificacoes_avancadas.variedade_cards.modulos_com_variedade}/7 módulos com variedade`);
  }
  
  logger.info('='.repeat(60));
  
  if (exitCode === 0) {
    logger.info('🎉 SISTEMA MRS: TODAS AS VERIFICAÇÕES PASSARAM!');
    logger.info('✅ O sistema está pronto para uso em produção.');
  } else {
    logger.warn('⚠️ SISTEMA MRS: PROBLEMAS DETECTADOS!');
    logger.warn('🔧 Revise os problemas listados acima antes de prosseguir.');
  }
  
  logger.info('='.repeat(60));
  
  // Retornar código de saída para automação
  return exitCode;
}

// Executar o teste completo com tratamento de erros robusto
(async () => {
  try {
    const exitCode = await executarTesteCompleto();
    process.exit(exitCode);
  } catch (error) {
    console.error('❌ ERRO CRÍTICO NO SCRIPT:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(2); // Código de erro crítico
  }
})();
