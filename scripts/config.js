#!/usr/bin/env node

/**
 * Configurações centralizadas para o script teste-completo-sistema.js
 * Versão: 1.0
 * Data: 21/06/2025
 */

const config = {
  // Informações do script
  versao: '2.5',
  nome: 'Teste Completo Sistema MRS',
  descricao: 'Script de validação completa do sistema MRS',
  
  // Timeouts para operações
  timeouts: {
    backend: 5000,        // Timeout para verificação do backend (ms)
    rede: 3000,           // Timeout para operações de rede (ms)
    arquivo: 1000,        // Timeout para operações de arquivo (ms)
    verificacao: 10000    // Timeout para verificações gerais (ms)
  },
  
  // Limites e thresholds
  limites: {
    tamanhoMaximoArquivo: 10 * 1024 * 1024,  // 10MB
    tamanhoMinimoArquivo: 100,               // 100 bytes
    memoriaMinima: 50,                       // MB
    questoesMinimas: 15,                     // Questões por módulo
    questoesAvaliacao: 50,                   // Questões na avaliação final
    audiosMinimos: 7,                        // Número mínimo de áudios
    modulosMinimos: 7,                       // Número mínimo de módulos
    percentualMinimoPreservacao: 70          // % mínimo de conteúdo preservado
  },
  
  // Caminhos do sistema
  caminhos: {
    public: 'public',
    data: 'public/data/browser',
    logs: 'logs',
    audios: 'public/MRS/Audios',
    mrs: 'MRS',
    backend: 'backend',
    config: 'config-sistema.json'
  },
  
  // Configurações de portas
  portas: {
    backend: 3002,
    frontend: 8000,
    alternativas: [3003, 3004, 8001, 8002]  // Portas alternativas para teste
  },
  
  // Configurações de arquivos
  arquivos: {
    extensoesPermitidas: ['.js', '.json', '.txt', '.wav', '.html', '.css', '.md'],
    arquivosCriticos: [
      'public/data/browser/module1.js',
      'public/data/browser/avaliacaoFinal.js',
      'backend/server.js',
      'config-sistema.json'
    ],
    arquivosLayout: [
      'public/index.html',
      'public/login.html',
      'public/admin.html',
      'public/certificate-modal.html',
      'public/test-progress.html',
      'public/teste-player.html',
      'public/teste.html',
      'public/validate.html'
    ]
  },
  
  // Configurações de validação
  validacao: {
    cardsObrigatorios: ["dica", "atencao", "exemplo", "duvidas", "resumo visual"],
    padroesCSS: [
      'media\\s+query',
      'flexbox',
      'grid',
      'responsive',
      'mobile',
      'tablet'
    ],
    padroesSeguranca: [
      'javascript:',
      'data:',
      'vbscript:',
      'onload=',
      'onerror=',
      'onclick='
    ]
  },
  
  // Configurações de logging
  logging: {
    nivel: 'INFO',  // ERROR, WARN, INFO, DEBUG
    arquivo: 'logs/teste-completo-detailed.json',
    maxLogs: 1000,
    incluirTimestamp: true,
    incluirMemoria: true
  },
  
  // Configurações de segurança
  seguranca: {
    validarCaminhos: true,
    sanitizarEntrada: true,
    verificarExtensoes: true,
    maxTamanhoConteudo: 50 * 1024 * 1024,  // 50MB
    timeoutOperacoes: 30000                 // 30s
  },
  
  // Configurações de performance
  performance: {
    processamentoParalelo: true,
    maxConcorrencia: 5,
    cacheResultados: true,
    limparCache: true
  }
};

// Função para validar a configuração
function validarConfiguracao() {
  const problemas = [];
  
  Object.entries(config.caminhos).forEach(([nome, caminho]) => {
    if (!caminho) {
      problemas.push(`Pasta ${nome} não definida`);
    }
  });
  
  if (config.portas.backend < 1024 || config.portas.backend > 65535) {
    problemas.push(`Porta backend inválida: ${config.portas.backend}`);
  }
  
  if (config.portas.frontend < 1024 || config.portas.frontend > 65535) {
    problemas.push(`Porta frontend inválida: ${config.portas.frontend}`);
  }
  
  // Verificar se os timeouts são válidos
  Object.entries(config.timeouts).forEach(([nome, valor]) => {
    if (valor < 100 || valor > 60000) {
      problemas.push(`Timeout ${nome} inválido: ${valor}ms`);
    }
  });
  
  // Verificar se os limites são válidos
  if (config.limites.memoriaMinima < 10) {
    problemas.push(`Memória mínima muito baixa: ${config.limites.memoriaMinima}MB`);
  }
  
  if (config.limites.percentualMinimoPreservacao < 50 || config.limites.percentualMinimoPreservacao > 100) {
    problemas.push(`Percentual mínimo de preservação inválido: ${config.limites.percentualMinimoPreservacao}%`);
  }
  
  return problemas;
}

// Função para obter configuração com validação
function obterConfiguracao() {
  const problemas = validarConfiguracao();
  
  if (problemas.length > 0) {
    console.error('❌ ERRO: Problemas na configuração:');
    problemas.forEach(p => console.error(`   - ${p}`));
    throw new Error('Configuração inválida');
  }
  
  return config;
}

// Exportar configuração e funções
module.exports = {
  config,
  validarConfiguracao,
  obterConfiguracao
}; 