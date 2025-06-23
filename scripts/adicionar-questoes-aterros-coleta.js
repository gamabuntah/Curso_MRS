const fs = require('fs');
const path = require('path');

// Ler o arquivo atual
const arquivoAtual = path.join(__dirname, '../public/data/browser/questoes-otimizadas/avaliacaoFinal.js');
const conteudoAtual = fs.readFileSync(arquivoAtual, 'utf8');

// Extrair as questões existentes
const match = conteudoAtual.match(/window\.avaliacaoFinal = ({[\s\S]*});/);
const avaliacaoAtual = JSON.parse(match[1]);

// Novas questões sobre aterros e coleta
const novasQuestoes = [
  {
    pergunta: "O Módulo 3 enfatiza a diferença entre aterro sanitário e aterro controlado. Qual das seguintes características é a principal ausência ou deficiência que torna um 'aterro controlado' uma destinação inadequada em comparação a um 'aterro sanitário'?",
    alternativas: [
      {
        texto: "A presença de catadores trabalhando na unidade.",
        correta: false,
        feedback: "A presença de catadores pode ocorrer em ambos, mas é mais comum em lixões e aterros controlados devido à precariedade e falta de controle. Não é a principal diferença técnica de classificação."
      },
      {
        texto: "A realização de cobertura diária do lixo com terra.",
        correta: false,
        feedback: "A cobertura diária do lixo com terra é uma prática que pode ocorrer em aterros controlados como uma melhoria em relação aos lixões, mas não significa que ele tenha toda a engenharia de um aterro sanitário."
      },
      {
        texto: "A falta de sistema de impermeabilização da base e tratamento completo do chorume.",
        correta: true,
        feedback: "Correto. A falta de sistema de impermeabilização da base e tratamento completo do chorume é a diferença crucial. Um aterro controlado, embora possa ter uma cobertura de terra ocasional, não possui a engenharia completa de impermeabilização do solo e dos sistemas de drenagem e tratamento de chorume e gás que um aterro sanitário possui. Isso o torna ambientalmente inadequado, pois pode contaminar o solo e a água."
      },
      {
        texto: "A distância da área urbana do município.",
        correta: false,
        feedback: "A distância da área urbana do município pode ser um fator logístico ou de planejamento, mas não é a característica técnica que diferencia a adequação ambiental dos dois tipos de aterro."
      }
    ]
  },
  {
    pergunta: "No bloco VCC (Varrição, Capina e Coleta Convencional), a pesquisa detalha o que está incluído na 'coleta convencional'. Quais tipos de resíduos são abrangidos por essa modalidade de coleta, tipicamente realizada por caminhões de lixo que passam nas ruas?",
    alternativas: [
      {
        texto: "Resíduos recicláveis separados na fonte (papel, plástico, metal, vidro).",
        correta: false,
        feedback: "Resíduos recicláveis separados na fonte (papel, plástico, metal, vidro) refere-se à coleta seletiva, que é um sistema paralelo à coleta comum."
      },
      {
        texto: "Resíduos domésticos (lixo comum das casas) e resíduos públicos (de limpeza de ruas, praças, feiras).",
        correta: true,
        feedback: "Correto. A coleta convencional abrange o lixo comum gerado nas residências (orgânico e reciclável misturado) e os resíduos resultantes da limpeza de áreas públicas."
      },
      {
        texto: "Resíduos perigosos de serviços de saúde e resíduos industriais.",
        correta: false,
        feedback: "Resíduos perigosos de serviços de saúde e resíduos industriais são classificados como 'resíduos especiais' e exigem manejo e coleta diferenciados."
      },
      {
        texto: "Resíduos da construção civil e grandes volumes de entulho.",
        correta: false,
        feedback: "Resíduos da construção civil e grandes volumes de entulho são os RCC, que também são considerados 'resíduos especiais' e têm um manejo específico."
      }
    ]
  },
  {
    pergunta: "Ao investigar os serviços de varrição e capina (ou raspagem), o questionário da PNSB busca informações específicas para entender a execução dessas atividades. Quais são os principais detalhes que o agente do IBGE deve registrar sobre a realização da varrição e capina?",
    alternativas: [
      {
        texto: "Os nomes dos funcionários responsáveis por cada equipe de varrição e capina.",
        correta: false,
        feedback: "Os nomes dos funcionários responsáveis por cada equipe de varrição e capina não é um tipo de informação que a PNSB coleta, pois o foco é a gestão do serviço, não detalhes operacionais de pessoal."
      },
      {
        texto: "As formas de execução (mecânica, manual ou química para capina) e a frequência e abrangência (urbana, rural, ambas) dos serviços.",
        correta: true,
        feedback: "Correto. Para a varrição, a pesquisa diferencia entre mecânica e manual. Para a capina, adiciona a forma química. Para ambas, é fundamental registrar a frequência (diária, semanal, quinzenal) e a área de abrangência (urbana, rural, ou ambas), o que fornece um panorama operacional detalhado."
      },
      {
        texto: "O custo anual total de manutenção dos equipamentos utilizados nas atividades.",
        correta: false,
        feedback: "O custo anual total de manutenção dos equipamentos utilizados nas atividades pode ser um dado financeiro relevante para o prestador, mas não é um item primário de coleta no questionário da PNSB para estas seções específicas."
      },
      {
        texto: "A satisfação da população com a qualidade da varrição e capina no município.",
        correta: false,
        feedback: "A satisfação da população com a qualidade da varrição e capina no município é um dado de percepção da demanda que seria mais comum em pesquisas domiciliares (como a PNAD Contínua ou Censo) do que na PNSB, que foca na oferta e caracterização do prestador de serviço."
      }
    ]
  },
  {
    pergunta: "O módulo 4 da PNSB 2024 dedica uma seção à limpeza urbana e manejo de resíduos sólidos em Áreas Especiais (SAEI). Qual das opções abaixo melhor descreve o principal critério para a classificação de uma área como 'especial' para fins da pesquisa?",
    alternativas: [
      {
        texto: "Áreas com população majoritariamente idosa ou com deficiência, exigindo coleta domiciliar diferenciada.",
        correta: false,
        feedback: "A idade ou condição física da população não é o critério principal para definir uma área como 'especial' para a logística de resíduos na PNSB."
      },
      {
        texto: "Áreas que apresentam dificuldades logísticas ou características geográficas e sociais particulares para a prestação de serviços de saneamento.",
        correta: true,
        feedback: "Correto. A fonte afirma que Áreas Especiais incluem 'Terras indígenas, comunidades ribeirinhas, às vezes isoladas, quilombos, favelas com acesso complicado, ocupações, palafitas, basicamente lugares onde a logística comum, bem, não funciona direito.' Isso aponta para dificuldades logísticas e características particulares para a prestação de serviços."
      },
      {
        texto: "Áreas urbanas com alta densidade demográfica, onde a geração de resíduos é significativamente superior à média nacional.",
        correta: false,
        feedback: "Embora a densidade populacional possa influenciar a geração de resíduos, a pesquisa foca nas dificuldades de acesso e características específicas da área, não apenas no volume de lixo gerado."
      },
      {
        texto: "Áreas rurais exclusivas para descarte de resíduos industriais perigosos, monitoradas pelo IBAMA.",
        correta: false,
        feedback: "Áreas Especiais se referem a comunidades com dificuldades de acesso para serviços urbanos e de resíduos, e não especificamente a locais de descarte de resíduos industriais perigosos em áreas rurais."
      }
    ]
  },
  {
    pergunta: "Ao investigar a atuação dos prestadores de serviço em Áreas Especiais (SAEI), um ponto chave da PNSB 2024 é diferenciar se a atuação foi contínua e regular ou se aconteceu apenas 'quando a comunidade tipo pediu'. Qual a principal razão para essa distinção ser considerada tão importante na pesquisa?",
    alternativas: [
      {
        texto: "Para determinar o custo exato da operação, já que serviços contínuos são mais caros.",
        correta: false,
        feedback: "Embora o custo seja um fator relevante, a pesquisa, ao fazer essa distinção, foca na regularidade e confiabilidade do serviço, e não primariamente em seu custo."
      },
      {
        texto: "Para avaliar a equidade e a confiabilidade do serviço público nessas áreas, identificando possíveis lacunas na prestação.",
        correta: true,
        feedback: "Correto. A fonte estabelece que essa distinção 'ajuda a gente a avaliar a equidade, a confiabilidade do serviço público nessas áreas que muitas vezes são mais vulneráveis, né? Mostra possíveis lacunas.'"
      },
      {
        texto: "Para definir qual tipo de veículo (motorizado, barco, etc.) é mais adequado para a coleta.",
        correta: false,
        feedback: "O tipo de veículo é mapeado separadamente para entender a logística empregada, mas não é a principal razão para diferenciar a continuidade do serviço."
      },
      {
        texto: "Para verificar a necessidade de licitação para a contratação dos serviços nessas áreas.",
        correta: false,
        feedback: "A necessidade de licitação é um aspecto legal relacionado à contratação de serviços por terceiros, abordado em outros módulos, e não o foco dessa distinção específica em SAEI."
      }
    ]
  }
];

// Adicionar as novas questões
avaliacaoAtual.questoes = avaliacaoAtual.questoes.concat(novasQuestoes);

// Salvar o arquivo atualizado
const conteudoJS = `window.avaliacaoFinal = ${JSON.stringify(avaliacaoAtual, null, 2)};`;
fs.writeFileSync(arquivoAtual, conteudoJS, 'utf8');

console.log(`✅ Adicionadas ${novasQuestoes.length} questões sobre aterros e coleta!`);
console.log(`📊 Total de questões agora: ${avaliacaoAtual.questoes.length}`);
console.log(`📁 Arquivo atualizado: ${arquivoAtual}`); 