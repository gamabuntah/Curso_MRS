#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('❓ GERANDO QUESTÕES POR MÓDULO (MRS)...\n');

// 1. Carregar os módulos processados com cards
const modulosPath = path.join('logs', 'modulos-com-cards.json');
if (!fs.existsSync(modulosPath)) {
    console.error('❌ Arquivo de módulos com cards não encontrado:', modulosPath);
    process.exit(1);
}
const modulos = JSON.parse(fs.readFileSync(modulosPath, 'utf8'));

// Função de similaridade simples (palavras em comum)
function similaridade(str1, str2) {
    const set1 = new Set(str1.toLowerCase().split(/\W+/));
    const set2 = new Set(str2.toLowerCase().split(/\W+/));
    const inter = new Set([...set1].filter(x => set2.has(x)));
    return inter.size / Math.max(set1.size, set2.size);
}

// Função para embaralhar array
function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Função para gerar alternativas incorretas específicas baseadas no conteúdo
function gerarAlternativasIncorretasEspecificas(card, modulo) {
    const alternativas = [];
    
    // Extrair palavras-chave do conteúdo para criar alternativas específicas
    const palavrasChave = card.content.toLowerCase()
        .split(/\W+/)
        .filter(p => p.length > 4 && !['para', 'com', 'que', 'uma', 'são', 'dos', 'das', 'por', 'tem', 'não'].includes(p))
        .slice(0, 5);
    
    // Alternativa 1: Conceito relacionado mas incorreto
    if (palavrasChave.length > 0) {
        alternativas.push({
            texto: `Foca apenas em ${palavrasChave[0]} sem considerar outros aspectos.`,
            correta: false,
            feedback: `O conteúdo aborda múltiplos aspectos, não apenas ${palavrasChave[0]}.`
        });
    } else {
        alternativas.push({
            texto: 'Aborda apenas aspectos superficiais do tema.',
            correta: false,
            feedback: 'O conteúdo é abrangente e detalhado.'
        });
    }
    
    // Alternativa 2: Aplicação incorreta
    alternativas.push({
        texto: 'Pode ser ignorado na prática diária.',
        correta: false,
        feedback: 'Este conteúdo é essencial para a aplicação correta dos conceitos.'
    });
    
    // Alternativa 3: Baseada no contexto do módulo
    const contextoModulo = modulo.titulo.toLowerCase();
    if (contextoModulo.includes('legal')) {
        alternativas.push({
            texto: 'É apenas uma sugestão, não uma obrigação legal.',
            correta: false,
            feedback: 'Os aspectos legais são obrigatórios e devem ser seguidos.'
        });
    } else if (contextoModulo.includes('questionário')) {
        alternativas.push({
            texto: 'É opcional no preenchimento do questionário.',
            correta: false,
            feedback: 'O preenchimento correto é obrigatório para a pesquisa.'
        });
    } else {
        alternativas.push({
            texto: 'Não se aplica ao contexto deste módulo.',
            correta: false,
            feedback: 'O conteúdo é específico e relevante para este módulo.'
        });
    }
    
    return alternativas;
}

// Função para gerar questões de aplicação específicas por módulo
function gerarQuestaoAplicacaoEspecifica(card, modulo) {
    const contextoModulo = modulo.titulo.toLowerCase();
    let aplicacaoEspecifica = '';
    let feedbackEspecifico = '';
    
    if (contextoModulo.includes('introdução')) {
        aplicacaoEspecifica = 'Compreendendo os conceitos básicos do saneamento para identificar corretamente os serviços da empresa.';
        feedbackEspecifico = 'A compreensão dos conceitos básicos é fundamental para o correto preenchimento da pesquisa.';
    } else if (contextoModulo.includes('questionário')) {
        aplicacaoEspecifica = 'Utilizando a estrutura correta do questionário para coletar informações precisas.';
        feedbackEspecifico = 'A estrutura do questionário garante a padronização e qualidade dos dados coletados.';
    } else if (contextoModulo.includes('legal')) {
        aplicacaoEspecifica = 'Aplicando os requisitos legais e metas de universalização na gestão de resíduos.';
        feedbackEspecifico = 'O cumprimento legal é obrigatório e garante a qualidade dos serviços.';
    } else if (contextoModulo.includes('áreas especiais')) {
        aplicacaoEspecifica = 'Implementando coleta seletiva e serviços em áreas especiais conforme as diretrizes.';
        feedbackEspecifico = 'A coleta seletiva e serviços especiais contribuem para a sustentabilidade.';
    } else if (contextoModulo.includes('resíduos especiais')) {
        aplicacaoEspecifica = 'Gerenciando resíduos especiais com os procedimentos adequados de segurança.';
        feedbackEspecifico = 'O manejo correto de resíduos especiais previne riscos ambientais e à saúde.';
    } else if (contextoModulo.includes('destinação')) {
        aplicacaoEspecifica = 'Utilizando unidades de destinação adequadas para cada tipo de resíduo.';
        feedbackEspecifico = 'A destinação correta é essencial para a proteção ambiental.';
    } else if (contextoModulo.includes('catadores')) {
        aplicacaoEspecifica = 'Integrando catadores e promovendo educação ambiental na gestão de resíduos.';
        feedbackEspecifico = 'A inclusão social e educação ambiental são fundamentais para a sustentabilidade.';
    } else {
        aplicacaoEspecifica = 'Aplicando os conceitos específicos deste módulo na gestão de resíduos.';
        feedbackEspecifico = 'A aplicação prática consolida o aprendizado e melhora a qualidade dos serviços.';
    }
    
    return {
        texto: aplicacaoEspecifica,
        correta: true,
        feedback: feedbackEspecifico
    };
}

// Função para gerar questões a partir dos cards
function gerarQuestoesModulo(modulo) {
    const questoes = [];
    const temasUsados = new Set();
    const perguntasSet = new Set();
    
    // Cards de conteúdo (default)
    const cardsConteudo = modulo.cards.filter(card => card.type === 'default');
    // Cards especiais
    const cardsEspeciais = modulo.cards.filter(card => card.type !== 'default');
    
    // 1. Questões de compreensão de conteúdo (máximo 8)
    cardsConteudo.forEach(card => {
        if (questoes.length >= 8) return;
        const base = card.content.split('\n').filter(l => l.trim().length > 30)[0] || card.content;
        const tema = card.title;
        
        // Evitar temas já usados
        if (!base || temasUsados.has(tema)) return;
        
        // Checagem de similaridade
        let repetida = false;
        for (const q of questoes) {
            if (similaridade(q.pergunta, `Sobre: ${card.title}. Qual a afirmação correta?`) > 0.7) {
                repetida = true;
                break;
            }
        }
        if (repetida) return;
        
        temasUsados.add(tema);
        perguntasSet.add(`Sobre: ${card.title}. Qual a afirmação correta?`);
        
        // Gerar alternativas incorretas específicas
        const alternativasIncorretas = gerarAlternativasIncorretasEspecificas(card, modulo);
        
        questoes.push({
            pergunta: `Sobre: ${card.title}. Qual a afirmação correta?`,
            alternativas: embaralhar([
                { texto: base, correta: true, feedback: `Correto! ${base}` },
                ...alternativasIncorretas
            ])
        });
    });
    
    // 2. Questões de cards especiais (máximo 3)
    cardsEspeciais.forEach(card => {
        if (questoes.length >= 11) return;
        if (!card.content || temasUsados.has(card.title)) return;
        
        let repetida = false;
        for (const q of questoes) {
            if (similaridade(q.pergunta, `O que representa este card especial: "${card.title}"?`) > 0.7) {
                repetida = true;
                break;
            }
        }
        if (repetida) return;
        
        temasUsados.add(card.title);
        perguntasSet.add(`O que representa este card especial: "${card.title}"?`);
        
        questoes.push({
            pergunta: `O que representa este card especial: "${card.title}"?`,
            alternativas: embaralhar([
                { texto: card.content, correta: true, feedback: `Este card especial destaca: ${card.content.split('\n')[0]}` },
                { texto: 'É um conteúdo irrelevante para o módulo.', correta: false, feedback: 'O card especial traz informações importantes e relevantes.' },
                { texto: 'É apenas uma ilustração sem conteúdo educativo.', correta: false, feedback: 'O card especial tem conteúdo educativo específico.' },
                { texto: 'Não se relaciona com o tema principal do módulo.', correta: false, feedback: 'O card especial é diretamente relacionado ao tema do módulo.' }
            ])
        });
    });
    
    // 3. Questões de aplicação prática específicas (máximo 2)
    let aplicacoesGeradas = 0;
    cardsConteudo.forEach(card => {
        if (questoes.length >= 13 || aplicacoesGeradas >= 2) return;
        
        let repetida = false;
        for (const q of questoes) {
            if (similaridade(q.pergunta, `Como aplicar o conceito de "${card.title}" na prática?`) > 0.7) {
                repetida = true;
                break;
            }
        }
        if (repetida) return;
        
        perguntasSet.add(`Como aplicar o conceito de "${card.title}" na prática?`);
        aplicacoesGeradas++;
        
        const aplicacaoEspecifica = gerarQuestaoAplicacaoEspecifica(card, modulo);
        
        questoes.push({
            pergunta: `Como aplicar o conceito de "${card.title}" na prática?`,
            alternativas: embaralhar([
                aplicacaoEspecifica,
                { texto: 'Ignorando as diretrizes do módulo.', correta: false, feedback: 'As diretrizes devem ser seguidas para garantir qualidade.' },
                { texto: 'Aplicando apenas quando conveniente.', correta: false, feedback: 'A aplicação deve ser consistente e regular.' },
                { texto: 'Delegando a responsabilidade para outros.', correta: false, feedback: 'A responsabilidade deve ser assumida diretamente.' }
            ])
        });
    });
    
    // 4. Questões de síntese específicas (máximo 2)
    let sintesesGeradas = 0;
    cardsConteudo.forEach(card => {
        if (questoes.length >= 15 || sintesesGeradas >= 2) return;
        
        const base = card.content.split('\n').filter(l => l.trim().length > 30)[0] || card.content;
        if (!base) return;
        
        let perguntaSintese = `Qual é a principal mensagem do card "${card.title}"?`;
        let repetida = false;
        for (const q of questoes) {
            if (similaridade(q.pergunta, perguntaSintese) > 0.7) {
                repetida = true;
                break;
            }
        }
        if (repetida) return;
        
        perguntasSet.add(perguntaSintese);
        sintesesGeradas++;
        
        questoes.push({
            pergunta: perguntaSintese,
            alternativas: embaralhar([
                { texto: base, correta: true, feedback: `A principal mensagem é: ${base.split('.')[0]}.` },
                { texto: 'O card não traz informações relevantes.', correta: false, feedback: 'O card apresenta informações essenciais para o módulo.' },
                { texto: 'O card é apenas ilustrativo.', correta: false, feedback: 'O card contém conteúdo educativo importante.' },
                { texto: 'O card trata de outro tema não relacionado.', correta: false, feedback: 'O card é específico e relevante para este tema.' }
            ])
        });
    });
    
    // 5. Garantir 15 questões com questões complementares
    while (questoes.length < 15) {
        const card = cardsConteudo[questoes.length % cardsConteudo.length];
        const base = card.content.split('\n').filter(l => l.trim().length > 20)[0] || card.content;
        
        let perguntaComplementar = `Qual aspecto do "${card.title}" é mais importante?`;
        let repetida = false;
        for (const q of questoes) {
            if (similaridade(q.pergunta, perguntaComplementar) > 0.7) {
                repetida = true;
                break;
            }
        }
        if (repetida) {
            perguntaComplementar = `Sobre "${card.title}", o que é fundamental compreender?`;
        }
        
        questoes.push({
            pergunta: perguntaComplementar,
            alternativas: embaralhar([
                { texto: base, correta: true, feedback: `Fundamental: ${base.split('.')[0]}.` },
                { texto: 'Apenas aspectos técnicos.', correta: false, feedback: 'O conteúdo vai além dos aspectos técnicos.' },
                { texto: 'Apenas a documentação.', correta: false, feedback: 'A documentação é importante, mas não é o único aspecto.' },
                { texto: 'Apenas os custos envolvidos.', correta: false, feedback: 'Os custos são relevantes, mas não são o aspecto principal.' }
            ])
        });
    }
    
    return questoes.slice(0, 15);
}

// Gerar quizzes para todos os módulos
const quizzes = modulos.map(modulo => {
    const questoes = gerarQuestoesModulo(modulo);
    return {
        id: modulo.id,
        titulo: modulo.title || modulo.titulo,
        questoes
    };
});

// Salvar quizzes em JSON
const quizzesPath = path.join('logs', 'quizzes-modulos.json');
fs.writeFileSync(quizzesPath, JSON.stringify(quizzes, null, 2), 'utf8');
console.log('✅ Quizzes salvos em', quizzesPath);

// Resumo
console.log('\nResumo das questões por módulo:');
quizzes.forEach(q => {
    console.log(`- ${q.titulo}: ${q.questoes.length} questões`);
});

console.log('\n🎉 GERAÇÃO DE QUESTÕES FINALIZADA!'); 