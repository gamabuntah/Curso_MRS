const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

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
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
  }

  const db = readDB();
  const userExists = db.users.find(user => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: 'Este nome de usuário já existe.' });
  }

  const newUser = {
    username,
    passwordHash: simpleHash(password),
    role: username.toLowerCase() === 'admin' ? 'admin' : 'user'
  };

  db.users.push(newUser);
  // Inicializa o progresso para o novo usuário
  db.progress[username] = {
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
    lastUpdated: new Date().toISOString()
  };
  writeDB(db);

  res.status(201).json({ message: 'Usuário criado com sucesso! Agora você pode entrar.' });
});

// Rota de Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
  }

  const db = readDB();
  const user = db.users.find(user => user.username === username);

  if (!user || user.passwordHash !== simpleHash(password)) {
    return res.status(401).json({ message: 'Nome de usuário ou senha inválidos.' });
  }

  res.status(200).json({ 
    message: 'Login bem-sucedido!', 
    username: user.username,
    role: user.role || 'user'
  });
});

// Rota para OBTER o progresso de um usuário
app.get('/api/progress/:username', (req, res) => {
  const { username } = req.params;
  const db = readDB();

  // Validação simples para segurança
  const user = db.users.find(u => u.username === username);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  let userProgress = db.progress[username];
  if (!userProgress || !userProgress.modules) {
    // Se não existir progresso ou estiver vazio, retorna estrutura padrão
    userProgress = {
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
      lastUpdated: new Date().toISOString()
    };
    db.progress[username] = userProgress;
    writeDB(db);
  }
  res.status(200).json(userProgress);
});

// Rota para SALVAR o progresso de um usuário
app.post('/api/progress/:username', (req, res) => {
  const { username } = req.params;
  const newProgress = req.body;

  const db = readDB();
  const user = db.users.find(u => u.username === username);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  db.progress[username] = updateModuleAvailability(newProgress);
  writeDB(db);

  res.status(200).json({ message: 'Progresso salvo com sucesso.' });
});

// --- ROTAS DE CERTIFICADOS ---

// Rota para GERAR um certificado
app.post('/api/certificates/:username', (req, res) => {
  const { username } = req.params;
  const certificateData = req.body;

  const db = readDB();
  const user = db.users.find(u => u.username === username);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  // Permite que admin gere certificado livremente
  if (user.role === 'admin') {
    // Remove qualquer certificado anterior do admin
    if (db.certificates) {
      for (const code of Object.keys(db.certificates)) {
        if (db.certificates[code].username === username) {
          delete db.certificates[code];
        }
      }
    } else {
      db.certificates = {};
    }
    db.certificates[certificateData.validationCode] = certificateData;
    writeDB(db);
    return res.status(201).json(certificateData);
  }

  // Verifica se já existe um certificado para este usuário
  const existingCertificate = Object.values(db.certificates || {}).find(
    cert => cert.username === username
  );

  if (existingCertificate) {
    return res.status(409).json({ 
      message: 'Usuário já possui um certificado.',
      certificate: existingCertificate
    });
  }

  // Salva o certificado
  if (!db.certificates) db.certificates = {};
  db.certificates[certificateData.validationCode] = certificateData;
  writeDB(db);

  res.status(201).json(certificateData);
});

// Rota para OBTER certificado de um usuário
app.get('/api/certificates/:username', (req, res) => {
  const { username } = req.params;
  const db = readDB();

  const user = db.users.find(u => u.username === username);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  const certificate = Object.values(db.certificates || {}).find(
    cert => cert.username === username
  );

  if (!certificate) {
    return res.status(404).json({ message: 'Certificado não encontrado.' });
  }

  res.status(200).json(certificate);
});

// Rota para VALIDAR um certificado pelo código
app.get('/api/certificates/validate/:validationCode', (req, res) => {
  const { validationCode } = req.params;
  const db = readDB();

  const certificate = db.certificates[validationCode];
  if (!certificate) {
    return res.status(404).json({ 
      valid: false, 
      error: 'Certificado não encontrado' 
    });
  }

  // Incrementa contador de validações
  certificate.validationCount = (certificate.validationCount || 0) + 1;
  writeDB(db);

  res.status(200).json({
    valid: true,
    certificate: {
      username: certificate.username,
      issuedDate: certificate.issuedDate,
      finalScore: certificate.finalScore,
      completedModules: certificate.completedModules,
      status: certificate.status,
      validationCount: certificate.validationCount
    }
  });
});

// Rota para incrementar download count
app.post('/api/certificates/:username/download', (req, res) => {
  const { username } = req.params;
  const db = readDB();

  const certificate = Object.values(db.certificates || {}).find(
    cert => cert.username === username
  );

  if (certificate) {
    certificate.downloadCount = (certificate.downloadCount || 0) + 1;
    writeDB(db);
  }

  res.status(200).json({ message: 'Download count atualizado.' });
});

// Rota para REVOGAR um certificado (apenas admin)
app.post('/api/certificates/:username/revoke', (req, res) => {
  const { username } = req.params;
  const { reason } = req.body;
  const adminUser = req.query.adminUser;
  const db = readDB();
  
  // Verifica se é admin
  const requester = db.users.find(u => u.username === adminUser);
  if (!requester || requester.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  
  try {
    // Garante que db.certificates exista antes de acessá-lo
    if (!db.certificates) {
      return res.status(404).json({ error: 'Nenhum certificado encontrado no sistema.' });
    }

    const certCode = Object.keys(db.certificates).find(code => db.certificates[code].username === username);
    
    if (!certCode) {
      return res.status(404).json({ error: `Certificado para o usuário '${username}' não encontrado.` });
    }
    
    db.certificates[certCode].status = 'revoked';
    db.certificates[certCode].revokedDate = new Date().toISOString();
    db.certificates[certCode].revokedBy = adminUser;
    db.certificates[certCode].revokeReason = reason || 'Revogado pelo administrador';
    
    // Salva no arquivo
    writeDB(db);
    
    res.json({ message: 'Certificado revogado com sucesso', certificate: db.certificates[certCode] });
  } catch (error) {
    console.error('Erro ao revogar certificado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// --- ROTAS DE ADMINISTRAÇÃO ---

// Rota de Admin para ver TODOS os certificados
app.get('/api/admin/all-certificates', (req, res) => {
    const { adminUser } = req.query;
    const db = readDB();
    const requester = db.users.find(u => u.username === adminUser);

    if (!requester || requester.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado.' });
    }

    const allCertificates = Object.values(db.certificates || {});
    res.status(200).json(allCertificates);
});

// Rota de Admin para ver o progresso de TODOS os usuários
app.get('/api/admin/all-progress', (req, res) => {
    const { adminUser } = req.query;
    const db = readDB();
    const requester = db.users.find(u => u.username === adminUser);

    if (!requester || requester.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado.' });
    }

    const allProgressWithDetails = Object.keys(db.progress).map(username => {
        const userProgress = db.progress[username];
        const completedModules = userProgress.modules 
            ? Object.values(userProgress.modules).filter(m => m.status === 'completed').length 
            : 0;
        const progressPercent = Math.round((completedModules / 8) * 100);
        
        return {
            username,
            progressPercent,
            completedModules,
            finalEvaluationScore: userProgress.final_evaluation?.score ?? 'N/A'
        };
    });
    
    res.status(200).json(allProgressWithDetails);
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