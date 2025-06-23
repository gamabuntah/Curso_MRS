const fs = require('fs');
const path = require('path');

// Ler o arquivo atual
const arquivoAtual = path.join(__dirname, '../public/data/browser/questoes-otimizadas/avaliacaoFinal.js');
const conteudoAtual = fs.readFileSync(arquivoAtual, 'utf8');

// Extrair as questões existentes
const match = conteudoAtual.match(/window\.avaliacaoFinal = ({[\s\S]*});/);
const avaliacaoAtual = JSON.parse(match[1]);

// Novas questões sobre unidades de destinação final
const novasQuestoes = [
  {
    pergunta: "O Módulo 6 da PNSB 2024 inicia sua abordagem enfatizando uma distinção crucial para o correto preenchimento do questionário sobre unidades de resíduos. Qual é essa distinção fundamental?",
    alternativas: [
      {
        texto: "Diferenciar entre unidades públicas e privadas.",
        correta: false,
        feedback: "Embora a natureza jurídica seja importante, não é a distinção fundamental mencionada no início do módulo."
      },
      {
        texto: "Separar unidades de tratamento das unidades de destinação final.",
        correta: true,
        feedback: "Correto. O módulo enfatiza a distinção crucial entre unidades de tratamento (que processam os resíduos) e unidades de destinação final (onde os resíduos são dispostos definitivamente)."
      },
      {
        texto: "Distinguir entre unidades urbanas e rurais.",
        correta: false,
        feedback: "A localização urbana ou rural não é a distinção fundamental mencionada no módulo."
      },
      {
        texto: "Diferenciar entre unidades próprias e terceirizadas.",
        correta: false,
        feedback: "Embora a gestão própria ou terceirizada seja relevante, não é a distinção fundamental mencionada no início do módulo."
      }
    ]
  },
  {
    pergunta: "Ao descrever os vasadouros (lixões), o Módulo 6 da PNSB 2024 destaca que eles representam o 'cenário mais precário' de disposição de resíduos. Qual das seguintes características não é verificada nos vasadouros?",
    alternativas: [
      {
        texto: "Ausência de controle ambiental e presença de catadores.",
        correta: false,
        feedback: "Esta é uma característica real dos vasadouros, que não possuem controle ambiental adequado."
      },
      {
        texto: "Queima a céu aberto e contaminação do solo e água.",
        correta: false,
        feedback: "Esta também é uma característica real dos vasadouros, que causam contaminação ambiental."
      },
      {
        texto: "Sistema de impermeabilização da base e tratamento de chorume.",
        correta: true,
        feedback: "Correto. Os vasadouros não possuem sistema de impermeabilização da base nem tratamento de chorume, que são características de aterros sanitários adequados."
      },
      {
        texto: "Presença de vetores e riscos à saúde pública.",
        correta: false,
        feedback: "Esta é uma característica real dos vasadouros, que apresentam riscos à saúde pública."
      }
    ]
  },
  {
    pergunta: "As unidades de incineração são uma das formas de tratamento de resíduos mencionadas no Módulo 6. Qual é o principal propósito da incineração, segundo o material da PNSB 2024, e quais aspectos são investigados?",
    alternativas: [
      {
        texto: "Apenas reduzir o volume dos resíduos para facilitar o transporte.",
        correta: false,
        feedback: "A redução de volume é um benefício, mas não o principal propósito da incineração."
      },
      {
        texto: "Destruir agentes patogênicos e reduzir volume, sendo investigados o tipo de resíduo tratado e a geração de energia.",
        correta: true,
        feedback: "Correto. A incineração tem como principais propósitos destruir agentes patogênicos e reduzir o volume dos resíduos. A pesquisa investiga o tipo de resíduo tratado e se há geração de energia no processo."
      },
      {
        texto: "Exclusivamente gerar energia elétrica a partir dos resíduos.",
        correta: false,
        feedback: "A geração de energia é um benefício, mas não o único propósito da incineração."
      },
      {
        texto: "Transformar resíduos em fertilizantes para agricultura.",
        correta: false,
        feedback: "A transformação em fertilizantes é característica da compostagem, não da incineração."
      }
    ]
  },
  {
    pergunta: "Para as unidades de compostagem, o Módulo 6 destaca a importância de certos procedimentos e infraestrutura. Qual das opções a seguir é uma prática essencial ou esperada para garantir a qualidade do processo de compostagem?",
    alternativas: [
      {
        texto: "Apenas a separação dos resíduos orgânicos na fonte.",
        correta: false,
        feedback: "A separação na fonte é importante, mas não é a única prática essencial para a qualidade da compostagem."
      },
      {
        texto: "Controle de temperatura, umidade e revolvimento dos materiais durante o processo.",
        correta: true,
        feedback: "Correto. Para garantir a qualidade da compostagem, é essencial o controle de temperatura, umidade e o revolvimento dos materiais durante o processo de decomposição."
      },
      {
        texto: "Apenas o uso de aditivos químicos para acelerar o processo.",
        correta: false,
        feedback: "O uso de aditivos químicos não é uma prática essencial para a compostagem adequada."
      },
      {
        texto: "Exclusivamente a disposição final em aterro sanitário.",
        correta: false,
        feedback: "A disposição em aterro não é uma prática da compostagem, que visa transformar resíduos orgânicos em adubo."
      }
    ]
  },
  {
    pergunta: "O Módulo 6 descreve o aterro controlado como um 'meio termo' entre o lixão e o aterro sanitário. Qual característica distingue o aterro controlado do lixão, mas o mantém na categoria de disposição inadequada?",
    alternativas: [
      {
        texto: "A presença de catadores trabalhando na unidade.",
        correta: false,
        feedback: "A presença de catadores pode ocorrer em ambos, mas não é a característica que distingue o aterro controlado do lixão."
      },
      {
        texto: "A realização de cobertura ocasional com terra, mas sem impermeabilização da base.",
        correta: true,
        feedback: "Correto. O aterro controlado recebe cobertura ocasional com terra (melhoria em relação ao lixão), mas não possui impermeabilização da base, mantendo-o na categoria de disposição inadequada."
      },
      {
        texto: "A distância da área urbana do município.",
        correta: false,
        feedback: "A distância da área urbana não é a característica que distingue o aterro controlado do lixão."
      },
      {
        texto: "O volume de resíduos recebidos diariamente.",
        correta: false,
        feedback: "O volume de resíduos não é a característica que distingue o aterro controlado do lixão."
      }
    ]
  }
];

// Adicionar as novas questões
avaliacaoAtual.questoes = avaliacaoAtual.questoes.concat(novasQuestoes);

// Salvar o arquivo atualizado
const conteudoJS = `window.avaliacaoFinal = ${JSON.stringify(avaliacaoAtual, null, 2)};`;
fs.writeFileSync(arquivoAtual, conteudoJS, 'utf8');

console.log(`✅ Adicionadas ${novasQuestoes.length} questões sobre unidades de destinação final!`);
console.log(`📊 Total de questões agora: ${avaliacaoAtual.questoes.length}`);
console.log(`📁 Arquivo atualizado: ${arquivoAtual}`); 