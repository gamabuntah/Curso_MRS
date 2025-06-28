# Contexto Técnico - PNSB-MRS

## Stack Tecnológico
### Frontend
- **HTML5/CSS3/JavaScript**: Interface web responsiva
- **Vanilla JS**: Sem frameworks para simplicidade
- **LocalStorage**: Cache local e estado da aplicação
- **Fetch API**: Comunicação com backend

### Backend
- **Node.js 18+**: Runtime JavaScript
- **Express.js**: Framework web minimalista
- **Prisma**: ORM com type-safety
- **CORS**: Controle de acesso cross-origin

### Banco de Dados
- **PostgreSQL**: Banco relacional gerenciado
- **Prisma Client**: Interface type-safe
- **Migrations**: Controle de versão do schema

### Hospedagem
- **Render**: Platform-as-a-Service
- **GitHub**: Controle de versão e deploy
- **Render PostgreSQL**: Banco gerenciado

## Dependências Principais
### Backend (`package.json`)
```json
{
  "@prisma/client": "^5.x",
  "prisma": "^5.x",
  "express": "^4.x",
  "cors": "^2.x",
  "bcrypt": "^5.x"
}
```

### Scripts de Utilitários
- **Node.js Built-ins**: `fs`, `path`, `crypto`
- **Sem dependências externas**: Máxima portabilidade

## Setup de Desenvolvimento
### Requisitos
- Node.js 18+ e npm
- Git para controle de versão  
- Editor de código (VSCode recomendado)
- Windows PowerShell (ambiente atual)

### Comandos Essenciais
```powershell
# Instalar dependências
npm install

# Executar servidor local
cd backend && npm start

# Sincronizar banco
npx prisma db push

# Gerar cliente Prisma
npx prisma generate

# Executar backup
node scripts/backup-database.js
```

## Configurações de Ambiente
### Variáveis (.env)
```
DATABASE_URL="postgresql://..."
NODE_ENV="production"
PORT="8080"
```

### Configuração do Sistema
```json
{
  "sistema": "PNSB-MRS",
  "versao": "1.0",
  "ambiente": "producao",
  "backup_automatico": true
}
```

## Estrutura de Deploy
### Render Configuration
- **Build Command**: `npm install && cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Environment**: Node.js 18
- **Auto-deploy**: Habilitado via GitHub

### Assets Estáticos
- Servidos diretamente pelo Express
- Path: `/public/*`
- Cache headers configurados

## Ferramentas de Desenvolvimento
- **Prisma Studio**: Interface visual do banco
- **Thunder Client**: Testes de API
- **Browser DevTools**: Debug frontend
- **PowerShell**: Automação Windows

## Constraints Técnicas
- **Render Limits**: 500MB storage, 1GB RAM
- **PostgreSQL**: 1GB database limit
- **Browser Support**: Chrome 90+, Firefox 88+
- **Mobile First**: Design responsivo obrigatório

## Scripts de Automação
- `backup-database.js`: Backup completo
- `secure-backup.js`: Backup criptografado  
- `monitor-database.js`: Health check
- `schedule-backup.bat`: Agendamento Windows

## Monitoramento
- **Render Dashboard**: Metrics e logs
- **Database Health**: Script de monitoramento
- **Backup Status**: Verificação automática
- **Uptime**: Monitoramento 24/7 