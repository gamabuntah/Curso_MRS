# Sistema de Certificação - Curso MRS (Manejo de Resíduos Sólidos)

Sistema completo para certificação online do curso de Manejo de Resíduos Sólidos (MRS), com backend Node.js, frontend web, banco de dados PostgreSQL e deploy gratuito no Render.

---

## 🚀 Funcionalidades
- Cadastro e login de usuários
- Progresso por módulos
- Avaliação final com 50 questões
- Geração e validação de certificados
- Painel administrativo
- Áudios e conteúdos integrados

---

## 📦 Requisitos
- Node.js 18+
- npm
- PostgreSQL 16 (local ou Render)

---

## 🖥️ Como rodar localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/seu-repo.git
   cd seu-repo
   ```
2. **Instale as dependências:**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```
3. **Configure o banco de dados:**
   - Crie um banco PostgreSQL local ou use o Render.
   - Copie a string de conexão (exemplo: `postgres://usuario:senha@host:porta/banco`).
   - Crie um arquivo `.env` na raiz com:
     ```env
     DATABASE_URL=postgres://usuario:senha@host:porta/banco
     PORT=3002
     ```
4. **Inicie o backend:**
   ```bash
   node backend/server.js
   ```
5. **Inicie o frontend:**
   ```bash
   npx live-server --port=8000 public/
   ```
6. **Acesse no navegador:**
   - [http://localhost:8000/](http://localhost:8000/)

---

## ☁️ Deploy gratuito no Render

1. **Crie conta no [Render](https://render.com/)**
2. **Conecte seu repositório GitHub**
3. **Crie um serviço Web (Node.js):**
   - Build command: `npm install`
   - Start command: `node backend/server.js`
4. **Crie um banco PostgreSQL gratuito no Render**
5. **Adicione a variável de ambiente `DATABASE_URL` no Render**
6. **Deploy automático a cada push no GitHub**

---

## ⚙️ Variáveis de ambiente principais
- `DATABASE_URL` — string de conexão do PostgreSQL
- `PORT` — porta do backend (padrão: 3002)

---

## 📝 Estrutura do projeto
- `backend/` — código do servidor Node.js/Express
- `public/` — frontend web (HTML, CSS, JS)
- `public/data/browser/questoes-otimizadas/` — questões e dados do curso
- `logs/` — logs do sistema (ignorado no Git)

---

## 👨‍💻 Contato
Dúvidas, sugestões ou bugs? Abra uma issue ou envie e-mail para: [seu-email@dominio.com]

---

> Projeto open source para fins educacionais. Sinta-se livre para adaptar e contribuir! 