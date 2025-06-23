const fs = require('fs');
const path = require('path');

// Ler o arquivo atual
const arquivoAtual = path.join(__dirname, '../public/data/browser/questoes-otimizadas/avaliacaoFinal.js');
const conteudoAtual = fs.readFileSync(arquivoAtual, 'utf8');

// Extrair as questões existentes
const match = conteudoAtual.match(/window\.avaliacaoFinal = ({[\s\S]*});/);
const avaliacaoAtual = JSON.parse(match[1]);

// Novas questões para adicionar
const novasQuestoes = [
  {
    pergunta: "Sobre o histórico da Pesquisa Nacional de Saneamento Básico (PNSB) e outras pesquisas do IBGE na área de saneamento, qual afirmação está correta?",
    alternativas: [
      {
        texto: "A PNSB é uma pesquisa recente, criada em 2015, e foca desde o início nos quatro eixos do saneamento.",
        correta: false,
        feedback: "Incorreto. O IBGE realiza pesquisas sobre saneamento desde a década de 70. A PNSB, com seu nome atual, teve edições importantes em 1989 e 2000. A partir de 2015, ela se tornou regular e organizada por módulos temáticos."
      },
      {
        texto: "O IBGE realiza pesquisas sobre saneamento desde a década de 70, e a PNSB, organizada por módulos temáticos, começou a partir de 2015.",
        correta: true,
        feedback: "Correto. O IBGE tem um histórico de pesquisas em saneamento desde os anos 70. A PNSB, com sua estrutura regular e temática por módulos (com foco variável por ciclo), foi implementada a partir de 2015."
      },
      {
        texto: "As edições da PNSB sempre focaram em água e esgoto, sendo o manejo de resíduos e drenagem temas abordados apenas a partir de 2023.",
        correta: false,
        feedback: "Incorreto. A PNSB teve focos diferentes ao longo do tempo. Em 2017, por exemplo, o foco foi água e esgoto, mas o foco em limpeza urbana, resíduos sólidos e drenagem pluvial é específico do ciclo atual (2023-2025)."
      },
      {
        texto: "Não houve pesquisas sobre saneamento antes da PNSB, que foi a primeira iniciativa do IBGE para coletar dados sobre o tema de forma abrangente.",
        correta: false,
        feedback: "Incorreto. O IBGE realiza pesquisas sobre saneamento de formas diferentes desde a década de 70, muito antes da formalização da PNSB com seu nome atual e estrutura modular a partir de 2015."
      }
    ]
  },
  {
    pergunta: "Os dados coletados pela PNSB são fundamentais para o Brasil. Em relação a metas internacionais, como a PNSB contribui para o acompanhamento dos Objetivos de Desenvolvimento Sustentável (ODS) da ONU?",
    alternativas: [
      {
        texto: "A PNSB foca apenas em dados locais e municipais, não tendo conexão direta com indicadores globais como os ODS, que são de responsabilidade do governo federal.",
        correta: false,
        feedback: "Incorreto. Embora a PNSB colete dados município por município (local), esses dados são fundamentais para o Brasil acompanhar o progresso nos ODS da ONU, demonstrando a forte conexão entre o local e o global."
      },
      {
        texto: "Os dados sobre gestão de resíduos da PNSB alimentam indicadores do ODS 11 (cidades e comunidades sustentáveis) e ODS 12 (consumo e produção responsáveis).",
        correta: true,
        feedback: "Correto. A PNSB é uma ferramenta fundamental para o Brasil acompanhar o progresso nos Objetivos de Desenvolvimento Sustentável da ONU, com os dados de gestão de resíduos, por exemplo, alimentando indicadores do ODS 11, que trata de cidades e comunidades sustentáveis, e do ODS 12, que aborda consumo e produção responsáveis, incluindo a redução da geração de resíduos."
      },
      {
        texto: "A pesquisa ajuda o Brasil a cumprir metas do Protocolo de Kyoto, principalmente as relacionadas à redução de emissões de gases do efeito estufa em aterros sanitários.",
        correta: false,
        feedback: "Incorreto. O módulo introdutório da PNSB menciona explicitamente a conexão com os Objetivos de Desenvolvimento Sustentável (ODS) da ONU, especificamente os ODS 11 e 12, e não o Protocolo de Kyoto."
      },
      {
        texto: "A PNSB monitora exclusivamente as metas do Acordo de Paris relacionadas ao uso sustentável da água e saneamento rural.",
        correta: false,
        feedback: "Incorreto. A PNSB no ciclo atual foca em limpeza urbana, resíduos sólidos e drenagem pluvial, e sua conexão internacional mencionada no módulo é com os ODS 11 e 12, não com o Acordo de Paris ou especificamente o saneamento rural."
      }
    ]
  },
  {
    pergunta: "No Módulo 2 da PNSB 2024, o bloco RSP (Responsável pela Informação) é considerado crucial para a qualidade dos dados. Qual é a principal razão para essa afirmação?",
    alternativas: [
      {
        texto: "Ele garante que todas as perguntas do questionário sejam respondidas, evitando lacunas.",
        correta: false,
        feedback: "Incorreta. Embora o preenchimento completo seja desejável, o foco principal do bloco RSP não é a quantidade de respostas, mas sim a precisão e confiabilidade das informações, que dependem diretamente da qualificação do informante."
      },
      {
        texto: "A pessoa indicada deve ter acesso real às informações da entidade prestadora.",
        correta: true,
        feedback: "Correta. O bloco RSP é vital porque a qualidade dos dados fica comprometida se a pessoa que responde ao questionário não tiver acesso real e direto às informações da entidade prestadora do serviço. Esse é um ponto chave para a acurácia da pesquisa."
      },
      {
        texto: "Permite ao IBGE fiscalizar a veracidade das respostas no futuro.",
        correta: false,
        feedback: "Incorreta. A fiscalização da veracidade é uma etapa posterior à coleta. A importância do RSP reside em garantir que a fonte da informação no momento da coleta seja qualificada e tenha o conhecimento necessário para fornecer dados corretos."
      },
      {
        texto: "Ajuda a identificar se o prestador é público ou privado, influenciando o roteiro da pesquisa.",
        correta: false,
        feedback: "Incorreta. A identificação da natureza jurídica (público ou privado) e da esfera administrativa do prestador é realizada em outro bloco, o CZP (Caracterização do Prestador de Serviço), e não no RSP."
      }
    ]
  },
  {
    pergunta: "Ao iniciar o bloco CZP (Caracterização do Prestador de Serviço) no questionário da PNSB 2024 sobre Limpeza Urbana e Manejo de Resíduos Sólidos (MRS), qual é a primeira pergunta decisiva e o que acontece se a resposta for negativa?",
    alternativas: [
      {
        texto: "Pergunta se o prestador é público ou privado; se for privado, o questionário é encerrado para ele.",
        correta: false,
        feedback: "Incorreta. A PNSB entrevista tanto entidades públicas quanto privadas que prestam serviços de MRS. A natureza jurídica é identificada posteriormente, mas não é um filtro para encerramento para prestadores privados."
      },
      {
        texto: "Pergunta se o prestador executou algum serviço de MRS em 2024; se não, o questionário é encerrado para aquele informante.",
        correta: true,
        feedback: "Correta. A primeira pergunta do bloco CZP funciona como um filtro fundamental: ela verifica se o prestador de fato executou algum serviço de MRS (seja diretamente ou por contratação) no ano de referência. Se a resposta for 'não', o questionário é imediatamente interrompido para aquele informante, otimizando o tempo da pesquisa e focando nos prestadores ativos."
      },
      {
        texto: "Pergunta se o prestador atua em mais de um município; se atua apenas em um, a pesquisa se concentra apenas nos serviços diretos.",
        correta: false,
        feedback: "Incorreta. A questão da área de atuação (se os serviços cobrem outros municípios além do pesquisado) é abordada no bloco CZP, mas vem depois da identificação dos serviços executados e não é um filtro para encerramento ou para limitar a pesquisa apenas a serviços diretos."
      },
      {
        texto: "Pergunta se o prestador possui todas as licenças ambientais; se não, ele é encaminhado para o módulo de Drenagem Pluvial.",
        correta: false,
        feedback: "Incorreta. A posse de licenças ambientais não é um filtro inicial para encerramento do questionário. Além disso, a referência ao módulo de Drenagem Pluvial está ligada à execução de serviços específicos de limpeza de estruturas de drenagem, e não à falta de licenças."
      }
    ]
  },
  {
    pergunta: "Um prestador de serviço de MRS realiza a coleta seletiva diretamente, mas terceiriza a triagem e o processamento dos recicláveis. Como ele deve registrar a coleta seletiva na pergunta sobre serviços executados 'diretamente' no questionário da PNSB 2024?",
    alternativas: [
      {
        texto: "Não deve marcar a coleta seletiva como direta, pois a cadeia completa não é realizada internamente.",
        correta: false,
        feedback: "Incorreta. A interpretação de 'diretamente' no questionário da PNSB é mais abrangente. Não é necessário que toda a cadeia de um serviço seja executada internamente para ser considerada direta."
      },
      {
        texto: "Deve marcar a coleta seletiva como direta, pois executa pelo menos uma etapa do serviço.",
        correta: true,
        feedback: "Correta. O material do Módulo 2 esclarece que, mesmo que o prestador terceirize parte do serviço, se ele executa alguma etapa diretamente, ele deve marcar o serviço como direto. No exemplo, a coleta seletiva é feita diretamente, qualificando-o como serviço direto."
      },
      {
        texto: "Deve marcar a coleta seletiva como parcialmente direta e especificar a parte terceirizada.",
        correta: false,
        feedback: "Incorreta. O questionário da PNSB não oferece a opção de marcar serviços como 'parcialmente diretos'. A classificação para cada serviço é binária: o prestador o executa diretamente ou não."
      },
      {
        texto: "Deve indicar a coleta seletiva como indireta, pois o destino final (triagem e processamento) é feito por terceiros.",
        correta: false,
        feedback: "Incorreta. A distinção entre serviço direto e indireto no Módulo 2 foca na execução da etapa pelo prestador, e não na responsabilidade sobre todo o ciclo ou destino final."
      }
    ]
  }
];

// Adicionar as novas questões
avaliacaoAtual.questoes = avaliacaoAtual.questoes.concat(novasQuestoes);

// Salvar o arquivo atualizado
const conteudoJS = `window.avaliacaoFinal = ${JSON.stringify(avaliacaoAtual, null, 2)};`;
fs.writeFileSync(arquivoAtual, conteudoJS, 'utf8');

console.log(`✅ Adicionadas ${novasQuestoes.length} novas questões!`);
console.log(`📊 Total de questões agora: ${avaliacaoAtual.questoes.length}`);
console.log(`📁 Arquivo atualizado: ${arquivoAtual}`); 