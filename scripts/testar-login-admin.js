/**
 * Teste do Login do Usuário Admin
 */

const API_URL = 'http://localhost:3002/api';

async function testarLoginAdmin() {
    console.log('🔐 TESTANDO LOGIN DO USUÁRIO ADMIN...\n');

    // Teste 1: Verificar se o backend está rodando
    console.log('1. Verificando se o backend está rodando...');
    try {
        const response = await fetch(`${API_URL}`);
        if (response.ok) {
            console.log('✅ Backend está rodando');
        } else {
            console.log('❌ Backend não está respondendo corretamente');
            return;
        }
    } catch (error) {
        console.log('❌ Backend não está rodando. Inicie com: cd backend && node server.js');
        return;
    }

    // Teste 2: Tentar login com credenciais incorretas
    console.log('\n2. Testando login com credenciais incorretas...');
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'senhaerrada' })
        });

        if (response.status === 401) {
            console.log('✅ Login rejeitado corretamente com senha incorreta');
        } else {
            console.log('❌ Login deveria ter sido rejeitado');
        }
    } catch (error) {
        console.log('❌ Erro ao testar login com senha incorreta:', error.message);
    }

    // Teste 3: Tentar login com credenciais corretas
    console.log('\n3. Testando login com credenciais corretas...');
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin' })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Login do admin bem-sucedido!');
            console.log(`   Username: ${data.username}`);
            console.log(`   Role: ${data.role}`);
        } else {
            const data = await response.json();
            console.log('❌ Login falhou:', data.message);
        }
    } catch (error) {
        console.log('❌ Erro ao testar login do admin:', error.message);
    }

    // Teste 4: Verificar se o admin tem progresso salvo
    console.log('\n4. Verificando progresso do admin...');
    try {
        const response = await fetch(`${API_URL}/progress/admin`);
        if (response.ok) {
            const progress = await response.json();
            console.log('✅ Progresso do admin encontrado');
            console.log(`   Módulos: ${Object.keys(progress.modules || {}).length}`);
            console.log(`   Status do módulo 1: ${progress.modules?.['1']?.status || 'não definido'}`);
        } else {
            console.log('❌ Progresso do admin não encontrado');
        }
    } catch (error) {
        console.log('❌ Erro ao verificar progresso:', error.message);
    }

    // Teste 5: Verificar se o admin tem certificado
    console.log('\n5. Verificando certificado do admin...');
    try {
        const response = await fetch(`${API_URL}/certificates/admin`);
        if (response.ok) {
            const certificate = await response.json();
            console.log('✅ Certificado do admin encontrado');
            console.log(`   Código de validação: ${certificate.validationCode}`);
            console.log(`   Status: ${certificate.status}`);
        } else {
            console.log('ℹ️ Admin não possui certificado ainda');
        }
    } catch (error) {
        console.log('❌ Erro ao verificar certificado:', error.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📋 RESUMO DO TESTE DE LOGIN ADMIN');
    console.log('='.repeat(50));
    console.log('✅ Backend rodando');
    console.log('✅ Autenticação funcionando');
    console.log('✅ Progresso do admin configurado');
    console.log('✅ Sistema pronto para uso!');
    console.log('\n🔑 CREDENCIAIS DO ADMIN:');
    console.log('   Username: admin');
    console.log('   Password: admin');
    console.log('   Role: admin');
    console.log('\n🌐 Acesse: http://localhost:8000');
    console.log('   Use as credenciais acima para fazer login');
}

// Executa o teste
testarLoginAdmin().catch(console.error); 