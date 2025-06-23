const fs = require('fs');
const path = require('path');

class SecurityValidator {
  constructor(config) {
    this.config = config;
    this.padroesPerigosos = [
      'javascript:',
      'data:',
      'vbscript:',
      'onload=',
      'onerror=',
      'onclick=',
      'onmouseover=',
      'onfocus=',
      'onblur=',
      'eval(',
      'Function(',
      'setTimeout(',
      'setInterval('
    ];
    
    this.extensoesPermitidas = [
      '.js', '.json', '.txt', '.wav', '.html', '.css', '.md'
    ];
    
    this.caminhosProibidos = [
      '..', '~', '/etc', '/var', '/usr', 'C:\\Windows', 'C:\\System32'
    ];
  }
  
  // Validar se um caminho é seguro
  validarCaminho(caminho) {
    const problemas = [];
    
    if (!caminho || typeof caminho !== 'string') {
      problemas.push('Caminho inválido ou nulo');
      return problemas;
    }
    
    // Verificar caminhos proibidos
    const caminhoNormalizado = path.normalize(caminho);
    for (const caminhoProibido of this.caminhosProibidos) {
      if (caminhoNormalizado.includes(caminhoProibido)) {
        problemas.push(`Caminho proibido detectado: ${caminhoProibido}`);
      }
    }
    
    // Verificar se o caminho resolve para fora do diretório atual
    try {
      const caminhoAbsoluto = path.resolve(caminho);
      const diretorioAtual = process.cwd();
      
      if (!caminhoAbsoluto.startsWith(diretorioAtual)) {
        problemas.push(`Caminho resolve para fora do diretório atual: ${caminhoAbsoluto}`);
      }
    } catch (error) {
      problemas.push(`Erro ao resolver caminho: ${error.message}`);
    }
    
    return problemas;
  }
  
  // Validar extensão de arquivo
  validarExtensao(caminho) {
    const problemas = [];
    
    const extensao = path.extname(caminho).toLowerCase();
    
    if (!this.extensoesPermitidas.includes(extensao)) {
      problemas.push(`Extensão não permitida: ${extensao}`);
    }
    
    return problemas;
  }
  
  // Sanitizar texto removendo conteúdo perigoso
  sanitizarTexto(texto) {
    if (typeof texto !== 'string') {
      return '';
    }
    
    let textoSanitizado = texto;
    
    // Remover padrões perigosos
    this.padroesPerigosos.forEach(padrao => {
      const regex = new RegExp(padrao, 'gi');
      textoSanitizado = textoSanitizado.replace(regex, '');
    });
    
    // Remover caracteres potencialmente perigosos
    textoSanitizado = textoSanitizado
      .replace(/[<>]/g, '')  // Remove < e >
      .replace(/javascript:/gi, '')  // Remove protocolos javascript
      .replace(/data:/gi, '')        // Remove protocolos data
      .trim();
    
    return textoSanitizado;
  }
  
  // Validar arquivo completo
  validarArquivo(caminho) {
    const problemas = [];
    
    // Validar caminho
    const problemasCaminho = this.validarCaminho(caminho);
    problemas.push(...problemasCaminho);
    
    if (problemasCaminho.length > 0) {
      return problemas; // Parar se o caminho for inválido
    }
    
    // Validar extensão
    const problemasExtensao = this.validarExtensao(caminho);
    problemas.push(...problemasExtensao);
    
    // Verificar se arquivo existe
    if (!fs.existsSync(caminho)) {
      problemas.push('Arquivo não existe');
      return problemas;
    }
    
    // Verificar tamanho do arquivo
    try {
      const stats = fs.statSync(caminho);
      
      if (stats.size === 0) {
        problemas.push('Arquivo vazio');
      } else if (stats.size > this.config.limites.tamanhoMaximoArquivo) {
        problemas.push(`Arquivo muito grande: ${Math.round(stats.size / 1024 / 1024)}MB`);
      } else if (stats.size < 100) {
        problemas.push(`Arquivo muito pequeno: ${stats.size} bytes`);
      }
    } catch (error) {
      problemas.push(`Erro ao verificar arquivo: ${error.message}`);
    }
    
    return problemas;
  }
  
  // Validar conteúdo de arquivo
  validarConteudoArquivo(caminho, conteudo) {
    const problemas = [];
    
    if (!conteudo || typeof conteudo !== 'string') {
      problemas.push('Conteúdo inválido ou nulo');
      return problemas;
    }
    
    // Verificar tamanho do conteúdo
    if (conteudo.length > this.config.limites.tamanhoMaximoArquivo) {
      problemas.push(`Conteúdo muito grande: ${Math.round(conteudo.length / 1024 / 1024)}MB`);
    }
    
    // Verificar padrões perigosos no conteúdo
    this.padroesPerigosos.forEach(padrao => {
      if (conteudo.toLowerCase().includes(padrao.toLowerCase())) {
        problemas.push(`Padrão perigoso detectado: ${padrao}`);
      }
    });
    
    // Verificar caracteres suspeitos
    const caracteresSuspeitos = conteudo.match(/[^\x00-\x7F]/g);
    if (caracteresSuspeitos && caracteresSuspeitos.length > conteudo.length * 0.1) {
      problemas.push('Muitos caracteres não-ASCII detectados');
    }
    
    return problemas;
  }
  
  // Validar JSON de forma segura
  validarJSON(conteudo) {
    const problemas = [];
    
    try {
      // Verificar se é uma string válida
      if (typeof conteudo !== 'string') {
        problemas.push('Conteúdo não é uma string');
        return problemas;
      }
      
      // Tentar fazer parse do JSON
      const json = JSON.parse(conteudo);
      
      // Verificar se não é um objeto muito complexo
      const profundidade = this.calcularProfundidadeJSON(json);
      if (profundidade > 10) {
        problemas.push(`JSON muito profundo: ${profundidade} níveis`);
      }
      
      // Verificar tamanho do objeto
      const tamanho = JSON.stringify(json).length;
      if (tamanho > this.config.limites.tamanhoMaximoArquivo) {
        problemas.push(`JSON muito grande: ${Math.round(tamanho / 1024 / 1024)}MB`);
      }
      
    } catch (error) {
      problemas.push(`JSON inválido: ${error.message}`);
    }
    
    return problemas;
  }
  
  // Calcular profundidade de um objeto JSON
  calcularProfundidadeJSON(obj, profundidade = 0) {
    if (profundidade > 20) return profundidade; // Proteção contra recursão infinita
    
    if (typeof obj !== 'object' || obj === null) {
      return profundidade;
    }
    
    let maxProfundidade = profundidade;
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const prof = this.calcularProfundidadeJSON(obj[key], profundidade + 1);
        if (prof > maxProfundidade) {
          maxProfundidade = prof;
        }
      }
    }
    
    return maxProfundidade;
  }
  
  // Validar módulo JavaScript de forma segura
  validarModuloJS(conteudo) {
    const problemas = [];
    
    // Validar conteúdo básico
    const problemasConteudo = this.validarConteudoArquivo('modulo.js', conteudo);
    problemas.push(...problemasConteudo);
    
    // Verificar se contém module.exports
    if (!conteudo.includes('module.exports')) {
      problemas.push('Não contém module.exports');
    }
    
    // Verificar se contém estrutura JSON válida
    if (!conteudo.includes('{') || !conteudo.includes('}')) {
      problemas.push('Não contém estrutura JSON válida');
    }
    
    // Verificar padrões suspeitos em JavaScript
    const padroesJS = [
      'eval(',
      'Function(',
      'setTimeout(',
      'setInterval(',
      'require(',
      'import(',
      'process.',
      'global.'
    ];
    
    padroesJS.forEach(padrao => {
      if (conteudo.includes(padrao)) {
        problemas.push(`Padrão JavaScript suspeito: ${padrao}`);
      }
    });
    
    return problemas;
  }
}

module.exports = SecurityValidator; 