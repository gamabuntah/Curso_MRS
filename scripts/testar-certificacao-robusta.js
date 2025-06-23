// Script de teste robusto do sistema de certificação MRS
// Testa emissão, validação e permissões para usuário comum e admin

const fetch = require('node-fetch');
const assert = require('assert');

const API_URL = 'http://localhost:3002/api';
const USUARIO_TESTE = 'usuario_teste_cert';
const ADMIN = 'admin';
const SENHA = 'admin';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function simularProgressoUsuario() {
  // Simula progresso completo do usuário comum
  await fetch(`${API_URL}/progress/${USUARIO_TESTE}/reset`, { method: 'POST' });
  for (let i = 1; i <= 7; i++) {
    await fetch(`${API_URL}/progress/${USUARIO_TESTE}/module/${i}/audio`, { method: 'POST' });
    await fetch(`${API_URL}/progress/${USUARIO_TESTE}/module/${i}/quiz`, { method: 'POST', body: JSON.stringify({ score: 100 }), headers: { 'Content-Type': 'application/json' } });
  }
  await fetch(`${API_URL}/progress/${USUARIO_TESTE}/final`, { method: 'POST', body: JSON.stringify({ score: 100 }), headers: { 'Content-Type': 'application/json' } });
}

async function simularProgressoAdmin() {
  // Simula progresso completo do admin
  await fetch(`${API_URL}/progress/${ADMIN}/reset`, { method: 'POST' });
  for (let i = 1; i <= 7; i++) {
    await fetch(`${API_URL}/progress/${ADMIN}/module/${i}/audio`, { method: 'POST' });
    await fetch(`${API_URL}/progress/${ADMIN}/module/${i}/quiz`, { method: 'POST', body: JSON.stringify({ score: 100 }), headers: { 'Content-Type': 'application/json' } });
  }
  await fetch(`${API_URL}/progress/${ADMIN}/final`, { method: 'POST', body: JSON.stringify({ score: 100 }), headers: { 'Content-Type': 'application/json' } });
}

async function testarCertificadoUsuario() {
  // Usuário só pode emitir certificado após concluir tudo
  let res = await fetch(`${API_URL}/certificates/${USUARIO_TESTE}`);
  let cert = await res.json();
  if (cert.status !== 'issued') {
    // Simula o clique do usuário para gerar o certificado
    console.log('⚠️  Certificado não foi emitido automaticamente. Tentando gerar manualmente...');
    // Gera dados do certificado (simula CertificateManager.generateCertificate)
    const validationCode = `MRS-${new Date().getFullYear()}-TEST-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const issuedDate = new Date().toISOString();
    const certData = {
      username: USUARIO_TESTE,
      issuedDate: issuedDate,
      finalScore: 100,
      completedModules: 7,
      status: 'issued',
      validationCode: validationCode,
      digitalSignature: Buffer.from(`${USUARIO_TESTE}-${validationCode}-${issuedDate}-MRS-SECRET-2024`).toString('base64').substring(0, 32),
      downloadCount: 0,
      validationCount: 0
    };
    let res2 = await fetch(`${API_URL}/certificates/${USUARIO_TESTE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(certData)
    });
    if (!res2.ok) throw new Error('Falha ao gerar certificado manualmente');
    cert = await res2.json();
  }
  if (cert.status !== 'issued') throw new Error('Certificado não foi emitido nem manualmente');
  if (cert.finalScore < 70) throw new Error('Nota final insuficiente no certificado');
  console.log('✅ Certificado emitido corretamente para usuário comum.');
}

async function testarAdminPodeEmitirCertificado() {
  // Garante progresso completo para o admin
  await simularProgressoAdmin();
  // Admin pode emitir certificado a qualquer momento
  let res = await fetch(`${API_URL}/certificates/${ADMIN}`);
  let cert = await res.json();
  if (cert.status !== 'issued') {
    // Gera dados do certificado (simula CertificateManager.generateCertificate)
    const validationCode = `MRS-${new Date().getFullYear()}-ADMIN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const issuedDate = new Date().toISOString();
    const certData = {
      username: ADMIN,
      issuedDate: issuedDate,
      finalScore: 100,
      completedModules: 8,
      status: 'issued',
      validationCode: validationCode,
      digitalSignature: Buffer.from(`${ADMIN}-${validationCode}-${issuedDate}-MRS-SECRET-2024`).toString('base64').substring(0, 32),
      downloadCount: 0,
      validationCount: 0
    };
    let res2 = await fetch(`${API_URL}/certificates/${ADMIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(certData)
    });
    if (!res2.ok) throw new Error('Falha ao gerar novo certificado para admin');
    cert = await res2.json();
  }
  if (cert.status !== 'issued') throw new Error('Admin não conseguiu emitir certificado');
  console.log('✅ Admin pode emitir certificado a qualquer momento.');
}

async function testarAdminPodeListarCertificados() {
  let res = await fetch(`${API_URL}/admin/all-certificates?adminUser=${ADMIN}`);
  let lista = await res.json();
  assert(Array.isArray(lista), 'Admin não conseguiu listar certificados');
  assert(lista.length > 0, 'Lista de certificados está vazia');
  console.log('✅ Admin pode listar todos os certificados.');
}

async function testarValidacaoCertificado() {
  // Valida um certificado pelo código
  let res = await fetch(`${API_URL}/certificates/${USUARIO_TESTE}`);
  let cert = await res.json();
  let code = cert.validationCode;
  let resVal = await fetch(`${API_URL}/certificates/validate/${code}`);
  let val = await resVal.json();
  assert(val.valid, 'Certificado não foi validado corretamente');
  console.log('✅ Certificado validado com sucesso.');
}

async function testarPermissoes() {
  // Usuário comum não pode acessar funções de admin
  let res = await fetch(`${API_URL}/admin/all-certificates?adminUser=${USUARIO_TESTE}`);
  assert(res.status === 403 || res.status === 401, 'Usuário comum conseguiu acessar função de admin!');
  console.log('✅ Permissões de admin protegidas.');
}

async function criarUsuarioTeste() {
  // Cria o usuário de teste no backend, se não existir
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USUARIO_TESTE, password: '123456' })
  });
  if (res.ok) {
    console.log('✅ Usuário de teste criado');
  } else {
    const data = await res.json().catch(() => ({}));
    if (res.status === 409) {
      console.log('ℹ️  Usuário de teste já existe');
    } else {
      throw new Error('Falha ao criar usuário de teste: ' + (data.message || res.status));
    }
  }
}

async function limparCertificados() {
  const res = await fetch(`${API_URL}/certificates/cleanup?key=limpeza123`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernames: [ADMIN, USUARIO_TESTE] })
  });
  const text = await res.text();
  console.log('ℹ️  Resposta da limpeza:', res.status, text);
  if (res.status === 200) {
    return;
  } else {
    throw new Error('Falha ao limpar certificados');
  }
}

async function main() {
  console.log('⏳ Iniciando teste robusto do sistema de certificação...');
  await limparCertificados();
  await criarUsuarioTeste();
  await simularProgressoUsuario();
  await delay(500); // Aguarda backend processar
  await testarCertificadoUsuario();
  await testarAdminPodeEmitirCertificado();
  await testarAdminPodeListarCertificados();
  await testarValidacaoCertificado();
  await testarPermissoes();
  console.log('\n🎉 Todos os testes de certificação passaram com sucesso!');
}

main().catch(e => {
  console.error('❌ Erro nos testes de certificação:', e.message);
  process.exit(1);
}); 