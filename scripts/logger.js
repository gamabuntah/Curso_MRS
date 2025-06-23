const fs = require('fs');
const path = require('path');

class Logger {
  constructor(opcoes = {}) {
    this.logs = [];
    this.niveis = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
    this.nivelAtual = this.niveis[opcoes.nivel || 'INFO'];
    this.arquivo = opcoes.arquivo || 'logs/teste-completo-detailed.json';
    this.maxLogs = opcoes.maxLogs || 1000;
    this.incluirTimestamp = opcoes.incluirTimestamp !== false;
    this.incluirMemoria = opcoes.incluirMemoria !== false;
  }
  
  log(nivel, mensagem, dados = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      nivel,
      mensagem,
      dados
    };
    
    // Adicionar informações de memória se solicitado
    if (this.incluirMemoria) {
      const memoria = process.memoryUsage();
      logEntry.memoria = {
        heapUsed: Math.round(memoria.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoria.heapTotal / 1024 / 1024),
        external: Math.round(memoria.external / 1024 / 1024)
      };
    }
    
    this.logs.push(logEntry);
    
    // Limitar número de logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Exibir no console se o nível for adequado
    if (this.niveis[nivel] <= this.nivelAtual) {
      const emoji = {
        ERROR: '❌',
        WARN: '⚠️',
        INFO: 'ℹ️',
        DEBUG: '🔍'
      }[nivel];
      
      console.log(`${emoji} ${mensagem}`);
    }
  }
  
  error(mensagem, dados = null) {
    this.log('ERROR', mensagem, dados);
  }
  
  warn(mensagem, dados = null) {
    this.log('WARN', mensagem, dados);
  }
  
  info(mensagem, dados = null) {
    this.log('INFO', mensagem, dados);
  }
  
  debug(mensagem, dados = null) {
    this.log('DEBUG', mensagem, dados);
  }
  
  salvarLogs(arquivo = null) {
    const arquivoFinal = arquivo || this.arquivo;
    
    try {
      // Garantir que a pasta logs existe
      const pastaLogs = path.dirname(arquivoFinal);
      if (!fs.existsSync(pastaLogs)) {
        fs.mkdirSync(pastaLogs, { recursive: true });
      }
      
      const conteudo = {
        metadata: {
          geradoEm: new Date().toISOString(),
          totalLogs: this.logs.length,
          nivelConfigurado: this.nivelAtual
        },
        logs: this.logs
      };
      
      fs.writeFileSync(arquivoFinal, JSON.stringify(conteudo, null, 2));
      this.info(`Logs salvos em: ${arquivoFinal}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao salvar logs: ${error.message}`);
      return false;
    }
  }
  
  obterEstatisticas() {
    const estatisticas = {
      total: this.logs.length,
      porNivel: {},
      ultimas24h: 0,
      memoriaMaxima: 0
    };
    
    const agora = new Date();
    const vinte4hAtras = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
    
    this.logs.forEach(log => {
      // Contar por nível
      estatisticas.porNivel[log.nivel] = (estatisticas.porNivel[log.nivel] || 0) + 1;
      
      // Contar últimas 24h
      const logTime = new Date(log.timestamp);
      if (logTime > vinte4hAtras) {
        estatisticas.ultimas24h++;
      }
      
      // Memória máxima
      if (log.memoria && log.memoria.heapUsed > estatisticas.memoriaMaxima) {
        estatisticas.memoriaMaxima = log.memoria.heapUsed;
      }
    });
    
    return estatisticas;
  }
  
  limparLogs() {
    this.logs = [];
    this.info('Logs limpos');
  }
}

module.exports = Logger; 