# Prompt para Gemini – Módulo 8 PNSB

**Instruções para Gemini:**

Você é um especialista em saneamento e didática digital. Receberá abaixo o conteúdo integral do Módulo 8 do curso PNSB (em formato markdown). Sua tarefa é:

1. **Transformar todo o conteúdo em um objeto JavaScript** no formato abaixo, para uso direto em um sistema web (não pode faltar nada do texto original, nem resumos!):

```js
window.modulos_data = window.modulos_data || {};
Object.assign(window.modulos_data, {
  "8": {
    "title": "Módulo 8: Manejo de Águas Pluviais em Áreas Rurais (Bloco RUR) e Educação Ambiental (Bloco EDU)",
    "audio": "MAP/Audios/Curso MAP - Mod 8.mp3",
    "cards": [
      // Aqui entram os cards, veja instruções abaixo
    ]
  }
});
```

2. **Organize o conteúdo em cards didáticos**, SEM OMITIR NENHUM TRECHO do texto original. Cada card deve ter:
   - `"type"`: pode ser `"default"`, `"atencao"`, `"exemplo"`, `"duvidas"`, `"resumo"` (use conforme o conteúdo)
   - `"title"`: título do card (ex: "📖 Introdução", "⚠️ Atenção", "📝 Exemplo Prático", "📊 Resumo Visual", etc)
   - `"content"`: o texto do card (pode usar HTML básico para listas, tabelas, negrito, etc)

3. **Dicas para a estrutura:**
   - Cada parágrafo, lista, definição ou orientação importante do original deve ser um card ou subcard.
   - Use cards especiais para exemplos, dúvidas frequentes, resumos visuais e alertas de atenção.
   - Não resuma, não omita, não altere o sentido. O texto deve ser integral, apenas organizado didaticamente.
   - Se houver listas ou tabelas, use HTML básico no campo `"content"` para facilitar a visualização.
   - Mantenha a ordem lógica do original.

4. **No final, o resultado deve ser um único objeto JavaScript pronto para ser colado no arquivo `public/data/module8.js` do sistema.**

---

## Conteúdo original do Módulo 8

```
Módulo 8: Manejo de Águas Pluviais em Áreas Rurais (Bloco RUR) e Educação Ambiental (Bloco EDU)
Este módulo aborda as práticas e soluções de drenagem e manejo de águas pluviais especificamente em contextos rurais, bem como a importância e as ações de educação ambiental relacionadas ao saneamento básico e à gestão de águas pluviais [1, 2].

Resumo
Este documento detalha o Módulo 8 de um curso de capacitação para técnicos, focado no Manejo de Águas Pluviais em Áreas Rurais (Bloco RUR) e na Educação Ambiental (Bloco EDU). O Bloco RUR explora as soluções e serviços implementados para gerenciar águas da chuva em contextos rurais, abrangendo vias de acesso, cursos d'água e domicílios, com destaque para técnicas como barraginhas e diferentes tipos de pavimentação. O Bloco EDU, por sua vez, investiga as ações de educação ambiental realizadas para conscientizar sobre a importância da conservação e sustentabilidade, abordando temas como prevenção de desastres e renaturalização de rios, e descrevendo diversas formas de execução dessas iniciativas. O objetivo geral é fornecer uma estrutura abrangente para pesquisa e implementação de práticas sustentáveis de saneamento em áreas rurais.

--------------------------------------------------------------------------------
8.1. Bloco RUR - Manejo de Águas Pluviais em Áreas Rurais
Este bloco visa compreender as soluções e serviços implementados para o manejo das águas pluviais em áreas rurais, incluindo vias, cursos d'água e domicílios [1, 3].
•
**Serviços Realizados em Áreas Rurais (Quesito 1)**Verifica se o prestador realizou algum serviço nas ruas/estradas (pavimentadas ou não), ou em rios, córregos, igarapés presentes na(s) área(s) rural(is) do município pesquisado em 2024 [1, 3].
◦
Opções de resposta: Sim [1, 3], Não (encerra o bloco) [1, 3], Não se aplica (município não possui área rural - encerra o bloco) [1, 3].
•
**Serviços de Manejo nas Vias de Acesso (Quesito 2)**Avalia se houve serviços de manejo de águas pluviais, como canalização, instalação de barraginhas e outros, nas vias de acesso às áreas rurais, não considerando apenas o nivelamento por máquina (patrola) [2, 4].
◦
Vias de acesso: Todo o sistema viário, com ou sem pavimentação, que permite acessar as comunidades rurais, sistema viário externo às comunidades, estradas vicinais etc. [2, 4].
◦
Barraginhas: Pequenas bacias que capturam enxurradas e permitem que as chuvas infiltrem nos terrenos, conservando a água e o solo. É uma tecnologia social de baixo custo com benefícios ambientais, sociais e econômicos [2, 4, 5].
◦
Tipos de serviço (Quesito 2.1): * Adequação do abaulamento do leito da via: Técnica que deixa a parte central das vias mais elevada que as laterais, permitindo o escoamento da água da chuva, evitando a formação de poças e a erosão [2, 6]. * Canalização dos cursos d'água naturais [2, 6]. * Expansão do sistema de microdrenagem [2, 6]. * Implantação de estruturas de retenção / detenção / amortecimento próximas às vias (barraginhas, por exemplo) [2, 6, 7]. * Implantação de galerias pluviais [2, 7]. * Implantação e/ou manutenção do sistema de microdrenagem (sarjetas, bueiros etc.) [2, 7]. * Renaturalização / Restauração ou Recuperação / Revitalização de cursos d'água: Visam restaurar as funções ecológicas e hidrológicas dos cursos de água, transformando-os em rios vivos, com ecossistemas sadios, e melhorar a qualidade e funcionalidade dos corpos de água [2, 7-11]. * Tamponamento de cursos d'água naturais (canalização através de galerias fechadas): Tipo de canalização onde o rio é "enterrado" em galerias ou tubulações [2, 7, 12]. * Outro(s) [2, 13].
•
**Pavimentação nas Vias de Acesso Rurais (Quesito 3)**Verifica se existia algum tipo de pavimentação nas vias de acesso às áreas rurais sob responsabilidade do prestador de serviço (instalação e/ou operação e/ou manutenção) em 2024 [2, 13].
◦
Tipos de pavimento (Quesito 3.1): * Pavimento impermeável de asfalto, de peças pré-moldadas de concreto, de concreto contínuo [2, 13, 14]. * Pavimento permeável de asfalto poroso, de peças pré-moldadas de concreto poroso ou com juntas alargadas, de concreto poroso contínuo [2, 14]. * Paralelepípedo: Pavimento permeável, sem juntas de cimento, que permite a infiltração da água da chuva [2, 14-16]. * Solo-cimento: Mistura de solo, cimento e água, econômico e ecológico [2, 14, 16]. * Outro(s) [2, 14], Não sabe [2, 14].
•
**Material de Pavimentação de Reúso/Reciclagem (Quesito 4)**Verifica se o material utilizado na pavimentação das vias de acesso às áreas rurais era proveniente de reúso/reciclagem [2, 17].
◦
Materiais (Quesito 4.1): * Resíduos de construção [2, 17-19]. * Borracha, pneu (asfalto-borracha) [2, 17, 19, 20]. * Escória (resíduo industrial): Subproduto da produção de ferro e aço, usado na construção de estradas [2, 17, 20]. * Outro(s) [2, 17].
•
**Soluções em Vias Internas de Comunidades Rurais (Quesito 5)**Avalia se o prestador de serviço implementou soluções que favoreçam o aproveitamento, a infiltração ou o armazenamento das águas da chuva nas vias internas das comunidades rurais (vias de ligação entre as residências pertencentes a uma mesma localidade) [2, 21].
◦
Soluções (Quesito 5.1): * Adequação do abaulamento do leito da via [2, 21, 22]. * Implantação e/ou manutenção de dispositivos para coleta, condução das águas pluviais (sarjetas, canaletas e outros) [2, 21, 22]. * Implantação e/ou manutenção de bacias de contenção próximas às vias (barraginhas, outros) [2, 21, 22]. * Melhorias e/ou adequações nas soluções de Manejo de Águas Pluviais já existentes [2, 21, 22]. * Orientação e apoio à comunidade para a implantação e/ou manutenção de soluções de drenagem pluvial: Inclui cursos de capacitação para que os próprios moradores construam e gerenciem as soluções [2, 21-23]. * Implantação e/ou manutenção de reservatórios coletivos (para captação de água de chuva): Atendem toda a comunidade, não apenas um domicílio [2, 21, 23]. * Outra(s) [2, 21].
•
**Soluções em Peridomicílios Rurais (Quesito 6)**Verifica se o prestador de serviço implementou soluções que favoreçam o aproveitamento, a infiltração e o armazenamento das águas da chuva nos peridomicílios (área externa no entorno do domicílio, dentro da propriedade) em 2024 [2, 24, 25].
◦
Soluções (Quesito 6.1): * Implantação e/ou manutenção de técnicas infiltrantes: trincheira de infiltração, jardim de chuva, canteiro pluvial etc. [2, 26, 27]. * Implantação e/ou manutenção de reservatórios domiciliares (para captação de água de chuva) [2, 26, 27]. * Melhorias e/ou adequações nas soluções de manejo de águas pluviais preexistentes [2, 26, 28]. * Orientação e apoio aos moradores para a implantação e/ou manutenção de soluções de drenagem [2, 28, 29]. * Outra(s) [2, 29].
•
**Aproveitamento de Águas Pluviais em Áreas Rurais (Quesito 7)**Avalia se o prestador de serviço orientou, instalou ou fez manutenção de dispositivos para aproveitamento de águas pluviais no atendimento das áreas rurais [2, 29, 30].
◦
Estratégias (Quesito 7.1): * Promoção do uso racional da água [2, 29, 30]. * Uso de cisternas domiciliares de placas para acumular água para o consumo humano [2, 30, 31]. * Uso de outros tipos de cisternas domiciliares para acumular água para o consumo humano (plásticas, fibra de vidro, com filtro e boa vedação) [2, 32, 33]. * Uso de outros modelos de cisternas para os demais usos relacionados ao saneamento domiciliar (dessedentação de animais, limpeza etc.) [2, 32, 33]. * Outra(s) [2, 32].
•
**Gestão Compartilhada das Águas Pluviais Rurais (Quesito 8)**Verifica se o prestador de serviço participou da gestão compartilhada das águas pluviais nas áreas rurais em 2024. A gestão compartilhada é a atuação conjunta entre governos, comunidades e organizações para orientar técnicas de drenagem e/ou ações de educação ambiental [2, 33, 34].
◦
Formas de participação (Quesito 8.1): * Ações de orientação, instalação, operação ou manutenção dos dispositivos instalados nos peridomicílios [2, 35, 36]. * Ações de instalação, operação e manutenção dos dispositivos instalados no sistema viário interno [2, 35, 37]. * Ações de educação ambiental [2, 35, 37]. * Ações de capacitação para apropriação das técnicas de drenagem utilizadas: Oferta ou participação em cursos para compreensão e aplicação de técnicas em manejo de águas pluviais [2, 35, 37]. * Outra(s) [2, 38].
--------------------------------------------------------------------------------
8.2. Bloco EDU - Educação Ambiental
Este bloco investiga a existência e a natureza das ações de educação ambiental realizadas pelo prestador, com foco na conscientização sobre a importância da conservação, sustentabilidade e respeito ao meio ambiente, incluindo programas, projetos e campanhas [2, 38-40].
•
Conceito de Educação Ambiental: Processos que promovem a conscientização sobre a importância da conservação, sustentabilidade e respeito ao meio ambiente. Envolve programas, projetos e ações, realizados em parceria ou não com órgãos da educação municipal e/ou outros setores, por meio de campanhas de sensibilização e esclarecimento, visando ampliar a consciência ambiental da população [2, 38-40].
•
Importância no MAP: Sensibiliza para as relações da drenagem com desastres, promove consciência, estimula a redução da impermeabilização e a infiltração local [2, 38, 41].
•
**Projetos ou Ações de Educação Ambiental (Quesito 1)**Verifica se o prestador de serviço realizou, no município pesquisado, projeto ou ação de educação ambiental que aborde desastres como enchentes, inundações, poluição de rios, saúde e natureza, mudanças climáticas, saneamento ou temas semelhantes, em 2024 [2, 40, 41].
◦
Frequência (Quesito 1.1): * Contínua (regular, constante) [2, 42, 43]. * Eventual/esporádica (em datas específicas, como Dia da Árvore, Dia do Meio Ambiente, Dia da Água etc.) [2, 42, 43].
•
**Formação e Experiência do Responsável (Quesito 2)**Avalia se o(a) responsável possuía formação na área ambiental e/ou realizou outros projetos ou ações em educação ambiental. A educação ambiental abrange diversas formações acadêmicas e experiências práticas em projetos e ações, envolvendo diferentes setores [2, 43-46].
•
**Temas Desenvolvidos (Quesito 3)**Lista os temas abordados nos projetos ou ações de educação ambiental para o manejo adequado de águas pluviais em 2024 [47-49].
◦
Mitigação e adaptação às mudanças climáticas e prevenção aos desastres: Redução de emissões, redução de impactos e ações de precaução [10, 47-49].
◦
Importância do manejo de águas pluviais no saneamento básico: Relevância da gestão das águas pluviais [10, 47, 48, 50].
◦
Renaturalização, ecologia, despoluição e revitalização dos rios: Restaurar funções ecológicas e hidrológicas, melhorar a qualidade e funcionalidade dos corpos d'água [10, 11, 47, 50, 51].
◦
Drenagem sustentável através de soluções baseadas na natureza e Infraestruturas verdes: Drenagem ecológica e infraestruturas sustentáveis [11, 47, 51].
◦
Arborização e áreas verdes na saúde e bem-estar humano e na qualidade dos mananciais: Impacto da vegetação na saúde e nos recursos hídricos [11, 47, 51, 52].
◦
Urbanização, projetos de uso e ocupação do solo e o impacto na rede de drenagem de águas pluviais: Consequências da edificação das cidades e impermeabilização na drenagem [47, 52, 53].
◦
Desastres e fatores naturais (meteorológicos, geotécnicos) e antrópicos: Calamidades e influências naturais e humanas [47, 53, 54].
◦
Ciclo hidrológico e ciclo da água no saneamento: Processo de troca constante da água e a relação do saneamento com os recursos hídricos [47, 54-56].
◦
Disposição inadequada dos resíduos sólidos, fontes de poluição dos mananciais e sistema de drenagem de águas pluviais: Contaminação de fontes de água e obstrução de redes [47, 55-57].
◦
Gestão participativa da água, participação social e comitês de bacia: Administração compartilhada e engajamento social [47, 57, 58].
◦
Outro(s) [47, 58].
•
**Formas de Realização dos Projetos/Ações (Quesito 4)**Descreve como os projetos ou ações de educação ambiental foram realizados em 2024 [58-60].
◦
Campanhas de sensibilização / mobilização social [39, 59, 60].
◦
Capacitação de profissionais de educação, agentes de saúde, agentes comunitários etc. [39, 59, 60].
◦
Inserção do tema no programa de educação ambiental nas escolas [39, 59, 60].
◦
Mutirões de limpeza [39, 59, 60].
◦
Promoção de palestras temáticas; oficinas e/ou seminários sobre temas de interesse direto ou indireto sobre drenagem [39, 59, 60].
◦
Rodas de conversa (método de participação coletiva, para qualquer faixa etária) [59-61].
◦
Veiculação em internet, redes sociais, rádio, tv, jornal, folhetos e cartazes [59, 61, 62].
◦
Utilização de grupos artísticos orientados [59, 61, 62].
◦
Visitas de agentes públicos a residências, empresas, órgãos públicos etc. [59, 61, 62].
◦
Visitas guiadas a equipamentos/estruturas do sistema de drenagem [59, 61, 62].
◦
Outro(s) [59, 61].

5. IMPORTANTE:
Não resuma, não omita, não altere o texto original.
Apenas organize em cards didáticos, usando os tipos sugeridos.
O resultado deve ser um código JavaScript pronto para uso, sem comentários ou explicações extras. 