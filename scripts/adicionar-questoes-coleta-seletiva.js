const fs = require('fs');
const path = require('path');

// Ler o arquivo atual
const arquivoAtual = path.join(__dirname, '../public/data/browser/questoes-otimizadas/avaliacaoFinal.js');
const conteudoAtual = fs.readFileSync(arquivoAtual, 'utf8');

// Extrair as questões existentes
const match = conteudoAtual.match(/window\.avaliacaoFinal = ({[\s\S]*});/);
const avaliacaoAtual = JSON.parse(match[1]);

// Novas questões sobre coleta seletiva
const novasQuestoes = [
  {
    pergunta: "No contexto da coleta seletiva, o módulo 4 da PNSB 2024 destaca a importância da Resolução CONAMA 275 de 2001. De acordo com essa resolução, qual é a cor padronizada para o descarte de materiais plásticos?",
    alternativas: [
      {
        texto: "Azul.",
        correta: false,
        feedback: "Azul é a cor padronizada para papel, incluindo papelão, não plástico."
      },
      {
        texto: "Verde.",
        correta: false,
        feedback: "Verde é a cor padronizada para vidro, não plástico."
      },
      {
        texto: "Vermelho.",
        correta: true,
        feedback: "Correto. A fonte especifica que a Resolução CONAMA 275 de 2001 estabeleceu o código de cores: 'Azul para papelão, verde para vidro, vermelho para plástico, amarelo para metal, marrom pros orgânicos.'"
      },
      {
        texto: "Amarelo.",
        correta: false,
        feedback: "Amarelo é a cor padronizada para metal, não plástico."
      }
    ]
  },
  {
    pergunta: "O serviço de coleta seletiva, abordado no módulo 4 da PNSB 2024, envolve várias etapas. Qual das alternativas abaixo não representa uma atividade que a pesquisa busca identificar como realizada pelo prestador de serviço de coleta seletiva em si?",
    alternativas: [
      {
        texto: "Coleta porta a porta dos materiais recicláveis.",
        correta: false,
        feedback: "A coleta porta a porta é uma forma direta de coleta seletiva investigada pela pesquisa."
      },
      {
        texto: "Recebimento de material que vem de terceiros (e.g., ecopontos).",
        correta: false,
        feedback: "O recebimento de material de terceiros, como em ecopontos, é uma atividade importante da coleta seletiva."
      },
      {
        texto: "Incineração de rejeitos para geração de energia.",
        correta: true,
        feedback: "Correto. A incineração de rejeitos, embora seja uma forma de destinação final (e que pode gerar energia), não é uma atividade do serviço de coleta seletiva em si, que foca na recuperação de valor. A pesquisa mapeia a destinação final dos rejeitos da coleta seletiva, mas a incineração do rejeito é um processo de disposição final, não uma etapa intrínseca da 'coleta seletiva' para aproveitamento de materiais."
      },
      {
        texto: "Processamento dos materiais (e.g., triagem, prensagem).",
        correta: false,
        feedback: "O processamento, incluindo triagem e prensagem, é uma etapa fundamental da coleta seletiva para agregar valor aos materiais."
      }
    ]
  },
  {
    pergunta: "Após a coleta ou recebimento, os materiais da coleta seletiva podem passar por diversos tipos de processamento. De acordo com o módulo 4 da PNSB 2024, qual das seguintes atividades não é listada como um tipo de processamento investigado pela pesquisa para esses materiais?",
    alternativas: [
      {
        texto: "Triagem manual ou mecânica.",
        correta: false,
        feedback: "A pesquisa investiga se a triagem foi 'manual ou mecânica'."
      },
      {
        texto: "Envasamento asséptico.",
        correta: true,
        feedback: "Correto. 'Envasamento asséptico' (aseptic packaging) não é uma atividade de processamento de materiais recicláveis listada na fonte. Trata-se de um processo de embalagem de produtos, não de tratamento de resíduos para reciclagem."
      },
      {
        texto: "Prensagem ou enfardamento.",
        correta: false,
        feedback: "A 'prensagem, enfardamento' são listadas como tipos de processamento para diminuir o volume dos materiais."
      },
      {
        texto: "Moagem, granulação ou extrusão.",
        correta: false,
        feedback: "'Moagem, granulação, extrusão' são exemplos de processos que agregam valor ao material reciclado, transformando-o para uso futuro."
      }
    ]
  },
  {
    pergunta: "Mesmo após a coleta e processamento seletivo, uma parte dos materiais pode ser classificada como rejeito, ou seja, não pode ser reciclada ou reaproveitada. De acordo com a PNSB 2024, qual é o destino correto e ambientalmente adequado para esses rejeitos da coleta seletiva?",
    alternativas: [
      {
        texto: "Descarte em qualquer tipo de aterro controlado, pois já passaram por triagem.",
        correta: false,
        feedback: "Aterros controlados, apesar de alguma melhoria superficial (como cobertura com terra), ainda são considerados inadequados pela lei, pois não possuem toda a engenharia e proteção ambiental de um aterro sanitário."
      },
      {
        texto: "Venda para cooperativas de catadores para triagem adicional.",
        correta: false,
        feedback: "A venda para cooperativas é o destino para materiais recicláveis que ainda podem ser aproveitados, não para rejeitos que não têm mais serventia."
      },
      {
        texto: "Disposição em aterro sanitário.",
        correta: true,
        feedback: "Correto. A fonte afirma que para o rejeito, o questionário investiga se ele 'vai para um aterro sanitário direitinho ou, infelizmente, para um lixão.' O aterro sanitário é considerado a forma ambientalmente adequada e segura para a disposição final do que não pode ser aproveitado."
      },
      {
        texto: "Queima a céu aberto para redução de volume.",
        correta: false,
        feedback: "A queima a céu aberto (característica dos lixões) é uma prática totalmente inadequada e perigosa para o meio ambiente e a saúde pública, gerando poluição e riscos."
      }
    ]
  },
  {
    pergunta: "O módulo 4 da PNSB 2024, ao detalhar o manejo de resíduos em áreas especiais e a coleta seletiva, visa a um objetivo maior na pesquisa. Qual é o principal propósito de coletar informações tão minuciosas sobre esses cenários diversos e as práticas envolvidas?",
    alternativas: [
      {
        texto: "Estabelecer uma lista de multas para municípios que não cumprem as normas de saneamento.",
        correta: false,
        feedback: "A PNSB coleta dados para formular e avaliar políticas públicas, não para aplicar multas diretamente."
      },
      {
        texto: "Gerar um retrato fiel da realidade do saneamento e da gestão de resíduos no Brasil, com todas as suas complexidades.",
        correta: true,
        feedback: "Correto. A fonte enfatiza que 'dominar esses detalhes... é o que vai permitir coletar dados ricos, dados comparáveis no Brasil todo. É isso que vai dar força pra PNSB.' E reforça: 'No fundo, o que esse módulo nos dá é a ferramenta para como o país lida com lixo em cenários muito, muito diversos das grandes cidades à comunidades mais isoladas.' O objetivo é um retrato fiel e a compreensão da complexidade para subsidiar políticas públicas."
      },
      {
        texto: "Criar um ranking de desempenho para que os municípios compitam por recursos federais.",
        correta: false,
        feedback: "Embora os dados possam ser usados para análises que influenciam a alocação de recursos, o principal propósito não é criar um ranking de competição, mas sim diagnosticar a situação e planejar melhorias."
      },
      {
        texto: "Fornecer dados exclusivamente para empresas privadas que desejam investir em logística de resíduos.",
        correta: false,
        feedback: "Os dados são vitais para formular e avaliar políticas públicas de saneamento e gestão ambiental no Brasil todo, e não se destinam 'exclusivamente' a empresas privadas, embora estas possam utilizá-los para seus próprios fins."
      }
    ]
  }
];

// Adicionar as novas questões
avaliacaoAtual.questoes = avaliacaoAtual.questoes.concat(novasQuestoes);

// Salvar o arquivo atualizado
const conteudoJS = `window.avaliacaoFinal = ${JSON.stringify(avaliacaoAtual, null, 2)};`;
fs.writeFileSync(arquivoAtual, conteudoJS, 'utf8');

console.log(`✅ Adicionadas ${novasQuestoes.length} questões sobre coleta seletiva!`);
console.log(`📊 Total de questões agora: ${avaliacaoAtual.questoes.length}`);
console.log(`📁 Arquivo atualizado: ${arquivoAtual}`); 