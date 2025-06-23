const fs = require('fs');
const path = require('path');

// Ler o arquivo atual
const arquivoAtual = path.join(__dirname, '../public/data/browser/questoes-otimizadas/avaliacaoFinal.js');
const conteudoAtual = fs.readFileSync(arquivoAtual, 'utf8');

// Extrair as questões existentes
const match = conteudoAtual.match(/window\.avaliacaoFinal = ({[\s\S]*});/);
const avaliacaoAtual = JSON.parse(match[1]);

// Novas questões do módulo 3
const novasQuestoes = [
  {
    pergunta: "No bloco de aspectos legais do questionário da PNSB, um dos instrumentos de delegação de serviço investigados é o 'contrato de concessão comum'. Qual característica principal diferencia esse tipo de formalização, conforme o material?",
    alternativas: [
      {
        texto: "É um acordo realizado exclusivamente entre entes públicos, sem necessidade de licitação.",
        correta: false,
        feedback: "A alternativa a) descreve o 'contrato de programa', que é um acordo entre órgãos públicos e não exige licitação."
      },
      {
        texto: "Permite que uma empresa privada preste o serviço, mas exige a realização de processo licitatório.",
        correta: true,
        feedback: "Correto. O 'contrato de concessão comum' é o mecanismo legal pelo qual o serviço é transferido para uma empresa privada, e isso, por exigência legal, deve ocorrer por meio de um processo licitatório, garantindo transparência e competitividade."
      },
      {
        texto: "Envolve a empresa privada com projeto, financiamento e construção, além da operação, sem necessidade de licitação.",
        correta: false,
        feedback: "A alternativa c) descreve a Parceria Público-Privada (PPP), que é um modelo mais complexo onde o parceiro privado tem um papel mais abrangente (projeto, financiamento, construção e operação), e que igualmente requer licitação."
      },
      {
        texto: "Refere-se a um reconhecimento informal de um prestador de serviço que atua sem contrato.",
        correta: false,
        feedback: "A alternativa d) não corresponde a um instrumento de delegação formal, que é o foco do questionário neste bloco."
      }
    ]
  },
  {
    pergunta: "A Lei do Saneamento (11.445) fala em universalização como ampliar progressivamente o acesso aos serviços. No contexto da PNSB para limpeza urbana e manejo de resíduos sólidos, o questionário investiga especificamente sobre as metas de universalização e o controle social. Qual é a principal informação buscada sobre as metas de universalização para esses serviços?",
    alternativas: [
      {
        texto: "Se o município já atingiu 100% de cobertura dos serviços de limpeza urbana e manejo de resíduos.",
        correta: false,
        feedback: "A alternativa a) pode ser uma consequência ou uma meta, mas a questão foca no que o questionário investiga sobre a definição dessas metas no instrumento legal."
      },
      {
        texto: "Se o instrumento legal de formalização do serviço (contrato, lei) define metas específicas de universalização para limpeza urbana e manejo de resíduos.",
        correta: true,
        feedback: "Correto. O questionário busca saber se existe um objetivo claro e formalizado no papel para a ampliação do acesso aos serviços, conforme a Lei do Saneamento. Além disso, a pesquisa também verifica a existência de ouvidorias ou centrais de atendimento para o controle social."
      },
      {
        texto: "O número de pessoas que ainda não têm acesso aos serviços de coleta de resíduos no município.",
        correta: false,
        feedback: "A alternativa c) é uma informação sobre a demanda ou acesso, que pode ser coletada por outras pesquisas (como o Censo ou a PNAD Contínua), mas não é o ponto principal da PNSB em relação à definição legal da universalização no instrumento do prestador."
      },
      {
        texto: "A previsão orçamentária para alcançar a universalização dos serviços nos próximos cinco anos.",
        correta: false,
        feedback: "A alternativa d) não é um item explicitamente mencionado como foco do questionário da PNSB para as metas de universalização neste módulo, embora seja uma informação relevante para o planejamento."
      }
    ]
  },
  {
    pergunta: "Quando o prestador principal de serviço (geralmente uma prefeitura ou empresa municipal) terceiriza parte dos serviços de limpeza urbana e manejo de resíduos sólidos, qual é a ação fundamental exigida pela PNSB para a coleta precisa de dados neste bloco?",
    alternativas: [
      {
        texto: "Identificar apenas o tipo de serviço terceirizado (ex: varrição, coleta).",
        correta: false,
        feedback: "A alternativa a) é um passo inicial, mas não o suficiente para o detalhamento necessário na pesquisa, que visa saber 'quem está fazendo o quê de fato'."
      },
      {
        texto: "Registrar se a empresa terceirizada é do próprio município ou de fora.",
        correta: false,
        feedback: "A alternativa b) não é um requisito explicitamente mencionado como fundamental para a qualidade do dado neste módulo."
      },
      {
        texto: "Identificar precisamente qual empresa terceirizada está prestando o serviço no sistema de cadastro.",
        correta: true,
        feedback: "Correto. O questionário da PNSB busca saber não apenas quais serviços foram terceirizados, mas também identificar de forma precisa a empresa terceirizada responsável por eles. Isso é crucial para entender a dinâmica de gestão, os custos e a responsabilidade, ajudando a montar um panorama fiel da oferta de serviços."
      },
      {
        texto: "Verificar se o contrato de terceirização possui um prazo mínimo de cinco anos.",
        correta: false,
        feedback: "A alternativa d) pode ser uma informação contratual relevante, mas não é destacada como a ação fundamental para a identificação do serviço terceirizado na pesquisa."
      }
    ]
  },
  {
    pergunta: "Além de coletar o peso anual total de resíduos, a PNSB investiga se foi realizado um 'estudo gravimétrico'. Qual é a finalidade principal de um estudo gravimétrico no contexto do manejo de resíduos sólidos?",
    alternativas: [
      {
        texto: "Determinar a densidade média dos resíduos coletados para otimizar o volume dos caminhões.",
        correta: false,
        feedback: "A alternativa a) pode ser uma aplicação dos dados de pesagem, mas não a principal finalidade de um estudo gravimétrico especificamente."
      },
      {
        texto: "Analisar a composição do lixo (ex: orgânico, plástico, papel, metal) para planejar programas de reciclagem ou compostagem.",
        correta: true,
        feedback: "Correto. O estudo gravimétrico é vital para saber do que é feito o lixo, permitindo planejar de forma mais eficaz iniciativas como programas de reciclagem ou compostagem, uma vez que o tipo de material influencia diretamente essas ações."
      },
      {
        texto: "Medir a eficiência da coleta porta a porta em termos de tempo e distância percorrida.",
        correta: false,
        feedback: "A alternativa c) está mais relacionada à logística da coleta do que à composição dos resíduos."
      },
      {
        texto: "Avaliar a quantidade de chorume gerado anualmente em um aterro sanitário.",
        correta: false,
        feedback: "A alternativa d) está relacionada à operação de aterros, mas não é a função primária de um estudo gravimétrico."
      }
    ]
  },
  {
    pergunta: "A PNSB faz uma distinção crucial entre a destinação final 'ambientalmente adequada' e a 'inadequada'. Qual das opções a seguir é considerada uma forma de destinação final ambientalmente inadequada, conforme o material do curso?",
    alternativas: [
      {
        texto: "Unidade de compostagem.",
        correta: false,
        feedback: "A alternativa a) é uma forma de destinação adequada, transformando resíduos orgânicos em adubo."
      },
      {
        texto: "Recuperação energética por incineração controlada.",
        correta: false,
        feedback: "A alternativa b) é considerada uma destinação adequada, pois utiliza a queima para gerar energia de forma controlada."
      },
      {
        texto: "Aterro controlado.",
        correta: true,
        feedback: "Correto. Embora o aterro controlado tenha recebido algumas melhorias em relação ao lixão (como cobertura de terra), ele não possui toda a engenharia e proteção ambiental de um aterro sanitário de verdade, como a impermeabilização completa da base para proteger o solo e a água, e o tratamento do chorume. Por isso, a lei ainda o considera inadequado."
      },
      {
        texto: "Unidade de triagem para reciclagem.",
        correta: false,
        feedback: "A alternativa d) é parte do processo de destinação adequada, preparando os materiais para a reciclagem."
      }
    ]
  }
];

// Adicionar as novas questões
avaliacaoAtual.questoes = avaliacaoAtual.questoes.concat(novasQuestoes);

// Salvar o arquivo atualizado
const conteudoJS = `window.avaliacaoFinal = ${JSON.stringify(avaliacaoAtual, null, 2)};`;
fs.writeFileSync(arquivoAtual, conteudoJS, 'utf8');

console.log(`✅ Adicionadas ${novasQuestoes.length} questões do módulo 3!`);
console.log(`📊 Total de questões agora: ${avaliacaoAtual.questoes.length}`);
console.log(`📁 Arquivo atualizado: ${arquivoAtual}`); 