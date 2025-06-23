const fs = require('fs');
const path = require('path');

// Questões principais da avaliação final baseadas no arquivo fonte
const questoesPrincipais = [
  {
    pergunta: "De acordo com a Lei 11.445 de 2007, qual é o conceito amplo de saneamento básico no Brasil e quais são seus quatro eixos principais?",
    alternativas: [
      {
        texto: "Abrange apenas o abastecimento de água potável e o esgotamento sanitário, sendo serviços independentes um do outro.",
        correta: false,
        feedback: "Incorreto. A Lei 11.445 de 2007 traz um conceito mais amplo, que vai além de apenas água e esgoto, e enfatiza que os eixos são interligados, não independentes."
      },
      {
        texto: "Compreende o abastecimento de água potável, esgotamento sanitário, limpeza urbana e manejo de resíduos sólidos, e drenagem e manejo das águas pluviais urbanas, vistos como um sistema interligado.",
        correta: true,
        feedback: "Correto. A Lei 11.445 de 2007 define o saneamento básico de forma ampla, incluindo esses quatro eixos principais que são considerados um sistema interligado, onde a falha de um afeta os outros."
      },
      {
        texto: "Foca na saúde pública e meio ambiente, incluindo abastecimento de água, esgotamento sanitário e manejo de resíduos sólidos, mas a drenagem pluvial não faz parte da definição legal.",
        correta: false,
        feedback: "Incorreto. A drenagem e manejo das águas pluviais urbanas é explicitamente um dos quatro eixos definidos pela lei como parte integrante do saneamento básico."
      },
      {
        texto: "Refere-se a um conjunto de serviços que podem ser gerenciados de forma isolada, sendo eles: água potável, esgoto, tratamento de lixo e controle de enchentes.",
        correta: false,
        feedback: "Incorreto. O conceito legal do saneamento básico enfatiza que os quatro eixos são vistos como um sistema interligado, onde a falha de um afeta os outros. A gestão isolada não reflete o espírito da lei."
      }
    ]
  },
  {
    pergunta: "Qual é o foco principal da Pesquisa Nacional de Saneamento Básico (PNSB) de 2024, conforme o módulo introdutório do material de capacitação do IBGE?",
    alternativas: [
      {
        texto: "Abastecimento de água potável e esgotamento sanitário, dando continuidade ao foco da edição de 2017.",
        correta: false,
        feedback: "Incorreto. O foco em água e esgoto foi da PNSB de 2017. O ciclo atual da pesquisa (2023-2025), que inclui a PNSB 2024, tem um foco diferente."
      },
      {
        texto: "Apenas o mapeamento das áreas de risco de enchente e sistemas de controle de cheias, devido à crescente preocupação com desastres naturais.",
        correta: false,
        feedback: "Incorreto. Embora a drenagem pluvial seja um dos focos da PNSB 2024, ela não é o único. A pesquisa também aborda a limpeza urbana e o manejo de resíduos sólidos."
      },
      {
        texto: "Limpeza urbana, manejo de resíduos sólidos e drenagem e manejo das águas pluviais urbanas.",
        correta: true,
        feedback: "Correto. O foco da PNSB 2024 é explicitamente a limpeza urbana, o manejo de resíduos sólidos e a drenagem pluvial. Esses são os assuntos essenciais abordados no módulo."
      },
      {
        texto: "A experiência dos domicílios em relação ao acesso à água e coleta de lixo, complementando dados do Censo Demográfico e PNAD Contínua.",
        correta: false,
        feedback: "Incorreto. A PNSB de 2024 olha para a oferta dos serviços, focando nas entidades prestadoras. As pesquisas que olham para a demanda nos domicílios são o Censo Demográfico e a PNAD Contínua."
      }
    ]
  },
  {
    pergunta: "A Pesquisa Nacional de Saneamento Básico (PNSB) 2024 tem um alvo específico para a coleta de dados. Quem são as entidades entrevistadas por esta pesquisa?",
    alternativas: [
      {
        texto: "Exclusivamente as prefeituras municipais, por serem as principais responsáveis pela gestão do saneamento.",
        correta: false,
        feedback: "Incorreto. O alvo da PNSB 2024 são as entidades públicas ou privadas que prestam algum serviço de limpeza urbana, manejo de resíduos ou drenagem pluvial, não se limitando apenas às prefeituras."
      },
      {
        texto: "As empresas privadas que atuam em aterros sanitários e usinas de reciclagem em todo o país.",
        correta: false,
        feedback: "Incorreto. Embora empresas privadas que operam aterros e reciclagem sejam incluídas, a PNSB 2024 foca em qualquer entidade, pública ou privada, que preste qualquer tipo de serviço dentro das áreas de limpeza urbana, resíduos sólidos ou drenagem pluvial."
      },
      {
        texto: "Entidades públicas ou privadas que executam ou contratam a prestação de algum serviço de limpeza urbana, manejo de resíduos ou drenagem pluvial.",
        correta: true,
        feedback: "Correto. O alvo da PNSB 2024 são as entidades públicas ou privadas que, em 2024, executam ou contratam a prestação de qualquer serviço de limpeza urbana, manejo de resíduos ou drenagem pluvial, com o objetivo de cobrir todas as etapas desses serviços."
      },
      {
        texto: "Cooperativas de catadores e associações de moradores, para entender a percepção da comunidade sobre os serviços.",
        correta: false,
        feedback: "Incorreto. A PNSB 2024 foca nos prestadores de serviço (oferta), não na percepção dos usuários ou na organização interna de grupos específicos. A pesquisa de percepção estaria mais ligada às pesquisas de demanda."
      }
    ]
  },
  {
    pergunta: "No Brasil, a medição da situação do saneamento básico é realizada por diferentes frentes. Quais são as principais abordagens e quais instrumentos de pesquisa estão associados a elas?",
    alternativas: [
      {
        texto: "Apenas a Pesquisa Nacional de Saneamento Básico (PNSB), que coleta dados de acesso nos domicílios e informações sobre empresas prestadoras.",
        correta: false,
        feedback: "Incorreto. A PNSB foca na oferta de serviços (empresas/prefeituras). A medição de acesso nos domicílios (demanda) é feita por outras pesquisas do IBGE."
      },
      {
        texto: "Duas frentes: uma que olha para a demanda (acesso e uso pelos domicílios) através do Censo Demográfico e PNAD Contínua, e outra que olha para a oferta (quem presta os serviços) com o SNIS e a PNSB.",
        correta: true,
        feedback: "Correto. A medição no Brasil se divide em duas frentes: a de demanda, que coleta dados de acesso e uso nos domicílios por meio do Censo Demográfico e da PNAD Contínua, e a de oferta, que investiga quem presta os serviços, como o SNIS e a PNSB."
      },
      {
        texto: "Principalmente o Sistema Nacional de Informações sobre Saneamento (SNIS), que é a única fonte oficial para dados de saneamento no país.",
        correta: false,
        feedback: "Incorreto. Embora o SNIS seja um sistema importante ligado ao Ministério das Cidades, a PNSB do IBGE também é uma fonte principal para dados de oferta. Além disso, as pesquisas de demanda do IBGE são cruciais para um panorama completo."
      },
      {
        texto: "Pesquisas de campo realizadas por ONGs e o IBGE, que em conjunto avaliam a qualidade dos serviços e a satisfação do usuário.",
        correta: false,
        feedback: "Incorreto. As fontes primárias mencionadas são o Censo, PNAD Contínua, SNIS e PNSB, todas ligadas a instituições governamentais (IBGE, Ministério das Cidades). O foco é mais na medição da situação e oferta, não primariamente na satisfação do usuário ou no papel de ONGs."
      }
    ]
  },
  {
    pergunta: "A Lei 11.445 de 2007 enfatiza que os quatro eixos do saneamento básico devem ser vistos como um sistema interligado. Qual a importância fundamental dessa interligação?",
    alternativas: [
      {
        texto: "Permite que cada serviço seja gerenciado por uma entidade diferente, otimizando a especialização e a eficiência isolada.",
        correta: false,
        feedback: "Incorreto. Embora a gestão possa ser descentralizada, a lei enfatiza a interligação do sistema como um todo. A especialização isolada sem coordenação pode levar a falhas sistêmicas."
      },
      {
        texto: "Facilita a coleta de dados de forma independente, pois cada eixo possui seus próprios indicadores de desempenho.",
        correta: false,
        feedback: "Incorreto. A interligação é sobre a funcionalidade e o impacto do sistema. A coleta de dados é uma consequência da necessidade de avaliar esse sistema integrado. A falha em um eixo afeta os outros, exigindo uma visão integrada."
      },
      {
        texto: "Garante que a falha em um dos eixos não afete os demais, desde que os outros estejam funcionando perfeitamente.",
        correta: false,
        feedback: "Incorreto. A importância fundamental da interligação é justamente o oposto: se um eixo falha, ele afeta os outros. Por exemplo, 'não adianta ter água limpa se o esgoto contamina tudo ou se a cidade inunda porque a drenagem não funciona'."
      },
      {
        texto: "Assegura que a falha em um dos serviços compromete todo o sistema de saneamento, impactando a saúde pública, o meio ambiente e a qualidade de vida.",
        correta: true,
        feedback: "Correto. A interligação é fundamental porque a falha em um componente (como o esgoto contaminando a água ou a drenagem ineficiente causando inundações) afeta os demais e compromete o saneamento como um todo, com implicações diretas para a saúde pública, o meio ambiente e a qualidade de vida."
      }
    ]
  }
];

// Criar o objeto final
const avaliacaoFinal = {
  title: "Avaliação Final - Curso de Manejo de Resíduos Sólidos (MRS)",
  questoes: questoesPrincipais
};

// Salvar no arquivo de destino
const arquivoDestino = path.join(__dirname, '../public/data/browser/questoes-otimizadas/avaliacaoFinal.js');
const conteudoJS = `window.avaliacaoFinal = ${JSON.stringify(avaliacaoFinal, null, 2)};`;

fs.writeFileSync(arquivoDestino, conteudoJS, 'utf8');

console.log(`✅ Conversão manual concluída! ${questoesPrincipais.length} questões principais convertidas.`);
console.log(`📁 Arquivo salvo em: ${arquivoDestino}`);
console.log(`📊 Total de questões: ${questoesPrincipais.length}`); 