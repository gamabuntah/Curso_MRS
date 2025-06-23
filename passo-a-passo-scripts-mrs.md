# 🚀 PASSO A PASSO COMPLETO - TRANSFORMAÇÃO CURSO MRS

## 📋 RESUMO EXECUTIVO
Este documento detalha todos os scripts e operações necessárias para transformar o projeto PNSB atual em um sistema MRS (Manejo de Resíduos Sólidos), garantindo layout idêntico, qualidade preservada e robustez com testes automatizados.

---

## 🎯 OBJETIVO FINAL
Transformar o projeto atual em um sistema de curso MRS com:
- ✅ 7 módulos (vs 8 do PNSB)
- ✅ Layout 100% idêntico ao PNSB
- ✅ 15 questões por módulo + 50 na avaliação final
- ✅ Conversão inteligente de .txt para JSON
- ✅ Sistema de certificados e portabilidade
- ✅ Testes automatizados em cada etapa

---

## 🛠️ FASE 1: PREPARAÇÃO E VERIFICAÇÃO

### **PASSO 1.1: Verificação do Ambiente**
**Script:** `verificar-ambiente.js`
- Verifica Node.js, npm, permissões, portas livres, presença das pastas essenciais.
- **Validações:**
  - Node.js >= 14
  - npm disponível
  - Portas 3002/8001 livres
  - Pastas backend/, public/, MRS/ presentes
- **Exemplo de teste:**
```js
const { execSync } = require('child_process');
try { execSync('node --version'); } catch { throw new Error('Node.js não instalado!'); }
// ...demais verificações
```

### **PASSO 1.2: Análise dos Arquivos MRS**
**Script:** `analisar-arquivos-mrs.js`
- Confirma existência e integridade dos 7 arquivos .txt e 7 áudios .wav.
- **Validações:**
  - Todos os arquivos presentes
  - Tamanho mínimo esperado
  - Nomenclatura correta
- **Teste:**
```js
const fs = require('fs');
const arquivos = fs.readdirSync('MRS/').filter(f => f.endsWith('.txt'));
if (arquivos.length !== 7) throw new Error('Faltam arquivos .txt dos módulos!');
```

### **PASSO 1.3: Limpeza de Dados PNSB**
**Script:** `limpar-dados-pnsb.js`
- Remove dados antigos do PNSB.
- **Validações:**
  - Arquivos removidos com sucesso
  - Pasta public/MAP/ removida
- **Teste:**
```js
if (fs.existsSync('public/data/module1.js')) throw new Error('Arquivo não removido!');
```

---

## ⚙️ FASE 2: ADAPTAÇÃO DE CONFIGURAÇÕES

### **PASSO 2.1: Criação do config-sistema.json**
**Script:** `criar-config-mrs.js`
- Gera novo arquivo de configuração para o MRS.
- **Validações:**
  - Arquivo criado e válido
- **Teste:**
```js
const config = require('../config-sistema.json');
if (config.curso.sigla !== 'MRS') throw new Error('Configuração incorreta!');
```

### **PASSO 2.2: Adaptação do backend/server.js**
**Script:** `adaptar-backend.js`
- Altera porta, módulos e referências para MRS.
- **Validações:**
  - Porta correta
  - Referências a 7 módulos
- **Teste:**
```js
// Verificar se server.js está ouvindo na porta 3002
```

### **PASSO 2.3: Adaptação do public/script.js**
**Script:** `adaptar-frontend.js`
- Atualiza número de módulos, títulos e áudios.
- **Validações:**
  - 7 módulos listados
  - Títulos corretos
- **Teste:**
```js
// Verificar se todos os módulos aparecem na interface
```

### **PASSO 2.4: Adaptação do public/progress-manager.js**
**Script:** `adaptar-progress-manager.js`
- Ajusta lógica de progresso para 7 módulos.
- **Validações:**
  - Progresso correto
- **Teste:**
```js
// Simular progresso e verificar desbloqueio sequencial
```

---

## 🔄 FASE 3: CONVERSÃO .TXT → JSON

### **PASSO 3.1: Processamento dos Arquivos .txt**
**Script:** `processar-arquivos-txt.js`
- Lê, limpa e estrutura o conteúdo dos módulos de forma integral e fiel.
- **Algoritmo de Extração:**
```javascript
const fs = require('fs');
const path = require('path');

function processarArquivoTxt(caminhoArquivo, numeroModulo) {
    const conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
    
    // 1. Remover referências bibliográficas [1], [2], [3], etc.
    const conteudoLimpo = conteudo.replace(/\[\d+\]/g, '');
    
    // 2. Extrair título (primeira linha)
    const linhas = conteudoLimpo.split('\n');
    const titulo = linhas[0].trim();
    
    // 3. Extrair resumo (seção após "Resumo")
    const resumoMatch = conteudoLimpo.match(/Resumo\s*\n([\s\S]*?)(?=\d+\.\d+|$)/);
    const resumo = resumoMatch ? resumoMatch[1].trim() : '';
    
    // 4. Extrair seções numeradas (1.1, 1.2, 1.3, etc.)
    const secoes = [];
    const regexSecoes = /(\d+\.\d+)\s+([^\n]+)\n([\s\S]*?)(?=\d+\.\d+|$)/g;
    let match;
    
    while ((match = regexSecoes.exec(conteudoLimpo)) !== null) {
        secoes.push({
            numero: match[1],
            titulo: match[2].trim(),
            conteudo: match[3].trim()
        });
    }
    
    // 5. Extrair listas e elementos especiais
    const listas = extrairListas(conteudoLimpo);
    const exemplos = extrairExemplos(conteudoLimpo);
    const pontosCriticos = extrairPontosCriticos(conteudoLimpo);
    
    return {
        id: numeroModulo,
        titulo,
        resumo,
        secoes,
        listas,
        exemplos,
        pontosCriticos,
        audio: `Curso MRS - Mod ${numeroModulo}.wav`,
        conteudoOriginal: conteudoLimpo
    };
}

function extrairListas(conteudo) {
    const listas = [];
    const regexLista = /([•\-\*]\s+[^\n]+(?:\n[•\-\*]\s+[^\n]+)*)/g;
    let match;
    
    while ((match = regexLista.exec(conteudo)) !== null) {
        listas.push(match[1].trim());
    }
    
    return listas;
}

function extrairExemplos(conteudo) {
    const exemplos = [];
    const regexExemplo = /(?:por exemplo|como|caso|situação|exemplo)[:.]?\s*([^.\n]+)/gi;
    let match;
    
    while ((match = regexExemplo.exec(conteudo)) !== null) {
        exemplos.push(match[1].trim());
    }
    
    return exemplos;
}

function extrairPontosCriticos(conteudo) {
    const pontos = [];
    const regexPontos = /(?:importante|atenção|dica|nota|crítico)[:.]?\s*([^.\n]+)/gi;
    let match;
    
    while ((match = regexPontos.exec(conteudo)) !== null) {
        pontos.push(match[1].trim());
    }
    
    return pontos;
}
```
- **Validações:**
  - Todos os módulos processados
  - Referências removidas
  - Estrutura preservada
  - Conteúdo integral mantido
- **Teste:**
```js
// Verificar se não há [1], [2] no JSON gerado
// Verificar se todas as seções foram extraídas
// Verificar se o conteúdo está completo
```

### **PASSO 3.2: Criação de Cards Inteligentes**
**Script:** `criar-cards-inteligentes.js`
- Gera cards por tipo de forma inteligente baseada no conteúdo extraído.
- **Algoritmo de Criação Inteligente:**
```javascript
function criarCardsInteligentes(moduloProcessado) {
    const cards = [];
    
    // Card 1: Resumo (Sempre Presente)
    if (moduloProcessado.resumo) {
        cards.push({
            type: "default",
            title: "📋 Resumo do Módulo",
            content: moduloProcessado.resumo,
            icon: "📋"
        });
    }
    
    // Card 2: Conteúdo Principal (Sempre Presente)
    const conteudoPrincipal = moduloProcessado.secoes
        .map(secao => `**${secao.numero} ${secao.titulo}**\n\n${secao.conteudo}`)
        .join('\n\n');
    
    cards.push({
        type: "default",
        title: "📚 Conteúdo Principal",
        content: conteudoPrincipal,
        icon: "📚"
    });
    
    // Card 3: Dica (Opcional - Inteligente)
    if (moduloProcessado.pontosCriticos.length > 0) {
        const dicas = moduloProcessado.pontosCriticos
            .map(ponto => `• ${ponto}`)
            .join('\n');
        
        cards.push({
            type: "dica",
            title: "💡 Dicas Importantes",
            content: dicas,
            icon: "💡"
        });
    }
    
    // Card 4: Exemplo (Opcional - Inteligente)
    if (moduloProcessado.exemplos.length > 0) {
        const exemplos = moduloProcessado.exemplos
            .map(exemplo => `• ${exemplo}`)
            .join('\n');
        
        cards.push({
            type: "exemplo",
            title: "📝 Exemplos Práticos",
            content: exemplos,
            icon: "📝"
        });
    }
    
    // Card 5: Dúvidas Frequentes (Opcional - Inteligente)
    if (moduloProcessado.secoes.length > 3 || moduloProcessado.listas.length > 2) {
        const duvidas = gerarDuvidasFrequentes(moduloProcessado);
        
        cards.push({
            type: "duvidas",
            title: "🗨️ Dúvidas Frequentes",
            content: duvidas,
            icon: "🗨️"
        });
    }
    
    // Card 6: Resumo Visual (Opcional - Inteligente)
    if (moduloProcessado.listas.length > 0) {
        const resumoVisual = criarResumoVisual(moduloProcessado);
        
        cards.push({
            type: "resumo visual",
            title: "📊 Resumo Visual",
            content: resumoVisual,
            icon: "📊"
        });
    }
    
    return cards;
}

function gerarDuvidasFrequentes(modulo) {
    const duvidas = [];
    
    // Gerar dúvidas baseadas no conteúdo
    if (modulo.titulo.includes('Legal')) {
        duvidas.push("❓ Quais são os principais aspectos legais do MRS?");
        duvidas.push("💡 Consulte a seção 3.1 sobre aspectos legais e a legislação aplicável.");
    }
    
    if (modulo.titulo.includes('Coleta')) {
        duvidas.push("❓ Como funciona a coleta seletiva?");
        duvidas.push("💡 Veja a seção 4.2 sobre coleta seletiva e as cores CONAMA.");
    }
    
    return duvidas.join('\n\n');
}

function criarResumoVisual(modulo) {
    const resumo = [];
    
    // Criar resumo visual baseado nas listas
    modulo.listas.forEach((lista, index) => {
        if (index < 3) { // Limitar a 3 listas principais
            resumo.push(lista);
        }
    });
    
    return resumo.join('\n\n');
}
```
- **Validações:**
  - Pelo menos 2 cards por módulo (resumo + conteúdo)
  - Cards especiais criados quando apropriado
  - Conteúdo fiel ao original
- **Teste:**
```js
// Verificar se todos os módulos têm card de resumo e conteúdo principal
// Verificar se cards especiais foram criados quando necessário
// Verificar se o conteúdo dos cards está correto
```

### **PASSO 3.3: Geração dos Arquivos JSON dos Módulos**
**Script:** `gerar-modulos-json.js`
- Salva arquivos JSON para cada módulo com estrutura completa.
- **Algoritmo de Geração:**
```javascript
function gerarArquivoModulo(moduloProcessado, cards) {
    const moduloJSON = {
        id: moduloProcessado.id,
        titulo: moduloProcessado.titulo,
        audio: moduloProcessado.audio,
        cards: cards,
        quiz: {
            questoes: [] // Será preenchido pelo script de questões
        },
        metadata: {
            secoes: moduloProcessado.secoes.length,
            listas: moduloProcessado.listas.length,
            exemplos: moduloProcessado.exemplos.length,
            pontosCriticos: moduloProcessado.pontosCriticos.length,
            dataGeracao: new Date().toISOString()
        }
    };
    
    // Salvar arquivo
    const caminhoArquivo = `public/data/module${moduloProcessado.id}.js`;
    const conteudoArquivo = `const module${moduloProcessado.id} = ${JSON.stringify(moduloJSON, null, 2)};\n\nif (typeof module !== 'undefined' && module.exports) {\n    module.exports = module${moduloProcessado.id};\n}`;
    
    fs.writeFileSync(caminhoArquivo, conteudoArquivo, 'utf8');
    console.log(`✅ Módulo ${moduloProcessado.id} gerado: ${caminhoArquivo}`);
    
    return moduloJSON;
}
```
- **Validações:**
  - 7 arquivos gerados
  - Estrutura JSON válida
  - Metadata incluída
- **Teste:**
```js
// Verificar existência dos arquivos public/data/moduleX.js
// Verificar se JSON é válido
// Verificar se metadata está presente
```

### **PASSO 3.4: Verificação da Estrutura dos Módulos (MELHORADO)**
**Script:** `verificar-estrutura-modulos.js`
- Analisa a estrutura atual dos módulos antes e depois da correção com validações robustas.
- **Melhorias implementadas:**
  - ✅ Validação de JSON apenas do objeto exportado (ignora o wrapper `module.exports`)
  - ✅ Extração robusta de título (verifica tanto `titulo` quanto `title`, mas só aceita `title`)
  - ✅ Verificação de metadata, quiz, cards e campos obrigatórios
  - ✅ Contagem de questões por módulo
  - ✅ Log detalhado salvo em arquivo JSON
  - ✅ Verificações abrangentes da estrutura
  - ✅ Não exibe mais alerta de JSON inválido para arquivos no formato Node.js
- **Validações:**
  - Presença de `module.exports`
  - Uso correto de `title` (não `titulo`)
  - Estrutura de cards válida
  - Presença de quizzes e feedbacks
  - Validade do JSON do objeto exportado
  - Presença de metadata
- **Exemplo de saída melhorada:**
```
🔍 module1.js:
  📝 Título: Introdução ao Saneamento Básico
  📊 Cards: 11
  ❓ Quizzes: 1
  ❓ Questões: 15
  📏 Tamanho: 15420 caracteres
  🔧 Estrutura:
    - module.exports: ✅
    - title: ✅
    - titulo: ✅
    - cards: ✅
    - quiz/quizzes: ✅
    - feedbacks: ✅
    - metadata: ✅
    - JSON válido: ✅
  ✅ Estrutura válida
```
- **Recomendação:**
  - Sempre execute `node scripts/verificar-estrutura-modulos.js` após a correção para garantir que todos os módulos estão padronizados.
- **Teste:**
```js
// Verificar se todos os módulos são analisados
// Verificar se problemas são identificados corretamente
// Verificar se relatório é gerado
// Verificar se log JSON é salvo
```

### **PASSO 3.5: Correção da Estrutura dos Módulos (MELHORADO)**
**Script:** `corrigir-estrutura-modulos.js`
- Corrige a estrutura dos módulos de forma segura e preservando conteúdo com método avançado.
- **Melhorias implementadas:**
  - ✅ Validação de JSON apenas do objeto exportado
  - ✅ Remoção total do campo `titulo` em todos os níveis (módulo, cards, quiz, metadata)
  - ✅ Método avançado de correção (parse JSON + reconstrução)
  - ✅ Fallback para método básico se necessário
  - ✅ Verificação de sucesso após correção
  - ✅ Sugestões de próximos passos
  - ✅ Melhor tratamento de erros
- **Recursos:**
  - Cria backup automático antes das alterações
  - Adiciona `module.exports` se necessário
  - Troca `titulo` por `title` (preservando conteúdo)
  - Remove qualquer campo `titulo` residual
  - Valida estrutura após correção
  - Gera log detalhado das alterações
  - Sugere próximos passos automaticamente
- **Medidas de Segurança:**
  - Backup automático em `backup-estrutura-modulos/`
  - Validação antes e depois das alterações
  - Log detalhado em `logs/correcao-estrutura-modulos.json`
  - Preservação total do conteúdo pedagógico
  - Validação JSON antes de salvar
- **Recomendação:**
  - Sempre execute `node scripts/verificar-estrutura-modulos.js` após a correção para garantir que todos os módulos estão padronizados.
- **Exemplo de saída:**
```
🔍 module1.js:
  📝 Título: Introdução ao Saneamento Básico
  📊 Cards: 11
  ❓ Quizzes: 1
  ❓ Questões: 15
  📏 Tamanho: 15420 caracteres
  🔧 Estrutura:
    - module.exports: ✅
    - title: ✅
    - titulo: ✅
    - cards: ✅
    - quiz/quizzes: ✅
    - feedbacks: ✅
    - metadata: ✅
    - JSON válido: ✅
  ✅ Estrutura válida
```
- **Teste:**
```js
// Verificar se backup foi criado
// Verificar se estrutura foi corrigida
// Verificar se conteúdo foi preservado
// Verificar se JSON é válido
// Verificar se frontend carrega módulos corretamente
```

### **PASSO 3.6: Teste de Compatibilidade com Frontend (NOVO)**
**Script:** `testar-compatibilidade-frontend.js`
- Testa se os módulos corrigidos são compatíveis com o frontend, simulando o carregamento real.
- **Recursos:**
  - ✅ Simula carregamento como o frontend faria
  - ✅ Valida estrutura esperada pelo frontend
  - ✅ Testa campos obrigatórios (id, title, cards, quiz, metadata)
  - ✅ Verifica estrutura dos cards e questões
  - ✅ Suporte para teste de módulo específico ou todos
  - ✅ Log detalhado dos testes
- **Validações:**
  - Módulo é um objeto válido
  - Campo `id` presente
  - Campo `title` presente (frontend espera este campo)
  - Campo `cards` é um array válido
  - Campo `audio` presente
  - Campo `quiz` presente com questões
  - Campo `metadata` presente
  - Estrutura dos cards válida
- **Algoritmo de Teste:**
```javascript
function simulateFrontendLoad(moduleFile) {
    // 1. Ler conteúdo do arquivo
    const content = fs.readFileSync(modulePath, 'utf8');
    
    // 2. Criar contexto isolado para executar o módulo
    const vm = require('vm');
    const context = {
        module: { exports: {} },
        exports: {},
        console: console
    };
    
    // 3. Executar o módulo no contexto isolado
    vm.runInNewContext(moduleCode, context);
    
    // 4. Obter o módulo exportado
    const moduleData = context.module.exports;
    
    // 5. Validar estrutura esperada pelo frontend
    const validation = validateModuleForFrontend(moduleData);
    
    return { success: true, moduleData, validation };
}
```
- **Exemplo de saída:**
```
🧪 Testando: module1.js
  📝 Título: Introdução ao Saneamento Básico
  📊 Cards: 11
  ❓ Questões: 15
  📏 Tamanho: 15420 caracteres
  ✅ Compatível com frontend
```
- **Uso:**
```bash
# Testar todos os módulos
node scripts/testar-compatibilidade-frontend.js

# Testar módulo específico
node scripts/testar-compatibilidade-frontend.js module1.js
```
- **Teste:**
```js
// Verificar se todos os módulos são carregados corretamente
// Verificar se estrutura é compatível com frontend
// Verificar se campos obrigatórios estão presentes
// Verificar se log JSON é salvo
```

---

## ❓ FASE 4: GERAÇÃO DE QUESTÕES

### **PASSO 4.1: Geração de Questões por Módulo**
**Script:** `gerar-questoes-modulos.js`
- Gera 15 questões por módulo baseadas no conteúdo extraído.
- **Algoritmo de Geração de Questões:**
```javascript
function gerarQuestoesModulo(moduloProcessado) {
    const questoes = [];
    
    // Gerar questões baseadas no título
    questoes.push(gerarQuestaoTitulo(moduloProcessado));
    
    // Gerar questões baseadas nas seções
    moduloProcessado.secoes.forEach(secao => {
        const questoesSecao = gerarQuestoesSecao(secao);
        questoes.push(...questoesSecao);
    });
    
    // Gerar questões baseadas nas listas
    moduloProcessado.listas.forEach(lista => {
        const questoesLista = gerarQuestoesLista(lista);
        questoes.push(...questoesLista);
    });
    
    // Limitar a 15 questões e embaralhar
    return embaralharQuestoes(questoes.slice(0, 15));
}

function gerarQuestaoTitulo(modulo) {
    return {
        pergunta: `Qual é o tema principal do ${modulo.titulo}?`,
        opcoes: [
            modulo.titulo,
            "Outro tema relacionado",
            "Tema não relacionado",
            "Nenhuma das alternativas"
        ],
        resposta: 0,
        explicacao: `O tema principal é "${modulo.titulo}" conforme indicado no título do módulo.`
    };
}
```
- **Validações:**
  - 15 questões por módulo
  - Questões baseadas no conteúdo real
  - Opções variadas e plausíveis
  - Explicações claras
- **Teste:**
```js
// Verificar se cada módulo tem 15 questões
// Verificar se questões são relevantes ao conteúdo
// Verificar se opções são variadas
```

### **PASSO 4.2: Geração da Avaliação Final**
**Script:** `gerar-avaliacao-final.js`
- Gera 50 questões da avaliação final baseadas em todos os módulos.
- **Algoritmo:**
```javascript
function gerarAvaliacaoFinal(todosModulos) {
    const questoes = [];
    
    // Pegar questões de todos os módulos
    todosModulos.forEach(modulo => {
        const questoesModulo = modulo.quiz.questoes;
        // Selecionar questões mais importantes
        const questoesImportantes = selecionarQuestoesImportantes(questoesModulo);
        questoes.push(...questoesImportantes);
    });
    
    // Adicionar questões interdisciplinares
    const questoesInterdisciplinares = gerarQuestoesInterdisciplinares(todosModulos);
    questoes.push(...questoesInterdisciplinares);
    
    // Limitar a 50 questões e embaralhar
    return embaralharQuestoes(questoes.slice(0, 50));
}

function selecionarQuestoesImportantes(questoes) {
    // Selecionar questões com maior peso ou relevância
    return questoes.filter(q => q.importancia > 0.7);
}

function gerarQuestoesInterdisciplinares(modulos) {
    const questoes = [];
    
    // Questões que relacionam conceitos de diferentes módulos
    questoes.push({
        pergunta: "Como os aspectos legais do MRS se relacionam com a coleta seletiva?",
        opcoes: [
            "A legislação define as cores e procedimentos da coleta seletiva",
            "Não há relação entre legislação e coleta",
            "Apenas a coleta define os aspectos legais",
            "A legislação é independente da operação"
        ],
        resposta: 0,
        explicacao: "A legislação ambiental define diretamente os procedimentos e cores da coleta seletiva conforme resoluções do CONAMA."
    });
    
    return questoes;
}
```
- **Validações:**
  - 50 questões no total
  - Questões de todos os módulos representadas
  - Questões interdisciplinares incluídas
  - Dificuldade balanceada
- **Teste:**
```js
// Verificar se há 50 questões
// Verificar se todos os módulos estão representados
// Verificar se há questões interdisciplinares
```

---

## 🎨 FASE 5: ADAPTAÇÃO DE LAYOUT

### **PASSO 5.1: Verificação do Layout**
**Script:** `verificar-layout.js`
- Verifica se o layout está funcionando corretamente com os novos módulos.
- **Validações:**
  - Todos os módulos aparecem na interface
  - Cards são exibidos corretamente
  - Navegação funciona
  - Responsividade mantida
- **Teste:**
```js
// Verificar se interface carrega todos os módulos
// Verificar se cards são exibidos
// Verificar se navegação funciona
```

### **PASSO 5.2: Adaptação do Layout**
**Script:** `adaptar-layout.js`
- Ajusta layout para 7 módulos se necessário.
- **Validações:**
  - Layout adaptado corretamente
  - Responsividade mantida
- **Teste:**
```js
// Verificar se layout está correto para 7 módulos
// Verificar se responsividade funciona
```

---

## 🔊 FASE 6: ÁUDIOS

### **PASSO 6.1: Cópia dos Áudios**
**Script:** `copiar-audios.js`
- Copia os 7 áudios .wav para a pasta correta.
- **Validações:**
  - 7 áudios copiados
  - Nomenclatura correta
- **Teste:**
```js
// Verificar se todos os áudios estão na pasta public/MRS/Audios/
// Verificar se nomenclatura está correta
```

---

## 🧪 FASE 7: TESTES

### **PASSO 7.1: Teste de Estrutura**
**Script:** `teste-completo-sistema.js`
- Testa toda a estrutura do sistema.
- **Validações:**
  - Todos os arquivos presentes
  - Estrutura JSON válida
  - Configurações corretas
- **Teste:**
```js
// Verificar se todos os arquivos necessários existem
// Verificar se JSONs são válidos
// Verificar se configurações estão corretas
```

### **PASSO 7.2: Teste de Funcionalidade**
**Script:** `validar-funcionalidades.js`
- Testa funcionalidades específicas do sistema.
- **Validações:**
  - Login funciona
  - Progresso salva
  - Certificados geram
- **Teste:**
```js
// Simular login
// Simular progresso
// Gerar certificado
```

### **PASSO 7.3: Teste de Conteúdo**
**Script:** `testar-conteudo.js`
- Verifica se o conteúdo está correto.
- **Validações:**
  - Conteúdo dos módulos correto
  - Questões relevantes
  - Áudios funcionam
- **Teste:**
```js
// Verificar se conteúdo dos módulos está correto
// Verificar se questões são relevantes
// Verificar se áudios funcionam
```

### **PASSO 7.4: Teste de Layout**
**Script:** `testar-layout.js`
- Testa se o layout está funcionando.
- **Validações:**
  - Layout responsivo
  - Navegação funciona
  - Cards exibidos corretamente
- **Teste:**
```js
// Verificar se layout está responsivo
// Verificar se navegação funciona
// Verificar se cards são exibidos
```

---

## 📦 FASE 8: FINALIZAÇÃO

### **PASSO 8.1: Organização Final**
**Script:** `organizar-final.js`
- Organiza arquivos finais e remove temporários.
- **Validações:**
  - Arquivos organizados
  - Temporários removidos
- **Teste:**
```js
// Verificar se arquivos estão organizados
// Verificar se temporários foram removidos
```

### **PASSO 8.2: Criação de Scripts de Uso**
**Script:** `criar-scripts-uso.js`
- Cria scripts para facilitar o uso do sistema.
- **Validações:**
  - Scripts criados
  - Funcionam corretamente
- **Teste:**
```js
// Verificar se scripts foram criados
// Verificar se funcionam
```

### **PASSO 8.3: Criação de Documentação**
**Script:** `criar-documentacao.js`
- Gera documentação do sistema.
- **Validações:**
  - Documentação gerada
  - Completa e clara
- **Teste:**
```js
// Verificar se documentação foi gerada
// Verificar se está completa
```

---

## 🚀 EXECUÇÃO COMPLETA

### **Ordem de Execução Recomendada:**

1. **FASE 1: Preparação**
   ```bash
   node scripts/verificar-ambiente.js
   node scripts/analisar-arquivos-mrs.js
   node scripts/limpar-dados-pnsb.js
   ```

2. **FASE 2: Adaptação**
   ```bash
   node scripts/criar-config-mrs.js
   node scripts/adaptar-backend.js
   node scripts/adaptar-frontend.js
   node scripts/adaptar-progress-manager.js
   ```

3. **FASE 3: Conversão**
   ```bash
   node scripts/processar-arquivos-txt.js
   node scripts/criar-cards-inteligentes.js
   node scripts/gerar-modulos-json.js
   node scripts/verificar-estrutura-modulos.js
   node scripts/corrigir-estrutura-modulos.js
   node scripts/testar-compatibilidade-frontend.js
   ```

4. **FASE 4: Questões**
   ```bash
   node scripts/gerar-questoes-modulos.js
   node scripts/gerar-avaliacao-final.js
   ```

5. **FASE 5: Layout**
   ```bash
   node scripts/verificar-layout.js
   node scripts/adaptar-layout.js
   ```

6. **FASE 6: Áudios**
   ```bash
   node scripts/copiar-audios.js
   ```

7. **FASE 7: Testes**
   ```bash
   node scripts/teste-completo-sistema.js
   node scripts/validar-funcionalidades.js
   node scripts/testar-conteudo.js
   node scripts/testar-layout.js
   ```

8. **FASE 8: Finalização**
   ```bash
   node scripts/organizar-final.js
   node scripts/criar-scripts-uso.js
   node scripts/criar-documentacao.js
   ```

### **Verificação Final:**
```bash
# Testar compatibilidade dos módulos com frontend
node scripts/testar-compatibilidade-frontend.js

# Testar sistema completo
node scripts/teste-completo-sistema.js

# Iniciar sistema
npx live-server --port=8000 public/
```

---

## 📊 RESULTADO ESPERADO

Após execução completa, o sistema terá:

✅ **7 módulos MRS** com conteúdo completo
✅ **Layout idêntico** ao PNSB original
✅ **15 questões** por módulo + 50 na avaliação final
✅ **Sistema de progresso** funcionando
✅ **Certificados** gerando corretamente
✅ **Áudios** funcionando
✅ **Responsividade** mantida
✅ **Portabilidade** garantida

---

## 🛡️ MEDIDAS DE SEGURANÇA

1. **Backups automáticos** em cada fase crítica
2. **Validações** em cada etapa
3. **Logs detalhados** de todas as operações
4. **Testes** automatizados em cada fase
5. **Reversibilidade** de todas as operações
6. **Validação JSON** antes e depois das operações
7. **Teste de compatibilidade** com frontend
8. **Verificação de estrutura** robusta dos módulos

---

## 📋 CHECKLIST DE FINALIZAÇÃO

- [ ] Todos os scripts executados com sucesso
- [ ] Sistema funcionando na porta 8000
- [ ] Backend funcionando na porta 3002
- [ ] Todos os módulos carregando corretamente
- [ ] Módulos compatíveis com frontend (teste de compatibilidade)
- [ ] Estrutura dos módulos validada
- [ ] Questões funcionando
- [ ] Progresso salvando
- [ ] Certificados gerando
- [ ] Áudios funcionando
- [ ] Layout responsivo
- [ ] Documentação completa

---

**🏆 SISTEMA DE SCRIPTS COMPLETO PARA TRANSFORMAÇÃO DO CURSO MRS! 🚀**

---

## 📁 ESTRUTURA DE PASTAS RECOMENDADA

Crie as seguintes pastas na raiz do projeto para organização dos scripts e logs:

```bash
mkdir scripts
mkdir logs
mkdir backup
```

---

## 📋 SCRIPT PRINCIPAL: transformar-para-mrs.bat

```batch
@echo off
chcp 65001 >nul
title Transformador de Sistema PNSB para MRS

echo.
echo ========================================
echo    TRANSFORMADOR PNSB → MRS
echo ========================================
echo.

:: Verificar ambiente
node scripts/verificar-ambiente.js
if errorlevel 1 (
    echo ❌ ERRO: Ambiente não adequado!
    pause
    exit /b 1
)

:: Analisar arquivos MRS
node scripts/analisar-arquivos-mrs.js
if errorlevel 1 (
    echo ❌ ERRO: Arquivos MRS não encontrados!
    pause
    exit /b 1
)

:: Executar todas as fases
echo 🚀 Iniciando transformação...
node scripts/limpar-dados-pnsb.js
node scripts/criar-config-mrs.js
node scripts/adaptar-backend.js
node scripts/adaptar-frontend.js
node scripts/adaptar-progress-manager.js
node scripts/processar-arquivos-txt.js
node scripts/criar-cards-inteligentes.js
node scripts/gerar-modulos-json.js
node scripts/verificar-estrutura-modulos.js
node scripts/corrigir-estrutura-modulos.js
node scripts/testar-compatibilidade-frontend.js
node scripts/gerar-questoes-modulos.js
node scripts/gerar-avaliacao-final.js
node scripts/verificar-layout.js
node scripts/adaptar-layout.js
node scripts/copiar-audios.js
node scripts/teste-completo-sistema.js
node scripts/validar-funcionalidades.js
node scripts/testar-conteudo.js
node scripts/testar-layout.js
node scripts/organizar-final.js
node scripts/criar-scripts-uso.js
node scripts/criar-documentacao.js

echo.
echo ✅ TRANSFORMAÇÃO CONCLUÍDA COM SUCESSO!
echo 🚀 Para iniciar: iniciar-sistema.bat
echo.
pause
```

---

## 🛠️ DETALHAMENTO DOS SCRIPTS DE ADAPTAÇÃO

### **adaptar-backend.js**
- Altera a porta do servidor para 3002 e ajusta referências para 7 módulos.
- **Exemplo de lógica:**
```js
const fs = require('fs');
const path = require('path');
const backendPath = path.join('backend', 'server.js');
let conteudo = fs.readFileSync(backendPath, 'utf8');
conteudo = conteudo.replace(/const PORT = \d+;/, 'const PORT = 3002;');
conteudo = conteudo.replace(/moduleCount = \d+/, 'moduleCount = 7');
fs.writeFileSync(backendPath, conteudo, 'utf8');
console.log('✅ Backend adaptado para MRS');
```
- **Validações:** Porta correta, referências a 7 módulos.

### **adaptar-frontend.js**
- Atualiza o número de módulos, títulos e áudios em public/script.js.
- **Exemplo de lógica:**
```js
const fs = require('fs');
const path = require('path');
const scriptPath = path.join('public', 'script.js');
let conteudo = fs.readFileSync(scriptPath, 'utf8');
conteudo = conteudo.replace(/const NUM_MODULOS = \d+;/, 'const NUM_MODULOS = 7;');
conteudo = conteudo.replace(/modulos = \[.*?\];/s, 'modulos = ["Módulo 1: ...", ..., "Módulo 7: ..."];');
fs.writeFileSync(scriptPath, conteudo, 'utf8');
console.log('✅ Frontend adaptado para MRS');
```
- **Validações:** 7 módulos, títulos corretos.

### **adaptar-progress-manager.js**
- Ajusta lógica de progresso para 7 módulos em public/progress-manager.js.
- **Exemplo de lógica:**
```js
const fs = require('fs');
const path = require('path');
const pmPath = path.join('public', 'progress-manager.js');
let conteudo = fs.readFileSync(pmPath, 'utf8');
conteudo = conteudo.replace(/const TOTAL_MODULOS = \d+;/, 'const TOTAL_MODULOS = 7;');
fs.writeFileSync(pmPath, conteudo, 'utf8');
console.log('✅ Progress manager adaptado para MRS');
```
- **Validações:** Progresso correto para 7 módulos.

---

## 🧹 SCRIPT DE EXCLUSÃO DE ARQUIVOS DESNECESSÁRIOS

### **Script:** `excluir-arquivos-desnecessarios.js`
- Remove arquivos temporários, backups intermediários, logs antigos e resíduos do PNSB que não são necessários para o MRS.
- **O que remover:**
  - Arquivos temporários gerados durante a transformação (ex: *.tmp, *.bak, *.old)
  - Backups intermediários (exceto backup final de entrega)
  - Logs antigos (opcional, manter apenas logs relevantes)
  - Arquivos do PNSB não utilizados no MRS (ex: módulos antigos, avaliações antigas, arquivos de dados não referenciados)
  - Qualquer arquivo de teste ou diagnóstico não essencial
- **Exemplo de código:**
```js
const fs = require('fs');
const path = require('path');

const arquivosParaExcluir = [
  // Exemplos de padrões e arquivos
  'public/data/module8.js',
  'public/data/avaliacaoFinalPNSB.js',
  'public/MAP/',
  '*.tmp', '*.bak', '*.old',
  'logs/old_logs/',
  'backup/intermediario/',
  // Adicione outros arquivos/pastas conforme necessário
];

function excluirArquivoOuPasta(alvo) {
  if (fs.existsSync(alvo)) {
    const stats = fs.statSync(alvo);
    if (stats.isDirectory()) {
      fs.rmSync(alvo, { recursive: true, force: true });
      console.log(`🗑️ Pasta removida: ${alvo}`);
    } else {
      fs.unlinkSync(alvo);
      console.log(`🗑️ Arquivo removido: ${alvo}`);
    }
  }
}

arquivosParaExcluir.forEach(alvo => {
  // Suporte a padrões simples
  if (alvo.includes('*')) {
    const dir = path.dirname(alvo);
    const pattern = new RegExp(alvo.replace('.', '\.').replace('*', '.*'));
    const arquivos = fs.readdirSync(dir === '.' ? './' : dir);
    arquivos.forEach(arquivo => {
      if (pattern.test(arquivo)) {
        excluirArquivoOuPasta(path.join(dir, arquivo));
      }
    });
  } else {
    excluirArquivoOuPasta(alvo);
  }
});
```
- **Validações:**
  - Todos os arquivos/pastas desnecessários removidos
  - Apenas arquivos não essenciais excluídos
  - Projeto final limpo e pronto para entrega
- **Teste:**
```js
// Verificar se arquivos temporários e resíduos do PNSB não existem mais
// Conferir se apenas arquivos essenciais permanecem
```
- **Recomendação:**
  - Execute este script ao final do processo, antes da entrega
  - Mantenha um backup do projeto antes da exclusão definitiva

---

**Com este script, o processo de transformação e limpeza do sistema MRS fica ainda mais seguro, profissional e pronto para entrega!** 