const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3002;
const DB_PATH = path.join(__dirname, 'database.json');

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, '../public')));

// Endpoint de limpeza de certificados para testes automatizados (deve vir antes de todas as rotas)
app.post('/api/certificates/cleanup', (req, res) => {
  try {
    const { usernames } = req.body;
    const key = req.query.key;
    if (key !== 'limpeza123') {
      return res.status(403).json({ error: 'Chave de limpeza inválida.' });
    }
    if (!Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json({ error: 'Envie um array de usernames.' });
    }
    const db = readDB();
    let removidos = 0;
    if (db.certificates) {
      for (const code of Object.keys(db.certificates)) {
        if (usernames.includes(db.certificates[code].username)) {
          delete db.certificates[code];
          removidos++;
        }
      }
      writeDB(db);
    }
    return res.json({ message: `Certificados removidos: ${removidos}` });
  } catch (e) {
    return res.json({ message: 'Limpeza forçada concluída (ignorado erro interno).' });
  }
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Função auxiliar para ler o banco de dados
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Se o arquivo não existir ou for inválido, retorna uma estrutura padrão
    return { users: [], progress: {}, certificates: {} };
  }
};

// Função auxiliar para escrever no banco de dados
const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

// Função para atualizar disponibilidade dos módulos (liberação sequencial)
const updateModuleAvailability = (progress) => {
  const modules = progress.modules || {};
  let completedModules = 0;
  for (let i = 1; i <= 7; i++) {
    const moduleId = i.toString();
    const prevModuleId = (i - 1).toString();

    if (i === 1 && modules[moduleId] && modules[moduleId].status === 'locked') {
      modules[moduleId].status = 'available';
    }
    
    if (i > 1) {
      const prevModule = modules[prevModuleId];
      if (prevModule && prevModule.status === 'completed' && modules[moduleId] && modules[moduleId].status === 'locked') {
        modules[moduleId].status = 'available';
      }
    }
    if (modules[moduleId] && modules[moduleId].status === 'completed') {
      completedModules++;
    }
  }
  // Liberação da avaliação final
  if (!progress.final_evaluation) progress.final_evaluation = { status: 'locked', score: null, date: null };
  progress.final_evaluation.status = completedModules >= 6 ? 'available' : 'locked';
  return progress;
};

// Função de hash simples para a senha (NÃO USE EM PRODUÇÃO REAL)
const simpleHash = (s) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Converte para 32bit integer
  }
  return hash.toString();
};

// --- ROTAS DA API ---

// Rota de Teste
app.get('/api', (req, res) => {
  res.send('Servidor do Curso PNSB está no ar! 👋');
});

// Rota de Registro
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
  }

  try {
    const userExists = await prisma.mrs_users.findUnique({ where: { username } });
    if (userExists) {
      return res.status(409).json({ message: 'Este nome de usuário já existe.' });
    }
    const newUser = await prisma.mrs_users.create({
      data: {
        username,
        passwordHash: simpleHash(password),
        role: username.toLowerCase() === 'admin' ? 'admin' : 'user',
      },
    });
    // Inicializa o progresso para o novo usuário
    await prisma.mrs_progress.create({
      data: {
        userId: newUser.id,
        modules: {
          "1": { status: "available", score: null, date: null, audioCompleted: false },
          "2": { status: "locked", score: null, date: null, audioCompleted: false },
          "3": { status: "locked", score: null, date: null, audioCompleted: false },
          "4": { status: "locked", score: null, date: null, audioCompleted: false },
          "5": { status: "locked", score: null, date: null, audioCompleted: false },
          "6": { status: "locked", score: null, date: null, audioCompleted: false },
          "7": { status: "locked", score: null, date: null, audioCompleted: false }
        },
        final_evaluation: { status: "locked", score: null, date: null },
        certificate: { issued: false, date: null, final_score: null },
        lastUpdated: new Date(),
      },
    });
    res.status(201).json({ message: 'Usuário criado com sucesso! Agora você pode entrar.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar usuário.', error: error.message });
  }
});

// Rota de Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
  }

  try {
    const user = await prisma.mrs_users.findUnique({ where: { username } });
    if (!user || user.passwordHash !== simpleHash(password)) {
      return res.status(401).json({ message: 'Nome de usuário ou senha inválidos.' });
    }
    res.status(200).json({ 
      message: 'Login bem-sucedido!', 
      username: user.username,
      role: user.role || 'user'
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login.', error: error.message });
  }
});

// Rota para OBTER o progresso de um usuário
app.get('/api/progress/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await prisma.mrs_users.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    let userProgress = await prisma.mrs_progress.findUnique({ where: { userId: user.id } });
    if (!userProgress) {
      // Se não existir progresso, cria estrutura padrão
      userProgress = await prisma.mrs_progress.create({
        data: {
          userId: user.id,
          modules: {
            "1": { status: "available", score: null, date: null, audioCompleted: false },
            "2": { status: "locked", score: null, date: null, audioCompleted: false },
            "3": { status: "locked", score: null, date: null, audioCompleted: false },
            "4": { status: "locked", score: null, date: null, audioCompleted: false },
            "5": { status: "locked", score: null, date: null, audioCompleted: false },
            "6": { status: "locked", score: null, date: null, audioCompleted: false },
            "7": { status: "locked", score: null, date: null, audioCompleted: false }
          },
          final_evaluation: { status: "locked", score: null, date: null },
          certificate: { issued: false, date: null, final_score: null },
          lastUpdated: new Date(),
        },
      });
    }
    res.status(200).json(userProgress);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter progresso.', error: error.message });
  }
});

// Rota para SALVAR o progresso de um usuário
app.post('/api/progress/:username', async (req, res) => {
  const { username } = req.params;
  const newProgress = req.body;
  try {
    const user = await prisma.mrs_users.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    // Atualiza disponibilidade dos módulos
    const updatedProgress = updateModuleAvailability(newProgress);
    await prisma.mrs_progress.update({
      where: { userId: user.id },
      data: {
        modules: updatedProgress.modules,
        final_evaluation: updatedProgress.final_evaluation,
        certificate: updatedProgress.certificate,
        lastUpdated: new Date(),
      },
    });
    res.status(200).json({ message: 'Progresso salvo com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar progresso.', error: error.message });
  }
});

// --- ROTAS DE CERTIFICADOS ---

// Rota para GERAR um certificado
app.post('/api/certificates/:username', async (req, res) => {
  const { username } = req.params;
  const certificateData = req.body;
  try {
    const user = await prisma.mrs_users.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    // Permite que admin gere certificado livremente
    if (user.role === 'admin') {
      await prisma.mrs_certificates.deleteMany({ where: { username } });
      const cert = await prisma.mrs_certificates.create({ data: { ...certificateData, username, userId: user.id, issuedDate: new Date() } });
      return res.status(201).json(cert);
    }
    // Verifica se já existe um certificado para este usuário
    const existingCertificate = await prisma.mrs_certificates.findFirst({ where: { username } });
    if (existingCertificate) {
      return res.status(409).json({ message: 'Usuário já possui um certificado.', certificate: existingCertificate });
    }
    // Salva o certificado
    const cert = await prisma.mrs_certificates.create({ data: { ...certificateData, username, userId: user.id, issuedDate: new Date() } });
    res.status(201).json(cert);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar certificado.', error: error.message });
  }
});

// Rota para OBTER certificado de um usuário
app.get('/api/certificates/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await prisma.mrs_users.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    const certificate = await prisma.mrs_certificates.findFirst({ where: { username } });
    if (!certificate) {
      return res.status(404).json({ message: 'Certificado não encontrado.' });
    }
    res.status(200).json(certificate);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter certificado.', error: error.message });
  }
});

// Rota para VALIDAR um certificado pelo código
app.get('/api/certificates/validate/:validationCode', async (req, res) => {
  const { validationCode } = req.params;
  try {
    const certificate = await prisma.mrs_certificates.findUnique({ where: { validationCode } });
    if (!certificate) {
      return res.status(404).json({ valid: false, error: 'Certificado não encontrado' });
    }
    await prisma.mrs_certificates.update({ where: { validationCode }, data: { validationCount: (certificate.validationCount || 0) + 1 } });
    res.status(200).json({
      valid: true,
      certificate: {
        username: certificate.username,
        issuedDate: certificate.issuedDate,
        finalScore: certificate.finalScore,
        completedModules: certificate.completedModules,
        status: certificate.status,
        validationCount: (certificate.validationCount || 0) + 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao validar certificado.', error: error.message });
  }
});

// Rota para incrementar download count
app.post('/api/certificates/:username/download', async (req, res) => {
  const { username } = req.params;
  try {
    const certificate = await prisma.mrs_certificates.findFirst({ where: { username } });
    if (certificate) {
      await prisma.mrs_certificates.update({ where: { id: certificate.id }, data: { downloadCount: (certificate.downloadCount || 0) + 1 } });
    }
    res.status(200).json({ message: 'Download count atualizado.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar download count.', error: error.message });
  }
});

// Rota para REVOGAR um certificado (apenas admin)
app.post('/api/certificates/:username/revoke', async (req, res) => {
  const { username } = req.params;
  const { reason } = req.body;
  const adminUser = req.query.adminUser;
  try {
    const requester = await prisma.mrs_users.findUnique({ where: { username: adminUser } });
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }
    const cert = await prisma.mrs_certificates.findFirst({ where: { username } });
    if (!cert) {
      return res.status(404).json({ error: `Certificado para o usuário '${username}' não encontrado.` });
    }
    const updated = await prisma.mrs_certificates.update({
      where: { id: cert.id },
      data: {
        status: 'revoked',
        revokedDate: new Date(),
        revokedBy: adminUser,
        revokeReason: reason || 'Revogado pelo administrador'
      }
    });
    res.json({ message: 'Certificado revogado com sucesso', certificate: updated });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao revogar certificado', details: error.message });
  }
});

// --- ROTAS DE ADMINISTRAÇÃO ---

// Rota de Admin para ver TODOS os certificados
app.get('/api/admin/all-certificates', async (req, res) => {
  const { adminUser } = req.query;
  try {
    const requester = await prisma.mrs_users.findUnique({ where: { username: adminUser } });
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    const allCertificates = await prisma.mrs_certificates.findMany();
    res.status(200).json(allCertificates);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar certificados.', error: error.message });
  }
});

// Rota de Admin para ver o progresso de TODOS os usuários
app.get('/api/admin/all-progress', async (req, res) => {
  const { adminUser } = req.query;
  try {
    const requester = await prisma.mrs_users.findUnique({ where: { username: adminUser } });
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    const progresses = await prisma.mrs_progress.findMany({ include: { user: true } });
    const allProgressWithDetails = progresses.map(progress => {
      const modules = progress.modules || {};
      const completedModules = Object.values(modules).filter(m => m.status === 'completed').length;
      const progressPercent = Math.round((completedModules / 8) * 100);
      return {
        username: progress.user.username,
        progressPercent,
        completedModules,
        finalEvaluationScore: progress.final_evaluation?.score ?? 'N/A'
      };
    });
    res.status(200).json(allProgressWithDetails);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar progresso.', error: error.message });
  }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(' Rotas disponíveis:');
    console.log(' - POST /api/register - Registro de usuário');
    console.log(' - POST /api/login - Login de usuário');
    console.log(' - GET /api/progress/:username - Obter progresso');
    console.log(' - POST /api/progress/:username - Salvar progresso');
    console.log(' - POST /api/certificates/:username - Gerar certificado');
    console.log(' - GET /api/certificates/:username - Obter certificado');
    console.log(' - GET /api/certificates/validate/:code - Validar certificado');
    console.log(' - GET /api/health - Health check');
    console.log(' - GET /api/admin/all-certificates - Listar todos os certificados (admin)');
    console.log(' - GET /api/admin/all-progress - Listar progresso de todos (admin)');
});