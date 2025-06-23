const fs = require('fs');
const path = require('path');

// Ler o arquivo atual
const arquivoAtual = path.join(__dirname, '../public/data/browser/questoes-otimizadas/avaliacaoFinal.js');
const conteudoAtual = fs.readFileSync(arquivoAtual, 'utf8');

// Extrair as questões existentes
const match = conteudoAtual.match(/window\.avaliacaoFinal = ({[\s\S]*});/);
const avaliacaoAtual = JSON.parse(match[1]);

// Novas questões finais
const novasQuestoes = [
  {
    pergunta: "O aterro sanitário é considerado a forma ambientalmente mais adequada e segura de dispor o rejeito, sendo uma obra de engenharia com controle técnico-operacional. Qual das seguintes combinações representa características essenciais de um aterro sanitário?",
    alternativas: [
      {
        texto: "Impermeabilização da base, sistema de drenagem de chorume e cobertura diária com terra.",
        correta: false,
        feedback: "Embora essas sejam características importantes, a cobertura diária com terra não é uma característica essencial de todos os aterros sanitários."
      },
      {
        texto: "Impermeabilização da base, sistema de drenagem de chorume e tratamento de gases.",
        correta: true,
        feedback: "Correto. Um aterro sanitário deve possuir impermeabilização da base para proteger o solo e a água, sistema de drenagem de chorume para coletar e tratar o líquido percolado, e tratamento de gases para capturar e tratar o biogás gerado."
      },
      {
        texto: "Apenas cobertura com terra e presença de catadores.",
        correta: false,
        feedback: "Essas características são mais comuns em aterros controlados ou lixões, não em aterros sanitários adequados."
      },
      {
        texto: "Sistema de incineração e tratamento térmico dos resíduos.",
        correta: false,
        feedback: "A incineração é um processo de tratamento, não uma característica de aterro sanitário."
      }
    ]
  },
  {
    pergunta: "O Módulo 6 enfatiza que o levantamento detalhado das características das unidades de destinação e disposição final é um trabalho minucioso e essencial. Qual é o principal benefício esperado dessa coleta detalhada de informações?",
    alternativas: [
      {
        texto: "Apenas identificar quais municípios possuem aterros sanitários adequados.",
        correta: false,
        feedback: "Embora essa identificação seja importante, não é o principal benefício mencionado no módulo."
      },
      {
        texto: "Fornecer subsídios para o planejamento e a formulação de políticas públicas de gestão de resíduos em nível nacional.",
        correta: true,
        feedback: "Correto. O levantamento detalhado das características das unidades de destinação final fornece subsídios fundamentais para o planejamento e a formulação de políticas públicas de gestão de resíduos em nível nacional."
      },
      {
        texto: "Exclusivamente calcular custos operacionais das unidades.",
        correta: false,
        feedback: "O cálculo de custos é um aspecto, mas não o principal benefício mencionado no módulo."
      },
      {
        texto: "Apenas verificar o cumprimento de licenças ambientais.",
        correta: false,
        feedback: "A verificação de licenças é importante, mas não é o principal benefício mencionado no módulo."
      }
    ]
  },
  {
    pergunta: "Segundo o Módulo 7 da PNSB 2024, qual é o tipo de vínculo que as entidades de catadores podem ter com o município, considerado um ponto central para a pesquisa, que revela a estabilidade e a formalização da relação?",
    alternativas: [
      {
        texto: "Apenas vínculos informais baseados em acordos verbais.",
        correta: false,
        feedback: "Os vínculos informais não são considerados o ponto central da pesquisa, que foca na formalização."
      },
      {
        texto: "Vínculos formais através de contratos, convênios ou termos de parceria.",
        correta: true,
        feedback: "Correto. O módulo enfatiza que o vínculo formal através de contratos, convênios ou termos de parceria é um ponto central da pesquisa, pois revela a estabilidade e a formalização da relação entre as entidades de catadores e o município."
      },
      {
        texto: "Exclusivamente vínculos de prestação de serviços sem remuneração.",
        correta: false,
        feedback: "A prestação sem remuneração não é o foco principal da pesquisa sobre vínculos formais."
      },
      {
        texto: "Apenas vínculos temporários para eventos específicos.",
        correta: false,
        feedback: "Os vínculos temporários não são o ponto central da pesquisa, que foca na estabilidade e formalização."
      }
    ]
  },
  {
    pergunta: "Além do vínculo formal, a pesquisa também investiga como é feita a remuneração das entidades de catadores quando existe um vínculo formal. Qual das seguintes opções é uma forma de pagamento investigada pela PNSB?",
    alternativas: [
      {
        texto: "Apenas pagamento em dinheiro por quilo de material coletado.",
        correta: false,
        feedback: "Embora o pagamento por quilo seja uma forma, não é a única investigada pela pesquisa."
      },
      {
        texto: "Pagamento por quilo de material, pagamento por prestação de serviço ou pagamento por produção.",
        correta: true,
        feedback: "Correto. A PNSB investiga diferentes formas de remuneração: pagamento por quilo de material coletado, pagamento por prestação de serviço (valor fixo) ou pagamento por produção (baseado na quantidade processada)."
      },
      {
        texto: "Exclusivamente pagamento em benefícios sociais (cesta básica, vale-transporte).",
        correta: false,
        feedback: "Os benefícios sociais podem fazer parte da remuneração, mas não são a única forma investigada."
      },
      {
        texto: "Apenas pagamento por hora trabalhada, sem considerar a produção.",
        correta: false,
        feedback: "O pagamento por hora é uma forma, mas não a única investigada pela pesquisa."
      }
    ]
  },
  {
    pergunta: "No Módulo 7, a sessão de Educação Ambiental (EDU) tem um foco específico para a PNSB. Qual é o principal ângulo de investigação dessa sessão?",
    alternativas: [
      {
        texto: "A percepção da população sobre a qualidade dos serviços de limpeza urbana.",
        correta: false,
        feedback: "A percepção da população é mais adequada para pesquisas de demanda, não para a PNSB que foca na oferta."
      },
      {
        texto: "As ações de educação ambiental realizadas pelo prestador de serviço para conscientizar a população.",
        correta: true,
        feedback: "Correto. A sessão EDU investiga as ações de educação ambiental realizadas pelo prestador de serviço para conscientizar a população sobre temas como coleta seletiva, redução de resíduos e destinação adequada."
      },
      {
        texto: "O nível de escolaridade dos funcionários que trabalham na limpeza urbana.",
        correta: false,
        feedback: "O nível de escolaridade dos funcionários não é o foco da sessão de educação ambiental."
      },
      {
        texto: "A quantidade de material educativo distribuído pela prefeitura.",
        correta: false,
        feedback: "Embora a distribuição de material seja uma ação de educação ambiental, não é o único foco da sessão."
      }
    ]
  }
];

// Adicionar as novas questões
avaliacaoAtual.questoes = avaliacaoAtual.questoes.concat(novasQuestoes);

// Salvar o arquivo atualizado
const conteudoJS = `window.avaliacaoFinal = ${JSON.stringify(avaliacaoAtual, null, 2)};`;
fs.writeFileSync(arquivoAtual, conteudoJS, 'utf8');

console.log(`✅ Adicionadas ${novasQuestoes.length} questões finais!`);
console.log(`📊 Total de questões agora: ${avaliacaoAtual.questoes.length}`);
console.log(`📁 Arquivo atualizado: ${arquivoAtual}`);
console.log(`🎉 Avaliação final completa com ${avaliacaoAtual.questoes.length} questões de alta qualidade!`); 