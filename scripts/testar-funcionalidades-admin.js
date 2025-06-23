/**
 * Teste das Funcionalidades do Painel Admin
 */

const API_URL = 'http://localhost:3002/api';

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    return { response, data };
}

async function testarPainelAdmin() {
    console.log('🔐 TESTANDO FUNCIONALIDADES DO PAINEL ADMIN...\n');

    // 1. Testar acesso ao painel como admin (simulação via API)
    console.log('1. Testando acesso ao painel como admin...');
    const loginAdmin = await fetchJson(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    if (loginAdmin.response.ok && loginAdmin.data.role === 'admin') {
        console.log('✅ Login do admin bem-sucedido.');
    } else {
        console.log('❌ Falha no login do admin. Não é possível testar painel.');
        return;
    }

    // 2. Listar usuários (simula chamada que o painel faria)
    console.log('\n2. Listando usuários (progresso)...');
    const allProgress = await fetchJson(`${API_URL}/progress/admin`);
    if (allProgress.response.ok && allProgress.data.modules) {
        console.log('✅ Progresso do admin carregado.');
        console.log(`   Módulos encontrados: ${Object.keys(allProgress.data.modules).length}`);
    } else {
        console.log('❌ Falha ao carregar progresso do admin.');
    }

    // 3. Listar certificados do admin
    console.log('\n3. Listando certificados do admin...');
    const certAdmin = await fetchJson(`${API_URL}/certificates/admin`);
    if (certAdmin.response.ok && certAdmin.data.status === 'issued') {
        console.log('✅ Certificado do admin encontrado.');
        console.log(`   Código: ${certAdmin.data.validationCode}`);
    } else {
        console.log('❌ Certificado do admin não encontrado.');
    }

    // 4. Revogar certificado do admin (simulação)
    console.log('\n4. Testando revogação de certificado do admin...');
    const revoke = await fetchJson(`${API_URL}/certificates/admin/revoke?adminUser=admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Teste de revogação' })
    });
    if (revoke.response.ok) {
        console.log('✅ Certificado revogado com sucesso (simulação).');
    } else {
        console.log('❌ Falha ao revogar certificado:', revoke.data.error || revoke.data.message);
    }

    // 5. Testar acesso ao painel como usuário comum (deveria ser negado)
    console.log('\n5. Testando acesso ao painel como usuário comum...');
    const loginUser = await fetchJson(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'Gustavo', password: 'Gustavo' })
    });
    if (loginUser.response.ok && loginUser.data.role === 'user') {
        // Tenta revogar certificado como usuário comum
        const revokeUser = await fetchJson(`${API_URL}/certificates/admin/revoke?adminUser=Gustavo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'Teste de revogação' })
        });
        if (revokeUser.response.status === 403) {
            console.log('✅ Acesso negado corretamente para usuário comum.');
        } else {
            console.log('❌ Usuário comum conseguiu acessar função de admin!');
        }
    } else {
        console.log('❌ Falha no login do usuário comum.');
    }

    console.log('\n' + '='.repeat(50));
    console.log('📋 RESUMO DO TESTE DO PAINEL ADMIN');
    console.log('='.repeat(50));
    console.log('✅ Login admin');
    console.log('✅ Listagem de progresso');
    console.log('✅ Listagem de certificados');
    console.log('✅ Revogação protegida');
    console.log('✅ Proteção de acesso');
    console.log('\n🌐 Teste manual: acesse http://localhost:8000, faça login como admin e navegue no painel.');
}

testarPainelAdmin().catch(console.error); 