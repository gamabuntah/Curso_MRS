const fs = require('fs');

// Ler o arquivo consolidado
const conteudo = fs.readFileSync('MRS/Questoes_Av_Final_Padronizadas_COMPLETO.md', 'utf8');

// Questões duplicadas identificadas (manter a primeira ocorrência de cada)
const duplicatas = [
    {
        titulo: 'Aterro Sanitário – Características Essenciais',
        manter: 33, // Manter questão 33
        remover: 42  // Remover questão 42
    },
    {
        titulo: 'Remuneração das Entidades de Catadores',
        manter: 36, // Manter questão 36
        remover: 45  // Remover questão 45
    },
    {
        titulo: 'Objetivo do Mapeamento de Infraestrutura',
        manter: 37, // Manter questão 37
        remover: 47  // Remover questão 47
    },
    {
        titulo: 'Educação Ambiental – Foco Específico',
        manter: 38, // Manter questão 38
        remover: 48  // Remover questão 48
    },
    {
        titulo: 'Temas de Educação Ambiental – Exclusão',
        manter: 39, // Manter questão 39
        remover: 49  // Remover questão 49
    },
    {
        titulo: 'Formas de Ação de Educação Ambiental',
        manter: 40, // Manter questão 40
        remover: 50  // Remover questão 50
    }
];

// Dividir o conteúdo em linhas
const linhas = conteudo.split('\n');
let novoConteudo = [];
let dentroQuestao = false;
let questaoAtual = null;
let questaoCompleta = [];
let questoesRemovidas = [];

// Processar linha por linha
for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    
    // Verificar se é início de uma questão
    if (linha.match(/^## Questão \d+$/)) {
        // Se estava processando uma questão anterior, salvá-la
        if (dentroQuestao && questaoAtual) {
            novoConteudo.push(...questaoCompleta);
            questaoCompleta = [];
        }
        
        // Extrair número da questão
        const match = linha.match(/## Questão (\d+)/);
        if (match) {
            questaoAtual = parseInt(match[1]);
            dentroQuestao = true;
            questaoCompleta = [linha];
        }
    } else if (dentroQuestao) {
        questaoCompleta.push(linha);
        
        // Verificar se chegou ao final da questão (próxima questão ou fim do arquivo)
        if (i === linhas.length - 1 || linhas[i + 1].match(/^## Questão \d+$/)) {
            // Verificar se esta questão deve ser removida
            const deveRemover = duplicatas.find(d => d.remover === questaoAtual);
            
            if (deveRemover) {
                console.log(`❌ Removendo questão ${questaoAtual}: ${deveRemover.titulo}`);
                questoesRemovidas.push(questaoAtual);
            } else {
                // Manter a questão
                novoConteudo.push(...questaoCompleta);
            }
            
            dentroQuestao = false;
            questaoAtual = null;
            questaoCompleta = [];
        }
    } else {
        // Linhas fora de questões (cabeçalho, rodapé, etc.)
        novoConteudo.push(linha);
    }
}

// Renumerar as questões sequencialmente
let novaQuestao = 1;
const conteudoFinal = novoConteudo.map(linha => {
    if (linha.match(/^## Questão \d+$/)) {
        const novaLinha = `## Questão ${novaQuestao}`;
        novaQuestao++;
        return novaLinha;
    }
    return linha;
});

// Atualizar o resumo final
let conteudoString = conteudoFinal.join('\n');

// Atualizar o total de questões no resumo
conteudoString = conteudoString.replace(
    /### \*\*Total de Questões Consolidadas:\*\* \d+/,
    `### **Total de Questões Consolidadas:** ${novaQuestao - 1}`
);

// Atualizar a distribuição por módulos no resumo
conteudoString = conteudoString.replace(
    /### \*\*Distribuição por Módulos:\*\*/,
    `### **Distribuição por Módulos (após remoção de duplicatas):**`
);

// Salvar o arquivo limpo
fs.writeFileSync('MRS/Questoes_Av_Final_Padronizadas_COMPLETO_LIMPO.md', conteudoString, 'utf8');

console.log('\n📊 RESUMO DA LIMPEZA:');
console.log('=====================');
console.log(`✅ Questões removidas: ${questoesRemovidas.join(', ')}`);
console.log(`📋 Total de questões únicas: ${novaQuestao - 1}`);
console.log(`📄 Arquivo limpo salvo: MRS/Questoes_Av_Final_Padronizadas_COMPLETO_LIMPO.md`);

// Verificar se há outras duplicatas
const titulos = [];
const duplicatasRestantes = [];

conteudoFinal.forEach(linha => {
    if (linha.includes(' - Módulo ')) {
        const titulo = linha.split(' - Módulo ')[0].trim();
        if (titulos.includes(titulo)) {
            duplicatasRestantes.push(titulo);
        } else {
            titulos.push(titulo);
        }
    }
});

if (duplicatasRestantes.length > 0) {
    console.log(`\n⚠️  ATENÇÃO: Ainda há duplicatas restantes:`);
    duplicatasRestantes.forEach(titulo => console.log(`   - ${titulo}`));
} else {
    console.log(`\n✅ Nenhuma duplicata restante encontrada!`);
} 