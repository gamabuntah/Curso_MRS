#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎴 CRIANDO CARDS INTELIGENTES PARA MRS...\n');

let criacaoOk = true;
const modulosComCards = [];

// Função para gerar dúvidas frequentes baseadas no conteúdo real
function gerarDuvidasFrequentes(modulo) {
    const duvidas = [];
    
    // Dúvidas baseadas no conteúdo real dos módulos MRS
    if (modulo.titulo.includes('Introdução') || modulo.titulo.includes('Saneamento')) {
        duvidas.push("❓ **Dúvida Comum:** \"Não sei se minha empresa atua em saneamento básico\"");
        duvidas.push("💡 **Como Ajudar:** Explique que inclui limpeza urbana, coleta de resíduos, varrição e capina.");
        
        duvidas.push("❓ **Dúvida Comum:** \"O que é considerado resíduo sólido?\"");
        duvidas.push("💡 **Como Ajudar:** Cite exemplos: lixo doméstico, resíduos de varrição, entulho de construção.");
    }
    
    if (modulo.titulo.includes('Questionário') || modulo.titulo.includes('Estrutura')) {
        duvidas.push("❓ **Dúvida Comum:** \"Como preencher se terceirizamos a coleta?\"");
        duvidas.push("💡 **Como Ajudar:** Oriente sobre o cadastro da empresa terceirizada e serviços executados.");
        
        duvidas.push("❓ **Dúvida Comum:** \"O que é abrangência territorial?\"");
        duvidas.push("💡 **Como Ajudar:** Explique que é a área geográfica onde a empresa presta serviços.");
    }
    
    if (modulo.titulo.includes('Legal') || modulo.titulo.includes('Aspectos')) {
        duvidas.push("❓ **Dúvida Comum:** \"Quais documentos comprovam a prestação de serviços?\"");
        duvidas.push("💡 **Como Ajudar:** Cite contratos, licitações, autorizações e alvarás de funcionamento.");
        
        duvidas.push("❓ **Dúvida Comum:** \"Como declarar serviços terceirizados?\"");
        duvidas.push("💡 **Como Ajudar:** Oriente sobre o bloco de terceirização e cadastro da empresa contratada.");
    }
    
    if (modulo.titulo.includes('Áreas Especiais') || modulo.titulo.includes('Coleta Seletiva')) {
        duvidas.push("❓ **Dúvida Comum:** \"O que são áreas especiais?\"");
        duvidas.push("💡 **Como Ajudar:** Cite exemplos: aeroportos, hospitais, shoppings, feiras livres.");
        
        duvidas.push("❓ **Dúvida Comum:** \"Como funciona a coleta seletiva?\"");
        duvidas.push("💡 **Como Ajudar:** Explique as cores CONAMA e tipos de resíduos recicláveis.");
    }
    
    if (modulo.titulo.includes('Resíduos Especiais') || modulo.titulo.includes('Manejo')) {
        duvidas.push("❓ **Dúvida Comum:** \"O que é RSS e RCC?\"");
        duvidas.push("💡 **Como Ajudar:** RSS = Resíduos de Serviços de Saúde, RCC = Resíduos da Construção Civil.");
        
        duvidas.push("❓ **Dúvida Comum:** \"Como descartar embalagens de agrotóxicos?\"");
        duvidas.push("💡 **Como Ajudar:** Oriente sobre logística reversa e devolução ao fabricante.");
    }
    
    if (modulo.titulo.includes('Destinação') || modulo.titulo.includes('Unidades')) {
        duvidas.push("❓ **Dúvida Comum:** \"Qual a diferença entre aterro e vazadouro?\"");
        duvidas.push("💡 **Como Ajudar:** Aterro = técnica adequada, vazadouro = descarte inadequado.");
        
        duvidas.push("❓ **Dúvida Comum:** \"O que é compostagem?\"");
        duvidas.push("💡 **Como Ajudar:** Processo de decomposição de matéria orgânica para adubo.");
    }
    
    if (modulo.titulo.includes('Catadores') || modulo.titulo.includes('Educação')) {
        duvidas.push("❓ **Dúvida Comum:** \"Como trabalhar com cooperativas de catadores?\"");
        duvidas.push("💡 **Como Ajudar:** Oriente sobre parcerias, contratos e apoio à coleta seletiva.");
        
        duvidas.push("❓ **Dúvida Comum:** \"O que são projetos de educação ambiental?\"");
        duvidas.push("💡 **Como Ajudar:** Cite campanhas, palestras, material educativo e conscientização.");
    }
    
    // Dúvidas gerais se não houver específicas
    if (duvidas.length === 0) {
        duvidas.push("❓ **Dúvida Comum:** \"Como aplicar os conceitos deste módulo na prática?\"");
        duvidas.push("💡 **Como Ajudar:** Revise os exemplos e casos práticos apresentados no módulo.");
        
        duvidas.push("❓ **Dúvida Comum:** \"Qual é a seção mais importante deste módulo?\"");
        duvidas.push("💡 **Como Ajudar:** Todas as seções são importantes, mas foque nas que têm mais exemplos práticos.");
    }
    
    return duvidas.join('\n\n');
}

// Função para criar resumo visual estruturado
function criarResumoVisual(modulo) {
    const resumo = [];
    
    // Tabela de palavras-chave baseada no conteúdo
    const palavrasChave = [];
    if (modulo.titulo.includes('Saneamento')) {
        palavrasChave.push(['Saneamento Básico', 'Conjunto de serviços essenciais']);
        palavrasChave.push(['PNSB', 'Pesquisa Nacional de Saneamento Básico']);
        palavrasChave.push(['MRS', 'Manejo de Resíduos Sólidos']);
    }
    
    if (modulo.titulo.includes('Questionário')) {
        palavrasChave.push(['Bloco CZP', 'Caracterização do Prestador']);
        palavrasChave.push(['CNPJ', 'Cadastro Nacional de Pessoas Jurídicas']);
        palavrasChave.push(['Abrangência', 'Área geográfica de atuação']);
    }
    
    if (modulo.titulo.includes('Legal')) {
        palavrasChave.push(['Terceirização', 'Contratação de serviços externos']);
        palavrasChave.push(['Instrumentos Legais', 'Contratos e autorizações']);
        palavrasChave.push(['Delegação', 'Transferência de responsabilidades']);
    }
    
    if (modulo.titulo.includes('Áreas Especiais')) {
        palavrasChave.push(['Coleta Seletiva', 'Separação por tipo de resíduo']);
        palavrasChave.push(['Cores CONAMA', 'Padrão de cores para reciclagem']);
        palavrasChave.push(['Áreas Especiais', 'Locais com necessidades específicas']);
    }
    
    if (modulo.titulo.includes('Resíduos Especiais')) {
        palavrasChave.push(['RSS', 'Resíduos de Serviços de Saúde']);
        palavrasChave.push(['RCC', 'Resíduos da Construção Civil']);
        palavrasChave.push(['Logística Reversa', 'Retorno de embalagens ao fabricante']);
    }
    
    if (modulo.titulo.includes('Destinação')) {
        palavrasChave.push(['Aterro Sanitário', 'Destinação técnica adequada']);
        palavrasChave.push(['Vazadouro', 'Descarte inadequado']);
        palavrasChave.push(['Compostagem', 'Processo de decomposição orgânica']);
    }
    
    if (modulo.titulo.includes('Catadores')) {
        palavrasChave.push(['Cooperativas', 'Associações de catadores']);
        palavrasChave.push(['Educação Ambiental', 'Conscientização e capacitação']);
        palavrasChave.push(['Veículos', 'Equipamentos para coleta']);
    }
    
    if (palavrasChave.length > 0) {
        resumo.push('📚 **PALAVRAS-CHAVE DO MÓDULO**\n');
        resumo.push('| Termo | Definição Rápida |');
        resumo.push('|-------|------------------|');
        palavrasChave.forEach(([termo, definicao]) => {
            resumo.push(`| ${termo} | ${definicao} |`);
        });
    }
    
    // Tabela de diferenciações importantes
    const diferenciacoes = [];
    if (modulo.titulo.includes('Saneamento')) {
        diferenciacoes.push(['Resíduos Domésticos', 'Resíduos Especiais', 'Origem e tratamento']);
    }
    
    if (modulo.titulo.includes('Coleta')) {
        diferenciacoes.push(['Coleta Convencional', 'Coleta Seletiva', 'Separação de materiais']);
    }
    
    if (modulo.titulo.includes('Destinação')) {
        diferenciacoes.push(['Aterro Sanitário', 'Vazadouro', 'Técnica adequada vs inadequada']);
    }
    
    if (diferenciacoes.length > 0) {
        resumo.push('\n🔄 **DIFERENCIAÇÕES IMPORTANTES**\n');
        resumo.push('| Conceito A | Conceito B | Diferença Principal |');
        resumo.push('|------------|------------|-------------------|');
        diferenciacoes.forEach(([conceitoA, conceitoB, diferenca]) => {
            resumo.push(`| ${conceitoA} | ${conceitoB} | ${diferenca} |`);
        });
    }
    
    // Infográfico simples do fluxo
    if (modulo.titulo.includes('Manejo') || modulo.titulo.includes('Resíduos')) {
        resumo.push('\n📈 **FLUXO DO SISTEMA DE MRS**\n');
        resumo.push('Geração → Coleta → Transporte → Processamento → Destinação');
        resumo.push('   ↓         ↓          ↓            ↓            ↓');
        resumo.push('Resíduos → Varrição → Veículos → Triagem → Aterro/Reciclagem');
    }
    
    return resumo.join('\n');
}

// Função para criar cards inteligentes seguindo o padrão definido
function criarCardsInteligentes(moduloProcessado) {
    const cards = [];
    
    // Card 1: Resumo (se houver)
    if (moduloProcessado.resumo) {
        cards.push({
            type: "default",
            title: "📋 Resumo do Módulo",
            content: moduloProcessado.resumo,
            icon: "📋"
        });
    }
    
    // Cards 2+: Conteúdo Principal (cada seção como card separado)
    if (moduloProcessado.secoes.length > 0) {
        moduloProcessado.secoes.forEach((secao, index) => {
            cards.push({
                type: "default",
                title: `${secao.numero} ${secao.titulo}`,
                content: secao.conteudo,
                icon: "📚"
            });
        });
    }
    
    // Card: Dica (baseado no conteúdo das seções)
    const dicas = gerarDicasImportantes(moduloProcessado);
    if (dicas.length > 0) {
        cards.push({
            type: "dica",
            title: "💡 Dicas Importantes",
            content: dicas.join('\n\n'),
            icon: "💡"
        });
    }
    
    // Card: Atenção (pontos importantes do conteúdo)
    const pontosAtencao = gerarPontosAtencao(moduloProcessado);
    if (pontosAtencao.length > 0) {
        cards.push({
            type: "atencao",
            title: "⚠️ Pontos de Atenção",
            content: pontosAtencao.join('\n\n'),
            icon: "⚠️"
        });
    }
    
    // Card: Exemplo (exemplos práticos do conteúdo)
    const exemplos = gerarExemplosPraticos(moduloProcessado);
    if (exemplos.length > 0) {
        cards.push({
            type: "exemplo",
            title: "📝 Exemplos Práticos",
            content: exemplos.join('\n\n'),
            icon: "📝"
        });
    }
    
    // Card: Dúvidas Frequentes (sempre presente)
    const duvidas = gerarDuvidasFrequentes(moduloProcessado);
    cards.push({
        type: "duvidas",
        title: "🗨️ Dúvidas Frequentes e Como Ajudar",
        content: duvidas,
        icon: "🗨️"
    });
    
    // Card: Resumo Visual (sempre presente)
    const resumoVisual = criarResumoVisual(moduloProcessado);
    cards.push({
        type: "resumo visual",
        title: "📊 Resumo Visual",
        content: resumoVisual,
        icon: "📊"
    });
    
    return cards;
}

// Função para gerar dicas importantes baseadas no conteúdo
function gerarDicasImportantes(modulo) {
    const dicas = [];
    
    // Dicas baseadas no título e conteúdo do módulo
    if (modulo.titulo.includes('Introdução') || modulo.titulo.includes('Saneamento')) {
        dicas.push("• **Lei 11.445/2007:** Conheça os 4 componentes do saneamento básico: abastecimento de água, esgotamento sanitário, limpeza urbana e drenagem pluvial.");
        dicas.push("• **PNSB:** A pesquisa é fundamental para gerar indicadores de saneamento em todos os municípios brasileiros.");
        dicas.push("• **ODS:** A PNSB monitora os Objetivos de Desenvolvimento Sustentável 11 (cidades sustentáveis) e 12 (consumo responsável).");
    }
    
    if (modulo.titulo.includes('Questionário') || modulo.titulo.includes('Estrutura')) {
        dicas.push("• **Manual de Coleta:** É indispensável para o correto preenchimento dos blocos do questionário.");
        dicas.push("• **CNPJ:** Certifique-se de que o prestador possui CNPJ válido antes de iniciar o preenchimento.");
        dicas.push("• **Responsável:** A pessoa indicada deve ter acesso a todas as informações sobre os serviços prestados.");
    }
    
    if (modulo.titulo.includes('Legal') || modulo.titulo.includes('Aspectos')) {
        dicas.push("• **Instrumentos Legais:** Identifique corretamente o tipo de contrato (programa, concessão, PPP, etc.).");
        dicas.push("• **Metas de Universalização:** Verifique se o instrumento define metas para ampliação do acesso ao saneamento.");
        dicas.push("• **Ouvidoria:** A existência de ouvidoria é importante para a participação cidadã.");
    }
    
    if (modulo.titulo.includes('Áreas Especiais') || modulo.titulo.includes('Coleta Seletiva')) {
        dicas.push("• **Cores CONAMA:** Use as cores padrão (azul, verde, vermelho, amarelo) para coleta seletiva.");
        dicas.push("• **Áreas Especiais:** Identifique locais como aeroportos, hospitais, shoppings que têm necessidades específicas.");
        dicas.push("• **Separação:** A coleta seletiva envolve separação por tipo de material (plástico, papel, metal, vidro).");
    }
    
    if (modulo.titulo.includes('Resíduos Especiais') || modulo.titulo.includes('Manejo')) {
        dicas.push("• **RSS:** Resíduos de Serviços de Saúde exigem tratamento especial e não podem ser misturados com resíduos comuns.");
        dicas.push("• **RCC:** Resíduos da Construção Civil devem ser separados e destinados adequadamente.");
        dicas.push("• **Logística Reversa:** Embalagens de agrotóxicos, eletroeletrônicos e lâmpadas têm logística reversa obrigatória.");
    }
    
    if (modulo.titulo.includes('Destinação') || modulo.titulo.includes('Unidades')) {
        dicas.push("• **Aterro Sanitário:** É a destinação técnica adequada, diferente de vazadouros (lixões).");
        dicas.push("• **Compostagem:** Processo de decomposição de matéria orgânica para produção de adubo.");
        dicas.push("• **Incineração:** Método de tratamento térmico que reduz volume e massa dos resíduos.");
    }
    
    if (modulo.titulo.includes('Catadores') || modulo.titulo.includes('Educação')) {
        dicas.push("• **Cooperativas:** Trabalhar com cooperativas de catadores fortalece a coleta seletiva e a inclusão social.");
        dicas.push("• **Educação Ambiental:** Projetos educativos são essenciais para conscientização da população.");
        dicas.push("• **Veículos:** A frota deve ser adequada ao tipo de serviço e área de cobertura.");
    }
    
    return dicas;
}

// Função para gerar pontos de atenção
function gerarPontosAtencao(modulo) {
    const pontos = [];
    
    if (modulo.titulo.includes('Introdução') || modulo.titulo.includes('Saneamento')) {
        pontos.push("• **Definição Correta:** Certifique-se de que sua empresa realmente atua em saneamento básico antes de responder.");
        pontos.push("• **Componentes:** Não confunda os 4 componentes do saneamento básico.");
        pontos.push("• **PNSB:** A pesquisa é obrigatória e os dados são utilizados para políticas públicas.");
    }
    
    if (modulo.titulo.includes('Questionário') || modulo.titulo.includes('Estrutura')) {
        pontos.push("• **Preenchimento Correto:** Use sempre o Manual de Coleta para evitar erros.");
        pontos.push("• **CNPJ Válido:** Verifique se o CNPJ está ativo antes de iniciar o preenchimento.");
        pontos.push("• **Responsável:** A pessoa indicada deve ter autorização e conhecimento sobre os serviços.");
    }
    
    if (modulo.titulo.includes('Legal') || modulo.titulo.includes('Aspectos')) {
        pontos.push("• **Instrumentos Legais:** Identifique corretamente o tipo de instrumento legal vigente.");
        pontos.push("• **Terceirização:** Se houver terceirização, cadastre todas as empresas contratadas.");
        pontos.push("• **Metas:** Verifique se as metas de universalização estão sendo cumpridas.");
    }
    
    if (modulo.titulo.includes('Áreas Especiais') || modulo.titulo.includes('Coleta Seletiva')) {
        pontos.push("• **Cores Padrão:** Use apenas as cores CONAMA para coleta seletiva.");
        pontos.push("• **Áreas Especiais:** Identifique corretamente se atende áreas especiais.");
        pontos.push("• **Separação:** A coleta seletiva exige separação prévia dos materiais.");
    }
    
    if (modulo.titulo.includes('Resíduos Especiais') || modulo.titulo.includes('Manejo')) {
        pontos.push("• **RSS:** Nunca misture resíduos de saúde com resíduos comuns.");
        pontos.push("• **RCC:** Resíduos da construção civil têm legislação específica.");
        pontos.push("• **Logística Reversa:** Verifique se está cumprindo as obrigações de logística reversa.");
    }
    
    if (modulo.titulo.includes('Destinação') || modulo.titulo.includes('Unidades')) {
        pontos.push("• **Destinação Adequada:** Evite vazadouros (lixões), use apenas aterros sanitários.");
        pontos.push("• **Licenciamento:** Verifique se as unidades de destinação têm licenciamento ambiental.");
        pontos.push("• **Monitoramento:** Acompanhe regularmente o funcionamento das unidades.");
    }
    
    if (modulo.titulo.includes('Catadores') || modulo.titulo.includes('Educação')) {
        pontos.push("• **Cooperativas:** Certifique-se de que as cooperativas estão formalizadas.");
        pontos.push("• **Educação:** Projetos de educação ambiental devem ser contínuos.");
        pontos.push("• **Frota:** Mantenha a frota em bom estado de conservação.");
    }
    
    return pontos;
}

// Função para gerar exemplos práticos
function gerarExemplosPraticos(modulo) {
    const exemplos = [];
    
    if (modulo.titulo.includes('Introdução') || modulo.titulo.includes('Saneamento')) {
        exemplos.push("• **Abastecimento de água:** Captação, tratamento e distribuição de água potável para a população.");
        exemplos.push("• **Esgotamento sanitário:** Coleta, transporte e tratamento de esgotos domésticos.");
        exemplos.push("• **Limpeza urbana:** Varrição de ruas, coleta de lixo doméstico e público.");
        exemplos.push("• **Drenagem pluvial:** Sistema de galerias e bocas de lobo para escoamento da chuva.");
    }
    
    if (modulo.titulo.includes('Questionário') || modulo.titulo.includes('Estrutura')) {
        exemplos.push("• **Bloco IDM:** Identificação do município onde o serviço é prestado.");
        exemplos.push("• **Bloco IDP:** Identificação da empresa prestadora do serviço.");
        exemplos.push("• **Bloco CZP:** Caracterização completa do prestador e serviços executados.");
    }
    
    if (modulo.titulo.includes('Legal') || modulo.titulo.includes('Aspectos')) {
        exemplos.push("• **Contrato de programa:** Acordo entre município e empresa pública sem licitação.");
        exemplos.push("• **Contrato de concessão:** Transferência de serviço para empresa privada com licitação.");
        exemplos.push("• **PPP:** Parceria público-privada para execução de obras e serviços.");
    }
    
    if (modulo.titulo.includes('Áreas Especiais') || modulo.titulo.includes('Coleta Seletiva')) {
        exemplos.push("• **Coleta seletiva:** Separação de plástico (vermelho), papel (azul), vidro (verde), metal (amarelo).");
        exemplos.push("• **Áreas especiais:** Aeroportos, hospitais, shoppings, feiras livres, praias.");
        exemplos.push("• **Varrição:** Remoção de folhas, galhos, papéis e outros resíduos das vias públicas.");
    }
    
    if (modulo.titulo.includes('Resíduos Especiais') || modulo.titulo.includes('Manejo')) {
        exemplos.push("• **RSS:** Agulhas, seringas, luvas, máscaras, medicamentos vencidos de hospitais.");
        exemplos.push("• **RCC:** Entulho de construção, tijolos, concreto, madeira de obras.");
        exemplos.push("• **Logística reversa:** Embalagens de agrotóxicos, pilhas, baterias, eletroeletrônicos.");
    }
    
    if (modulo.titulo.includes('Destinação') || modulo.titulo.includes('Unidades')) {
        exemplos.push("• **Aterro sanitário:** Destinação técnica adequada com impermeabilização e tratamento de chorume.");
        exemplos.push("• **Compostagem:** Decomposição de restos de alimentos para produção de adubo orgânico.");
        exemplos.push("• **Incineração:** Queima controlada de resíduos com controle de emissões.");
    }
    
    if (modulo.titulo.includes('Catadores') || modulo.titulo.includes('Educação')) {
        exemplos.push("• **Cooperativas:** Associações de catadores que fazem triagem e comercialização de recicláveis.");
        exemplos.push("• **Educação ambiental:** Campanhas, palestras, material educativo sobre reciclagem.");
        exemplos.push("• **Frota:** Caminhões compactadores, veículos para coleta seletiva, equipamentos de varrição.");
    }
    
    return exemplos;
}

// Carregar módulos processados
console.log('📂 Carregando módulos processados:');
let modulosProcessados = [];

try {
    const arquivoProcessados = path.join('logs', 'modulos-processados.json');
    
    if (fs.existsSync(arquivoProcessados)) {
        modulosProcessados = JSON.parse(fs.readFileSync(arquivoProcessados, 'utf8'));
        console.log(`✅ ${modulosProcessados.length} módulos carregados`);
    } else {
        console.log('❌ Arquivo de módulos processados não encontrado!');
        console.log('ℹ️  Execute primeiro o script processar-arquivos-txt.js');
        process.exit(1);
    }
} catch (error) {
    console.log(`❌ Erro ao carregar módulos processados: ${error.message}`);
    process.exit(1);
}

// Criar cards para cada módulo
console.log('\n🎴 Criando cards inteligentes:');
modulosProcessados.forEach(modulo => {
    console.log(`\n📄 Processando Módulo ${modulo.id}:`);
    
    const cards = criarCardsInteligentes(modulo);
    
    // Criar objeto do módulo com cards
    const moduloComCards = {
        id: modulo.id,
        titulo: modulo.titulo,
        audio: modulo.audio,
        cards: cards,
        metadata: {
            ...modulo.metadata,
            cardsCriados: cards.length,
            tiposCards: cards.map(card => card.type),
            dataCriacaoCards: new Date().toISOString()
        }
    };
    
    modulosComCards.push(moduloComCards);
    
    console.log(`   ✅ ${cards.length} cards criados`);
    console.log(`   📋 Tipos: ${cards.map(card => card.type).join(', ')}`);
    
    // Verificar se há cards essenciais
    const temResumo = cards.some(card => card.title.includes('Resumo'));
    const temConteudo = cards.some(card => card.type === 'default' && !card.title.includes('Resumo'));
    const temDuvidas = cards.some(card => card.type === 'duvidas');
    const temResumoVisual = cards.some(card => card.type === 'resumo visual');
    
    if (!temConteudo) {
        console.log(`   ⚠️  Módulo ${modulo.id}: Falta card de conteúdo principal`);
    }
    
    if (!temDuvidas) {
        console.log(`   ⚠️  Módulo ${modulo.id}: Falta card de dúvidas frequentes`);
    }
    
    if (!temResumoVisual) {
        console.log(`   ⚠️  Módulo ${modulo.id}: Falta card de resumo visual`);
    }
});

// Verificar qualidade dos cards criados
console.log('\n📊 RESUMO DOS CARDS CRIADOS:');
console.log(`   🎴 Total de módulos: ${modulosComCards.length}`);

let totalCards = 0;
const tiposCards = {};

modulosComCards.forEach(modulo => {
    totalCards += modulo.cards.length;
    
    modulo.cards.forEach(card => {
        tiposCards[card.type] = (tiposCards[card.type] || 0) + 1;
    });
});

console.log(`   📋 Total de cards: ${totalCards}`);
console.log(`   📊 Média por módulo: ${Math.round(totalCards / modulosComCards.length)}`);

console.log('\n📈 Distribuição por tipo:');
Object.entries(tiposCards).forEach(([tipo, quantidade]) => {
    console.log(`   ${tipo}: ${quantidade} cards`);
});

// Salvar módulos com cards
console.log('\n💾 Salvando módulos com cards:');
try {
    const arquivoCards = path.join('logs', 'modulos-com-cards.json');
    fs.writeFileSync(arquivoCards, JSON.stringify(modulosComCards, null, 2), 'utf8');
    console.log('✅ Módulos com cards salvos em logs/modulos-com-cards.json');
    
    // Criar resumo dos cards
    const resumoCards = {
        data: new Date().toISOString(),
        totalModulos: modulosComCards.length,
        totalCards: totalCards,
        mediaCardsPorModulo: Math.round(totalCards / modulosComCards.length),
        distribuicaoTipos: tiposCards,
        modulos: modulosComCards.map(m => ({
            id: m.id,
            titulo: m.titulo,
            cards: m.cards.length,
            tipos: m.cards.map(card => card.type)
        })),
        status: criacaoOk ? 'SUCESSO' : 'COM_ERROS'
    };
    
    fs.writeFileSync(path.join('logs', 'resumo-cards.json'), JSON.stringify(resumoCards, null, 2), 'utf8');
    console.log('✅ Resumo dos cards salvo em logs/resumo-cards.json');
    
} catch (error) {
    console.log(`❌ Erro ao salvar módulos com cards: ${error.message}`);
    criacaoOk = false;
}

// Verificar se todos os módulos têm cards adequados
modulosComCards.forEach(modulo => {
    if (modulo.cards.length < 3) {
        console.log(`   ⚠️  Módulo ${modulo.id}: Apenas ${modulo.cards.length} cards`);
        criacaoOk = false;
    }
    
    const temConteudo = modulo.cards.some(card => card.type === 'default' && !card.title.includes('Resumo'));
    const temDuvidas = modulo.cards.some(card => card.type === 'duvidas');
    const temResumoVisual = modulo.cards.some(card => card.type === 'resumo visual');
    
    if (!temConteudo || !temDuvidas || !temResumoVisual) {
        console.log(`   ⚠️  Módulo ${modulo.id}: Faltam cards essenciais`);
        criacaoOk = false;
    }
});

// Resultado final
console.log('\n' + '='.repeat(50));

if (criacaoOk && modulosComCards.length === 7) {
    console.log('🎉 CARDS INTELIGENTES CRIADOS COM SUCESSO!');
    console.log('✅ Todos os 7 módulos com cards');
    console.log('✅ Cards seguindo padrão definido');
    console.log('✅ Dúvidas frequentes baseadas no conteúdo real');
    console.log('✅ Resumos visuais estruturados');
    console.log('✅ Módulos prontos para geração JSON');
    process.exit(0);
} else {
    console.log('⚠️  CRIAÇÃO CONCLUÍDA COM PROBLEMAS!');
    console.log('⚠️  Verifique os erros acima antes de continuar.');
    process.exit(1);
} 