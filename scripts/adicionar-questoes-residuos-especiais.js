const fs = require('fs');
const path = require('path');

// Ler o arquivo atual
const arquivoAtual = path.join(__dirname, '../public/data/browser/questoes-otimizadas/avaliacaoFinal.js');
const conteudoAtual = fs.readFileSync(arquivoAtual, 'utf8');

// Extrair as questões existentes
const match = conteudoAtual.match(/window\.avaliacaoFinal = ({[\s\S]*});/);
const avaliacaoAtual = JSON.parse(match[1]);

// Novas questões sobre resíduos especiais
const novasQuestoes = [
  {
    pergunta: "De acordo com o Módulo 5 da PNSB 2024, para ser considerado um prestador de serviço de Resíduos Sólidos Especiais (SPE) para fins da pesquisa, uma entidade precisa cumprir uma condição específica. Qual é essa condição?",
    alternativas: [
      {
        texto: "Ter uma licença ambiental válida emitida pelo órgão competente.",
        correta: false,
        feedback: "Embora a licença ambiental seja importante, não é a condição específica mencionada no módulo para ser considerado prestador de serviço de resíduos especiais."
      },
      {
        texto: "Executar pelo menos uma etapa do manejo de resíduos especiais (coleta, transporte, processamento ou destinação final).",
        correta: true,
        feedback: "Correto. Para ser considerado prestador de serviço de resíduos especiais na PNSB, a entidade deve executar pelo menos uma das etapas do manejo desses resíduos: coleta, transporte, processamento ou destinação final."
      },
      {
        texto: "Atuar em mais de um município simultaneamente.",
        correta: false,
        feedback: "A atuação em múltiplos municípios não é um requisito para ser considerado prestador de serviço de resíduos especiais."
      },
      {
        texto: "Possuir equipamentos específicos para cada tipo de resíduo especial.",
        correta: false,
        feedback: "Embora equipamentos específicos sejam importantes para o manejo adequado, não é a condição específica mencionada no módulo."
      }
    ]
  },
  {
    pergunta: "Os Resíduos de Serviços de Saúde (RSS) são classificados como especiais devido às suas características de periculosidade. Segundo o Módulo 5 da PNSB 2024, qual das combinações abaixo não representa uma característica dos RSS?",
    alternativas: [
      {
        texto: "Contaminação biológica e risco de transmissão de doenças.",
        correta: false,
        feedback: "Esta é uma característica real dos RSS, que podem conter agentes biológicos patogênicos."
      },
      {
        texto: "Presença de substâncias químicas perigosas e materiais radioativos.",
        correta: false,
        feedback: "Esta também é uma característica real dos RSS, que podem conter produtos químicos e materiais radioativos."
      },
      {
        texto: "Alto volume de geração e fácil degradação natural.",
        correta: true,
        feedback: "Correto. O alto volume de geração pode ser uma característica, mas a 'fácil degradação natural' não é uma característica dos RSS. Na verdade, muitos RSS são resistentes à degradação natural e exigem tratamento específico."
      },
      {
        texto: "Risco de contaminação ambiental e necessidade de tratamento diferenciado.",
        correta: false,
        feedback: "Esta é uma característica real dos RSS, que exigem tratamento diferenciado para evitar contaminação ambiental."
      }
    ]
  },
  {
    pergunta: "O processamento e a destinação final dos Resíduos de Serviços de Saúde (RSS) exigem métodos específicos devido à sua periculosidade. Qual das alternativas abaixo apresenta uma combinação correta de método de processamento e destinação final para RSS?",
    alternativas: [
      {
        texto: "Compostagem e aterro sanitário.",
        correta: false,
        feedback: "A compostagem não é um método adequado para RSS devido aos riscos biológicos e químicos."
      },
      {
        texto: "Incineração e aterro sanitário para cinzas.",
        correta: true,
        feedback: "Correto. A incineração é um método adequado para RSS, pois destrói agentes biológicos e reduz o volume. As cinzas resultantes são então destinadas a aterro sanitário."
      },
      {
        texto: "Reciclagem e reutilização direta.",
        correta: false,
        feedback: "A reciclagem e reutilização direta não são métodos adequados para RSS devido aos riscos de contaminação."
      },
      {
        texto: "Aterro controlado e cobertura com terra.",
        correta: false,
        feedback: "O aterro controlado não é uma destinação adequada para RSS, pois não oferece proteção ambiental suficiente."
      }
    ]
  },
  {
    pergunta: "Os Resíduos da Construção Civil (RCC) são classificados pela Resolução CONAMA 307. De acordo com o Módulo 5 da PNSB 2024, qual das classes de RCC é definida como 'resíduos que não possuem tecnologia ou viabilidade econômica para reciclagem'?",
    alternativas: [
      {
        texto: "Classe A - Resíduos recicláveis (tijolos, telhas, argamassa, concreto).",
        correta: false,
        feedback: "A Classe A inclui resíduos recicláveis como tijolos, telhas, argamassa e concreto, que possuem tecnologia de reciclagem."
      },
      {
        texto: "Classe B - Resíduos recicláveis (plásticos, papel, papelão, metais, vidros).",
        correta: false,
        feedback: "A Classe B inclui resíduos recicláveis como plásticos, papel, papelão, metais e vidros, que possuem tecnologia de reciclagem."
      },
      {
        texto: "Classe C - Resíduos para os quais não foram desenvolvidas tecnologias ou aplicações economicamente viáveis.",
        correta: true,
        feedback: "Correto. A Classe C é definida como resíduos para os quais não foram desenvolvidas tecnologias ou aplicações economicamente viáveis para reciclagem."
      },
      {
        texto: "Classe D - Resíduos perigosos (tintas, solventes, óleos).",
        correta: false,
        feedback: "A Classe D inclui resíduos perigosos como tintas, solventes e óleos, que exigem tratamento específico, mas não necessariamente por falta de tecnologia de reciclagem."
      }
    ]
  },
  {
    pergunta: "O sistema 'Campo Limpo' é um exemplo de logística reversa para embalagens de agrotóxicos, enfatizando a responsabilidade compartilhada. Qual é a ação principal e obrigatória que o agricultor deve realizar neste sistema?",
    alternativas: [
      {
        texto: "Queimar as embalagens vazias em sua propriedade para evitar contaminação.",
        correta: false,
        feedback: "A queima de embalagens de agrotóxicos é uma prática inadequada e perigosa, não fazendo parte do sistema Campo Limpo."
      },
      {
        texto: "Devolver as embalagens vazias e lavadas para os pontos de coleta autorizados.",
        correta: true,
        feedback: "Correto. O agricultor deve devolver as embalagens vazias e lavadas para os pontos de coleta autorizados do sistema Campo Limpo, cumprindo sua responsabilidade na logística reversa."
      },
      {
        texto: "Enterrar as embalagens no solo da propriedade para evitar contaminação.",
        correta: false,
        feedback: "O enterramento de embalagens de agrotóxicos é uma prática inadequada e não faz parte do sistema Campo Limpo."
      },
      {
        texto: "Vender as embalagens vazias para catadores informais.",
        correta: false,
        feedback: "A venda para catadores informais não é uma prática adequada e não faz parte do sistema Campo Limpo, que exige destinação ambientalmente adequada."
      }
    ]
  }
];

// Adicionar as novas questões
avaliacaoAtual.questoes = avaliacaoAtual.questoes.concat(novasQuestoes);

// Salvar o arquivo atualizado
const conteudoJS = `window.avaliacaoFinal = ${JSON.stringify(avaliacaoAtual, null, 2)};`;
fs.writeFileSync(arquivoAtual, conteudoJS, 'utf8');

console.log(`✅ Adicionadas ${novasQuestoes.length} questões sobre resíduos especiais!`);
console.log(`📊 Total de questões agora: ${avaliacaoAtual.questoes.length}`);
console.log(`📁 Arquivo atualizado: ${arquivoAtual}`); 