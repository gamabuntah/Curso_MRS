#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🎵 COPIANDO ÁUDIOS PARA O SISTEMA FINAL...\n');

let audiosOk = true;
const logOperacoes = [];

// Função para calcular hash MD5 de um arquivo
function calcularHash(arquivo) {
    try {
        const conteudo = fs.readFileSync(arquivo);
        return crypto.createHash('md5').update(conteudo).digest('hex');
    } catch (error) {
        return null;
    }
}

// Função para verificar espaço em disco
function verificarEspacoDisco(pasta, tamanhoNecessario) {
    try {
        const stats = fs.statSync(pasta);
        const statsDisco = fs.statfsSync ? fs.statfsSync(pasta) : null;
        
        if (statsDisco) {
            const espacoLivre = statsDisco.bavail * statsDisco.bsize;
            return espacoLivre >= tamanhoNecessario;
        }
        
        // Fallback: verificar se conseguimos escrever um arquivo de teste
        const arquivoTeste = path.join(pasta, '.teste-espaco');
        fs.writeFileSync(arquivoTeste, 'teste');
        fs.unlinkSync(arquivoTeste);
        return true;
    } catch (error) {
        return false;
    }
}

// Função para formatar tamanho em MB
function formatarTamanho(bytes) {
    return Math.round(bytes / (1024 * 1024));
}

// Função para criar backup
function criarBackup(arquivo) {
    try {
        const backupPath = arquivo + '.backup-' + new Date().toISOString().replace(/[:.]/g, '-');
        fs.copyFileSync(arquivo, backupPath);
        return backupPath;
    } catch (error) {
        return null;
    }
}

const audiosEsperados = [
    'Curso MRS - Mod 1.wav',
    'Curso MRS - Mod 2.wav',
    'Curso MRS - Mod 3.wav',
    'Curso MRS - Mod 4.wav',
    'Curso MRS - Mod 5.wav',
    'Curso MRS - Mod 6.wav',
    'Curso MRS - Mod 7.wav'
];

const origem = path.join('MRS', 'Audios');
const destino = path.join('public', 'MRS', 'Audios');

// Verificar se pasta de origem existe
if (!fs.existsSync(origem)) {
    console.log(`❌ Pasta de origem não encontrada: ${origem}`);
    process.exit(1);
}

// Calcular tamanho total necessário
let tamanhoTotal = 0;
const audiosExistentes = [];

audiosEsperados.forEach(audio => {
    const origemAudio = path.join(origem, audio);
    if (fs.existsSync(origemAudio)) {
        const stats = fs.statSync(origemAudio);
        tamanhoTotal += stats.size;
        audiosExistentes.push({ nome: audio, tamanho: stats.size, origem: origemAudio });
    }
});

console.log(`📊 Tamanho total necessário: ${formatarTamanho(tamanhoTotal)}MB`);

// Verificar espaço em disco
if (!verificarEspacoDisco(destino, tamanhoTotal)) {
    console.log(`❌ Espaço insuficiente em disco para copiar ${formatarTamanho(tamanhoTotal)}MB`);
    process.exit(1);
}

// Criar pasta de destino se não existir
if (!fs.existsSync(destino)) {
    fs.mkdirSync(destino, { recursive: true });
    console.log('✅ Pasta de destino criada:', destino);
}

// Processar cada áudio
audiosExistentes.forEach(({ nome: audio, tamanho, origem: origemAudio }) => {
    const destinoAudio = path.join(destino, audio);
    const tamanhoMB = formatarTamanho(tamanho);
    
    console.log(`\n📝 Processando: ${audio} (${tamanhoMB}MB)`);
    
    try {
        // Verificar se arquivo de destino já existe
        if (fs.existsSync(destinoAudio)) {
            const hashOrigem = calcularHash(origemAudio);
            const hashDestino = calcularHash(destinoAudio);
            
            if (hashOrigem && hashDestino && hashOrigem === hashDestino) {
                console.log(`✅ ${audio} já existe e é idêntico (pulado)`);
                logOperacoes.push({
                    audio,
                    status: 'pulado_identico',
                    tamanho: tamanhoMB,
                    hash: hashOrigem
                });
                return;
            } else {
                // Criar backup antes de sobrescrever
                const backupPath = criarBackup(destinoAudio);
                if (backupPath) {
                    console.log(`💾 Backup criado: ${backupPath}`);
                }
            }
        }
        
        // Copiar arquivo
        fs.copyFileSync(origemAudio, destinoAudio);
        
        // Verificar integridade após cópia
        const hashOrigem = calcularHash(origemAudio);
        const hashDestino = calcularHash(destinoAudio);
        
        if (hashOrigem && hashDestino && hashOrigem === hashDestino) {
            console.log(`✅ ${audio} copiado com sucesso (${tamanhoMB}MB)`);
            console.log(`🔍 Hash MD5: ${hashOrigem.substring(0, 8)}...`);
            
            logOperacoes.push({
                audio,
                status: 'copiado_sucesso',
                tamanho: tamanhoMB,
                hash: hashOrigem,
                backup: fs.existsSync(destinoAudio + '.backup-') ? 'criado' : null
            });
        } else {
            console.log(`❌ ${audio} - Falha na verificação de integridade`);
            audiosOk = false;
            logOperacoes.push({
                audio,
                status: 'erro_integridade',
                tamanho: tamanhoMB,
                erro: 'Hash não confere após cópia'
            });
        }
        
    } catch (error) {
        console.log(`❌ Erro ao copiar ${audio}: ${error.message}`);
        audiosOk = false;
        logOperacoes.push({
            audio,
            status: 'erro_copia',
            tamanho: tamanhoMB,
            erro: error.message
        });
    }
});

// Verificar áudios não encontrados
const audiosNaoEncontrados = audiosEsperados.filter(audio => 
    !audiosExistentes.find(a => a.nome === audio)
);

if (audiosNaoEncontrados.length > 0) {
    console.log('\n❌ ÁUDIOS NÃO ENCONTRADOS:');
    audiosNaoEncontrados.forEach(audio => {
        console.log(`   • ${audio}`);
        logOperacoes.push({
            audio,
            status: 'nao_encontrado',
            erro: 'Arquivo não existe na pasta de origem'
        });
    });
    audiosOk = false;
}

// Salvar log detalhado
try {
    if (!fs.existsSync('logs')) fs.mkdirSync('logs');
    const logPath = 'logs/copia-audios.json';
    fs.writeFileSync(logPath, JSON.stringify({
        data: new Date().toISOString(),
        origem,
        destino,
        totalAudios: audiosEsperados.length,
        audiosEncontrados: audiosExistentes.length,
        audiosNaoEncontrados: audiosNaoEncontrados.length,
        tamanhoTotal: formatarTamanho(tamanhoTotal),
        operacoes: logOperacoes
    }, null, 2));
    console.log(`\n📄 Log detalhado salvo em ${logPath}`);
} catch (e) {
    console.log(`\n⚠️  Não foi possível salvar o log: ${e.message}`);
}

// Resumo final
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO DA CÓPIA DE ÁUDIOS');
console.log('='.repeat(60));

const copiados = logOperacoes.filter(item => item.status === 'copiado_sucesso').length;
const pulados = logOperacoes.filter(item => item.status === 'pulado_identico').length;
const erros = logOperacoes.filter(item => item.status.includes('erro')).length;
const naoEncontrados = logOperacoes.filter(item => item.status === 'nao_encontrado').length;

console.log(`✅ Copiados: ${copiados}`);
console.log(`⏭️  Pulados (idênticos): ${pulados}`);
console.log(`❌ Erros: ${erros}`);
console.log(`🔍 Não encontrados: ${naoEncontrados}`);
console.log(`📁 Total processado: ${logOperacoes.length}`);
console.log(`💾 Tamanho total: ${formatarTamanho(tamanhoTotal)}MB`);

if (audiosOk && copiados + pulados === audiosEsperados.length) {
    console.log('\n🎉 TODOS OS ÁUDIOS PROCESSADOS COM SUCESSO!');
    console.log('💡 Backups criados para arquivos sobrescritos');
    process.exit(0);
} else if (copiados + pulados > 0) {
    console.log('\n⚠️  CÓPIA CONCLUÍDA COM ALGUNS PROBLEMAS!');
    process.exit(1);
} else {
    console.log('\n❌ NENHUM ÁUDIO FOI PROCESSADO COM SUCESSO!');
    process.exit(1);
} 