#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 LIMPANDO DADOS ANTIGOS DO PNSB...\n');

let limpezaOk = true;

// Função para remover arquivo ou pasta com segurança
function removerComSeguranca(caminho, descricao) {
    try {
        if (fs.existsSync(caminho)) {
            const stats = fs.statSync(caminho);
            
            if (stats.isDirectory()) {
                fs.rmSync(caminho, { recursive: true, force: true });
                console.log(`🗑️  Pasta removida: ${descricao}`);
            } else {
                fs.unlinkSync(caminho);
                console.log(`🗑️  Arquivo removido: ${descricao}`);
            }
            return true;
        } else {
            console.log(`ℹ️  ${descricao} - Não encontrado (já removido)`);
            return true;
        }
    } catch (error) {
        console.log(`❌ Erro ao remover ${descricao}: ${error.message}`);
        return false;
    }
}

// 1. Remover dados específicos do PNSB
const dadosParaRemover = [
    {
        caminho: 'public/data/module1.js',
        descricao: 'Módulo 1 PNSB'
    },
    {
        caminho: 'public/data/module2.js',
        descricao: 'Módulo 2 PNSB'
    },
    {
        caminho: 'public/data/module3.js',
        descricao: 'Módulo 3 PNSB'
    },
    {
        caminho: 'public/data/module4.js',
        descricao: 'Módulo 4 PNSB'
    },
    {
        caminho: 'public/data/module5.js',
        descricao: 'Módulo 5 PNSB'
    },
    {
        caminho: 'public/data/module6.js',
        descricao: 'Módulo 6 PNSB'
    },
    {
        caminho: 'public/data/module7.js',
        descricao: 'Módulo 7 PNSB'
    },
    {
        caminho: 'public/data/module8.js',
        descricao: 'Módulo 8 PNSB'
    },
    {
        caminho: 'public/data/avaliacaoFinal.js',
        descricao: 'Avaliação Final PNSB'
    }
];

console.log('📁 Removendo módulos e avaliação do PNSB:');
dadosParaRemover.forEach(item => {
    if (!removerComSeguranca(item.caminho, item.descricao)) {
        limpezaOk = false;
    }
});

// 2. Remover pasta MAP (conteúdo PNSB)
console.log('\n📂 Removendo pasta MAP (conteúdo PNSB):');
if (!removerComSeguranca('public/MAP', 'Pasta MAP (conteúdo PNSB)')) {
    limpezaOk = false;
}

// 3. Remover arquivos temporários se existirem
console.log('\n🗂️  Removendo arquivos temporários:');
const pastasTemporarias = ['scripts', 'public/data', 'public'];
const extensoesTemporarias = ['.tmp', '.bak', '.old', '.log'];
pastasTemporarias.forEach(pasta => {
    if (fs.existsSync(pasta)) {
        const arquivos = fs.readdirSync(pasta);
        arquivos.forEach(arquivo => {
            if (extensoesTemporarias.some(ext => arquivo.endsWith(ext))) {
                const caminho = path.join(pasta, arquivo);
                removerComSeguranca(caminho, `Arquivo temporário: ${arquivo}`);
            }
        });
    }
});

// 4. Verificar se a pasta data está limpa
console.log('\n🔍 Verificando pasta data:');
if (fs.existsSync('public/data')) {
    const arquivosData = fs.readdirSync('public/data');
    const arquivosRestantes = arquivosData.filter(arquivo =>
        !arquivo.match(/^module\d+\.js$/) &&
        arquivo !== 'avaliacaoFinal.js' &&
        !extensoesTemporarias.some(ext => arquivo.endsWith(ext))
    );
    if (arquivosRestantes.length === 0) {
        console.log('✅ Pasta data limpa - OK');
    } else {
        console.log(`ℹ️  Arquivos restantes na pasta data (não removidos): ${arquivosRestantes.join(', ')}`);
    }
} else {
    console.log('ℹ️  Pasta data não existe - será criada durante a transformação');
}

// 5. Verificar se não há referências ao PNSB em arquivos de configuração
console.log('\n⚙️  Verificando configurações:');
if (fs.existsSync('config-sistema.json')) {
    try {
        const config = JSON.parse(fs.readFileSync('config-sistema.json', 'utf8'));
        
        if (config.curso && config.curso.sigla === 'PNSB') {
            console.log('⚠️  Configuração ainda aponta para PNSB - será atualizada');
        } else {
            console.log('✅ Configuração não aponta para PNSB - OK');
        }
    } catch (error) {
        console.log('ℹ️  Configuração não pode ser lida - será recriada');
    }
}

// 6. Criar backup da limpeza (opcional)
console.log('\n💾 Criando registro da limpeza:');
const registroLimpeza = {
    data: new Date().toISOString(),
    arquivosRemovidos: dadosParaRemover.map(item => item.descricao),
    pastaMAPRemovida: true,
    status: limpezaOk ? 'SUCESSO' : 'COM_ERROS'
};

try {
    if (!fs.existsSync('logs')) {
        fs.mkdirSync('logs');
    }
    fs.writeFileSync('logs/limpeza-pnsb.json', JSON.stringify(registroLimpeza, null, 2));
    console.log('✅ Registro de limpeza salvo em logs/limpeza-pnsb.json');
} catch (error) {
    console.log('⚠️  Não foi possível salvar registro de limpeza');
}

// Resultado final
console.log('\n' + '='.repeat(50));

if (limpezaOk) {
    console.log('🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
    console.log('✅ Dados antigos do PNSB removidos.');
    console.log('✅ Sistema pronto para transformação MRS.');
    process.exit(0);
} else {
    console.log('⚠️  LIMPEZA CONCLUÍDA COM ALGUNS PROBLEMAS!');
    console.log('⚠️  Verifique os erros acima antes de continuar.');
    process.exit(1);
} 