const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:3002';
const TEST_USER = `teste_avaliacao_${Date.now()}`;
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

function completarModulo(progresso, moduloId) {
    progresso.modules[moduloId].score = 80;
    progresso.modules[moduloId].audioCompleted = true;
    progresso.modules[moduloId].status = 'completed';
    progresso.modules[moduloId].date = new Date().toISOString();
    return progresso;
}

function verificarAvaliacaoFinal(progresso) {
    const completedModules = Object.values(progresso.modules || {})
        .filter(module => module.status === 'completed').length;
    
    console.log(`📊 Módulos completados: ${completedModules}/7`);
    console.log(`🎯 Avaliação final: ${progresso.final_evaluation.status}`);
    
    if (completedModules >= 6) {
        return progresso.final_evaluation.status === 'available' || progresso.final_evaluation.status === 'locked';
    } else {
        return progresso.final_evaluation.status === 'locked';
    }
}

async function testarAvaliacaoFinal() {
    console.log('🔎 Testando liberação da avaliação final para usuário comum...');
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
    
    console.log('\n📋 TESTE 1: Avaliação final deve estar bloqueada inicialmente');
    let ok = verificarAvaliacaoFinal(progresso);
    if (ok && progresso.final_evaluation.status === 'locked') {
        console.log('✅ Avaliação final corretamente bloqueada no início.');
    } else {
        console.log('❌ Erro: Avaliação final não deveria estar liberada.');
        return;
    }
    
    console.log('\n🔄 Completando módulos 1-5...');
    for (let i = 1; i <= 5; i++) {
        progresso = completarModulo(progresso, i.toString());
        await setProgresso(progresso);
        progresso = await getProgresso();
        console.log(`   Módulo ${i} completado.`);
    }
    
    console.log('\n📋 TESTE 2: Com 5 módulos completos, avaliação final deve estar bloqueada');
    ok = verificarAvaliacaoFinal(progresso);
    if (ok && progresso.final_evaluation.status === 'locked') {
        console.log('✅ Avaliação final corretamente bloqueada com 5 módulos.');
    } else {
        console.log('❌ Erro: Avaliação final deveria estar bloqueada com 5 módulos.');
        return;
    }
    
    console.log('\n🔄 Completando módulo 6...');
    progresso = completarModulo(progresso, '6');
    await setProgresso(progresso);
    progresso = await getProgresso();
    
    console.log('\n📋 TESTE 3: Com 6 módulos completos, avaliação final deve estar liberada');
    ok = verificarAvaliacaoFinal(progresso);
    if (ok && progresso.final_evaluation.status === 'available') {
        console.log('✅ Avaliação final corretamente liberada com 6 módulos!');
    } else {
        console.log('❌ Erro: Avaliação final deveria estar liberada com 6 módulos.');
        console.log(`   Status atual: ${progresso.final_evaluation.status}`);
        return;
    }
    
    console.log('\n🔄 Completando módulo 7...');
    progresso = completarModulo(progresso, '7');
    await setProgresso(progresso);
    progresso = await getProgresso();
    
    console.log('\n📋 TESTE 4: Com todos os 7 módulos completos');
    ok = verificarAvaliacaoFinal(progresso);
    if (ok && progresso.final_evaluation.status === 'available') {
        console.log('✅ Avaliação final permanece liberada com todos os módulos!');
    } else {
        console.log('❌ Erro: Avaliação final deveria permanecer liberada.');
        return;
    }
    
    console.log('\n🎉 Teste da avaliação final concluído com sucesso!');
    console.log('✅ Sistema de liberação da avaliação final funcionando corretamente.');
    console.log('📋 Regra: 6+ módulos completos = Avaliação final liberada ✅');
}

testarAvaliacaoFinal(); 