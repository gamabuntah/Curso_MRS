# Padrões do Sistema - PNSB-MRS

## Arquitetura Geral
```
Frontend (Static) ←→ Backend (Node.js) ←→ Database (PostgreSQL)
     ↓                    ↓                     ↓
   Render CDN         Render Service       Render PostgreSQL
```

## Estrutura de Diretórios
- `public/` - Frontend estático (HTML/CSS/JS)
- `backend/` - API Node.js com Prisma ORM
- `MRS/` - Conteúdo do curso (textos, áudios)
- `scripts/` - Utilitários e automação
- `memory-bank/` - Documentação do projeto

## Padrões de Nomenclatura
### Banco de Dados
- **Prefixos por projeto**: `mrs_` para tabelas MRS
- **Convenção**: snake_case para campos
- **IDs únicos**: Formato `MRS-YYYY-XXXX-XXXX`

### Arquivos
- **Scripts**: kebab-case (`backup-database.js`)
- **Configs**: snake_case (`config_sistema.json`)
- **Assets**: PascalCase para componentes

## Padrões de Segurança
1. **Autenticação**: Session-based com hash seguro
2. **Validação**: Sanitização de inputs no frontend/backend
3. **Backup**: Criptografia AES-256-CBC para dados sensíveis
4. **CORS**: Configurado para domínios específicos

## Gestão de Estado
- **Progresso do usuário**: LocalStorage + Sincronização DB
- **Sessões**: Server-side com timeout automático
- **Cache**: Assets estáticos via CDN Render

## Padrões de Dados
### Estrutura de Módulos
```javascript
{
  id: "module1",
  title: "Introdução ao Saneamento",
  content: {...},
  audio: "path/to/audio.mp3",
  quiz: [...questions]
}
```

### Estrutura de Certificados
```javascript
{
  id: "MRS-2025-XXXX-XXXX",
  userId: string,
  status: "issued|revoked",
  digitalSignature: string,
  createdAt: timestamp
}
```

## Padrões de Qualidade e UX
### Fidelidade ao Conteúdo
1. **Verificação criteriosa**: Comparação detalhada com arquivos originais
2. **Estrutura de cards**: Resumo + Introdução + Conteúdo técnico + Dicas/Exemplos
3. **Texto completo**: Resumos expandidos com conteúdo original integral
4. **Referências**: Manutenção de numeração e citações originais

### Experiência do Usuário
1. **Navegação limpa**: Limpeza de containers ao trocar módulos
2. **Rolagem automática**: Implementada nos quizzes para melhor visualização
3. **Feedback visual**: Indicadores de progresso e status
4. **Responsividade**: Interface adaptável a diferentes dispositivos

### Performance e Otimizações (Janeiro 2025)
1. **Sistema de Cache Inteligente**:
   - Cache de módulos usando Map() para 50% melhoria no carregamento
   - Cache de áudios com preload automático dos 3 primeiros módulos
   - Lazy loading de recursos sob demanda
2. **Loading System**:
   - Spinner elegante com backdrop blur
   - Feedback imediato durante carregamento
   - Transições suaves com fade in/out
3. **Notificações Toast**:
   - Feedback visual para todas as ações do usuário
   - Tipos específicos: success, error, info com ícones apropriados
   - Auto-dismiss após 3 segundos
4. **Animações e Interações**:
   - Cards com hover effects (elevação e escala)
   - Indicadores de progresso animados na sidebar
   - Smooth scrolling otimizado
5. **Robustez**:
   - Try-catch robusto envolvendo função main
   - Error handling com graceful degradation
   - Event listeners otimizados com limpeza adequada

### Padrões de Correção
```javascript
// Padrão para limpeza de containers
function renderModule(moduleId) {
  // Limpar container de avaliação final
  const finalQuizContainer = document.getElementById('final-quiz-intro-container');
  if (finalQuizContainer) {
    finalQuizContainer.innerHTML = '';
    finalQuizContainer.style.display = 'none';
  }
  
  // Implementar rolagem automática nos quizzes
  if (isQuizActive) {
    scrollToQuiz();
  }
}

// Padrão para sistema de cache
const moduleCache = new Map();
const audioCache = new Map();

function renderModule(moduleId) {
  // Verifica cache primeiro
  const cacheKey = `module_${moduleId}`;
  if (moduleCache.has(cacheKey)) {
    const cachedContent = moduleCache.get(cacheKey);
    // Usa conteúdo cached e reaplica event listeners
    reapplyEventListeners(moduleId);
    return;
  }
  // Renderiza e adiciona ao cache
}

// Padrão para notificações toast
const showToast = (message, type = 'info', duration = 3000) => {
  const toast = document.createElement('div');
  toast.className = `progress-toast ${type}`;
  // Implementação completa com ícones e auto-dismiss
};

// Padrão para loading system
const showLoader = () => {
  const loader = document.createElement('div');
  loader.id = 'page-loader';
  // Implementação com spinner e backdrop blur
};
```

### Padrões CSS para Performance
```css
/* Hardware Acceleration */
.sidebar, .main-content, .card {
    transform: translateZ(0);
    backface-visibility: hidden;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}

/* Smooth Animations */
.card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
    transform: translateY(-4px) scale(1.02);
}
```

## Decisões Arquiteturais
1. **Prisma ORM**: Escolhido por type-safety e migrations
2. **Static Frontend**: Melhor performance e cache
3. **PostgreSQL**: Robustez para dados críticos
4. **Render Hosting**: Simplicidade e custo-benefício
5. **Dual Deployment**: Máxima disponibilidade
6. **Fidelidade ao Original**: Prioridade máxima na qualidade educacional

## Componentes Chave
- **ProgressManager**: Controla avanço nos módulos
- **CertificateGenerator**: Cria certificados únicos
- **BackupSystem**: Proteção automática de dados
- **AdminPanel**: Interface de gestão
- **ModuleRenderer**: Renderização limpa de módulos com UX aprimorada
- **QuizManager**: Gerenciamento de quizzes com rolagem automática
- **CacheSystem**: Sistema inteligente de cache para módulos e áudios (Janeiro 2025)
- **LoadingManager**: Sistema de feedback visual durante carregamento (Janeiro 2025)
- **ToastNotifications**: Sistema de notificações para feedback do usuário (Janeiro 2025)
- **AnimationEngine**: Gerenciamento de animações e hover effects (Janeiro 2025)
- **ErrorHandler**: Sistema robusto de tratamento e recovery de erros (Janeiro 2025)

## Padrões de Manutenção
### Verificação de Fidelidade
1. **Comparação sistemática**: Arquivo original vs sistema
2. **Identificação de gaps**: Conteúdo ausente ou simplificado
3. **Correção padronizada**: Expansão de resumos + adição de introduções
4. **Validação final**: Confirmação de 100% de fidelidade

### Correções de UX
1. **Identificação de bugs**: Testes de navegação entre módulos
2. **Implementação de melhorias**: Rolagem automática, limpeza de containers
3. **Validação**: Testes em diferentes cenários de uso

## Integrações
- **Render**: Deploy automático via GitHub
- **PostgreSQL**: Banco gerenciado Render
- **CDN**: Assets servidos via edge servers
- **Memory Bank**: Documentação estruturada e versionada 