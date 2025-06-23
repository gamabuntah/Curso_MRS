/**
 * Teste Específico do Sistema de Progresso MRS
 * Verifica se todas as funcionalidades do progresso estão funcionando
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 TESTANDO SISTEMA DE PROGRESSO MRS...\n');

// Função para simular o localStorage
global.localStorage = {
    data: {},
    getItem(key) {
        return this.data[key] || null;
    },
    setItem(key, value) {
        this.data[key] = value;
    },
    removeItem(key) {
        delete this.data[key];
    },
    clear() {
        this.data = {};
    }
};

// Função para simular fetch
global.fetch = async (url, options = {}) => {
    // Simula um backend que sempre responde com sucesso
    if (options.method === 'POST') {
        return {
            ok: true,
            status: 200,
            json: async () => ({ success: true })
        };
    } else {
        // GET request - retorna progresso vazio para novo usuário
        return {
            ok: false,
            status: 404
        };
    }
};

// Função para simular document
global.document = {
    body: {
        appendChild: () => {},
        removeChild: () => {}
    },
    querySelector: () => null,
    dispatchEvent: () => {}
};

// Carrega o ProgressManager
const progressManagerPath = path.join(__dirname, '../public/progress-manager.js');
let progressManagerCode = fs.readFileSync(progressManagerPath, 'utf8');

// Remove a declaração de classe e exporta para teste
progressManagerCode = progressManagerCode.replace('class ProgressManager {', 'class ProgressManager {');
progressManagerCode += '\nmodule.exports = ProgressManager;';

// Executa o código do ProgressManager
eval(progressManagerCode);

const ProgressManager = module.exports;

async function testarSistemaProgresso() {
    const resultados = {
        testes: [],
        erros: [],
        sucessos: 0,
        total: 0
    };

    function adicionarTeste(nome, resultado, erro = null) {
        resultados.total++;
        if (resultado) {
            resultados.sucessos++;
            console.log(`✅ ${nome}`);
        } else {
            resultados.erros.push({ nome, erro });
            console.log(`❌ ${nome}${erro ? ` - ${erro}` : ''}`);
        }
        resultados.testes.push({ nome, resultado });
    }

    try {
        // Teste 1: Criação do ProgressManager
        console.log('1. Testando criação do ProgressManager...');
        const pm = new ProgressManager('teste_usuario', 'user');
        adicionarTeste('Criação do ProgressManager', pm && pm.username === 'teste_usuario');

        // Teste 2: Inicialização
        console.log('\n2. Testando inicialização...');
        await pm.init();
        adicionarTeste('Inicialização do ProgressManager', pm.progress && pm.progress.modules);

        // Teste 3: Estrutura inicial
        console.log('\n3. Testando estrutura inicial...');
        const temModulo1 = pm.progress.modules['1'] && pm.progress.modules['1'].status === 'available';
        const temModulo2 = pm.progress.modules['2'] && pm.progress.modules['2'].status === 'locked';
        adicionarTeste('Módulo 1 disponível inicialmente', temModulo1);
        adicionarTeste('Módulo 2 bloqueado inicialmente', temModulo2);

        // Teste 4: Conclusão de quiz
        console.log('\n4. Testando conclusão de quiz...');
        await pm.completeQuiz('1', 85);
        const statusModulo1 = pm.getModuleStatus('1');
        adicionarTeste('Quiz aprovado (85%) - status correto', statusModulo1 === 'available');

        // Teste 5: Conclusão de áudio
        console.log('\n5. Testando conclusão de áudio...');
        await pm.markAudioAsCompleted('1');
        const statusFinalModulo1 = pm.getModuleStatus('1');
        adicionarTeste('Áudio concluído - módulo completo', statusFinalModulo1 === 'completed');

        // Teste 6: Desbloqueio do próximo módulo
        console.log('\n6. Testando desbloqueio sequencial...');
        const modulo2Status = pm.getModuleStatus('2');
        adicionarTeste('Módulo 2 desbloqueado após conclusão do 1', modulo2Status === 'available');

        // Teste 7: Quiz reprovado
        console.log('\n7. Testando quiz reprovado...');
        await pm.completeQuiz('2', 60);
        const statusModulo2Reprovado = pm.getModuleStatus('2');
        adicionarTeste('Quiz reprovado (60%) - status failed', statusModulo2Reprovado === 'failed');

        // Teste 8: Progresso geral
        console.log('\n8. Testando cálculo de progresso...');
        const progressoGeral = pm.getOverallProgress();
        adicionarTeste('Progresso geral calculado corretamente', progressoGeral === 12.5); // 1/8 = 12.5%

        // Teste 9: Acesso à avaliação final
        console.log('\n9. Testando acesso à avaliação final...');
        const podeAcessarFinal = pm.canAccessFinalEvaluation();
        adicionarTeste('Avaliação final bloqueada (apenas 1 módulo completo)', !podeAcessarFinal);

        // Teste 10: Conclusão de mais módulos
        console.log('\n10. Testando conclusão de múltiplos módulos...');
        for (let i = 2; i <= 6; i++) {
            await pm.completeQuiz(i.toString(), 85);
            await pm.markAudioAsCompleted(i.toString());
        }
        const podeAcessarFinalAgora = pm.canAccessFinalEvaluation();
        adicionarTeste('Avaliação final desbloqueada (6 módulos completos)', podeAcessarFinalAgora);

        // Teste 11: Avaliação final
        console.log('\n11. Testando avaliação final...');
        await pm.completeFinalEvaluation(75);
        const statusFinal = pm.progress.final_evaluation.status;
        adicionarTeste('Avaliação final aprovada', statusFinal === 'passed');

        // Teste 12: Certificado
        console.log('\n12. Testando geração de certificado...');
        const certificadoEmitido = pm.progress.certificate.issued;
        adicionarTeste('Certificado emitido após aprovação na final', certificadoEmitido);

        // Teste 13: Cache local
        console.log('\n13. Testando cache local...');
        const dadosLocais = localStorage.getItem('progress_teste_usuario');
        adicionarTeste('Dados salvos no cache local', dadosLocais !== null);

        // Teste 14: Reset de progresso
        console.log('\n14. Testando reset de progresso...');
        await pm.resetProgress();
        const statusAposReset = pm.getModuleStatus('1');
        adicionarTeste('Reset de progresso funcionando', statusAposReset === 'available');

    } catch (erro) {
        console.error('❌ Erro durante os testes:', erro);
        adicionarTeste('Execução geral dos testes', false, erro.message);
    }

    // Relatório final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RELATÓRIO FINAL DOS TESTES');
    console.log('='.repeat(50));
    console.log(`✅ Sucessos: ${resultados.sucessos}/${resultados.total}`);
    console.log(`❌ Falhas: ${resultados.erros.length}`);
    console.log(`📈 Taxa de sucesso: ${((resultados.sucessos / resultados.total) * 100).toFixed(1)}%`);

    if (resultados.erros.length > 0) {
        console.log('\n❌ ERROS ENCONTRADOS:');
        resultados.erros.forEach(erro => {
            console.log(`  - ${erro.nome}: ${erro.erro}`);
        });
    }

    // Salva relatório
    const relatorio = {
        timestamp: new Date().toISOString(),
        resultados,
        sistema: 'Progress Manager MRS'
    };

    fs.writeFileSync(
        path.join(__dirname, '../logs/teste-progresso.json'),
        JSON.stringify(relatorio, null, 2)
    );

    console.log('\n📄 Relatório salvo em: logs/teste-progresso.json');

    return resultados.sucessos === resultados.total;
}

// Executa os testes
testarSistemaProgresso().then(sucesso => {
    if (sucesso) {
        console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema de progresso funcionando corretamente.');
        process.exit(0);
    } else {
        console.log('\n⚠️ ALGUNS TESTES FALHARAM. Verifique os erros acima.');
        process.exit(1);
    }
}).catch(erro => {
    console.error('\n💥 ERRO CRÍTICO:', erro);
    process.exit(1);
}); 