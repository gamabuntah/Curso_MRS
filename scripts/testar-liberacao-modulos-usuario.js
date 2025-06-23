const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:3002';
const TEST_USER = `teste_liberacao_${Date.now()}`;
const TEST_PASS = '123456';

async function criarUsuario() {
    const res = await fetch(`${BACKEND_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: TEST_USER, password: TEST_PASS })
    });
    return res.ok;
}

async function loginUsuario() {
    const res = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: TEST_USER, password: TEST_PASS })
    });
    return res.ok;
}

async function getProgresso() {
    const res = await fetch(`${BACKEND_URL}/api/progress/${TEST_USER}`);
    return res.ok ? await res.json() : null;
}

async function setProgresso(progress) {
    const res = await fetch(`${BACKEND_URL}/api/progress/${TEST_USER}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progress)
    });
    return res.ok;
}

function getDefaultProgress() {
    const modules = {};
    for (let i = 1; i <= 7; i++) {
        modules[i.toString()] = { 
            status: i === 1 ? 'available' : 'locked', 
            score: null, 
            date: null, 
            audioCompleted: false
        };
    }
    return {
        modules,
        final_evaluation: { status: 'locked', score: null, date: null },
        certificate: { issued: false, date: null, final_score: null },
        lastUpdated: new Date().toISOString()
    };
}

function mostrarStatusModulos(progresso, etapa) {
    console.log(`\n📊 Status dos módulos - ${etapa}:`);
    for (let i = 1; i <= 7; i++) {
        const modulo = progresso.modules[i.toString()];
        console.log(`   Módulo ${i}: ${modulo.status} (score: ${modulo.score}, audio: ${modulo.audioCompleted})`);
    }
}

async function testarLiberacaoSequencial() {
    console.log('🔎 Testando liberação sequencial dos módulos para usuário comum...');
    console.log(`👤 Usuário de teste: ${TEST_USER}`);
    
    const usuarioCriado = await criarUsuario();
    if (!usuarioCriado) {
        console.log('❌ Falha ao criar usuário de teste.');
        return;
    }
    
    const loginOk = await loginUsuario();
    if (!loginOk) {
        console.log('❌ Falha no login do usuário de teste.');
        return;
    }
    
    let progresso = await getProgresso();
    if (!progresso || Object.keys(progresso).length === 0) {
        console.log('⚠️ Progresso vazio, inicializando manualmente...');
        progresso = getDefaultProgress();
        await setProgresso(progresso);
        progresso = await getProgresso();
    }
    
    mostrarStatusModulos(progresso, 'Inicialização');
    
    // Verifica se só o módulo 1 está disponível inicialmente
    let ok = progresso.modules['1'].status === 'available';
    for (let i = 2; i <= 7; i++) {
        ok = ok && progresso.modules[i.toString()].status === 'locked';
    }
    
    if (ok) {
        console.log('✅ Inicialização correta: só o módulo 1 está liberado.');
    } else {
        console.log('❌ Erro: Módulos liberados indevidamente na inicialização.');
        return;
    }
    
    // Simula conclusão do módulo 1 (quiz + áudio)
    console.log('\n🔄 Completando módulo 1...');
    progresso.modules['1'].score = 80;
    progresso.modules['1'].audioCompleted = true;
    progresso.modules['1'].status = 'completed';
    progresso.modules['1'].date = new Date().toISOString();
    
    const salvo1 = await setProgresso(progresso);
    if (!salvo1) {
        console.log('❌ Falha ao salvar progresso do módulo 1.');
        return;
    }
    
    progresso = await getProgresso();
    mostrarStatusModulos(progresso, 'Após completar módulo 1');
    
    // Verifica se módulo 2 foi liberado
    if (progresso.modules['2'].status === 'available') {
        console.log('✅ Liberação correta: módulo 2 liberado após completar módulo 1.');
    } else {
        console.log('❌ Erro: módulo 2 não foi liberado após completar módulo 1.');
        console.log(`   Status do módulo 2: ${progresso.modules['2'].status}`);
        return;
    }
    
    // Simula conclusão do módulo 2
    console.log('\n🔄 Completando módulo 2...');
    progresso.modules['2'].score = 80;
    progresso.modules['2'].audioCompleted = true;
    progresso.modules['2'].status = 'completed';
    progresso.modules['2'].date = new Date().toISOString();
    
    const salvo2 = await setProgresso(progresso);
    if (!salvo2) {
        console.log('❌ Falha ao salvar progresso do módulo 2.');
        return;
    }
    
    progresso = await getProgresso();
    mostrarStatusModulos(progresso, 'Após completar módulo 2');
    
    if (progresso.modules['3'].status === 'available') {
        console.log('✅ Liberação correta: módulo 3 liberado após completar módulo 2.');
    } else {
        console.log('❌ Erro: módulo 3 não foi liberado após completar módulo 2.');
        console.log(`   Status do módulo 3: ${progresso.modules['3'].status}`);
        return;
    }
    
    console.log('\n🎉 Teste de liberação sequencial concluído com sucesso!');
    console.log('✅ Sistema de liberação sequencial funcionando corretamente.');
}

testarLiberacaoSequencial(); 