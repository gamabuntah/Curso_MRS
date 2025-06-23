#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Monitora a saúde do banco de dados
 */
async function monitorDatabase() {
    try {
        console.log('🔍 Monitorando saúde do banco de dados...\n');
        
        // 1. Teste de conectividade
        console.log('1. 🔗 Testando conectividade...');
        const startTime = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const connectionTime = Date.now() - startTime;
        console.log(`   ✅ Conectividade OK (${connectionTime}ms)\n`);
        
        // 2. Verificar estrutura das tabelas
        console.log('2. 🏗️  Verificando estrutura das tabelas...');
        const tables = ['mrs_users', 'mrs_progress', 'mrs_certificates'];
        
        for (const table of tables) {
            try {
                const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`   ✅ ${table}: ${result[0].count} registros`);
            } catch (error) {
                console.log(`   ❌ ${table}: Erro - ${error.message}`);
            }
        }
        console.log('');
        
        // 3. Verificar integridade referencial
        console.log('3. 🔗 Verificando integridade referencial...');
        const orphanedProgress = await prisma.$queryRaw`
            SELECT COUNT(*) as count 
            FROM mrs_progress 
            WHERE "userId" NOT IN (SELECT id FROM mrs_users)
        `;
        
        const orphanedCertificates = await prisma.$queryRaw`
            SELECT COUNT(*) as count 
            FROM mrs_certificates 
            WHERE "userId" NOT IN (SELECT id FROM mrs_users)
        `;
        
        console.log(`   Progresso órfão: ${orphanedProgress[0].count}`);
        console.log(`   Certificados órfãos: ${orphanedCertificates[0].count}`);
        
        if (orphanedProgress[0].count > 0 || orphanedCertificates[0].count > 0) {
            console.log('   ⚠️  Encontrados registros órfãos - considere limpeza');
        } else {
            console.log('   ✅ Integridade referencial OK');
        }
        console.log('');
        
        // 4. Verificar usuários ativos
        console.log('4. 👥 Estatísticas de usuários...');
        const userStats = await prisma.mrs_users.groupBy({
            by: ['role'],
            _count: { id: true }
        });
        
        userStats.forEach(stat => {
            console.log(`   ${stat.role}: ${stat._count.id} usuários`);
        });
        console.log('');
        
        // 5. Verificar certificados emitidos
        console.log('5. 🏆 Estatísticas de certificados...');
        const certificateStats = await prisma.mrs_certificates.groupBy({
            by: ['status'],
            _count: { id: true }
        });
        
        certificateStats.forEach(stat => {
            console.log(`   ${stat.status}: ${stat._count.id} certificados`);
        });
        
        // Certificados recentes (últimos 7 dias)
        const recentCertificates = await prisma.mrs_certificates.count({
            where: {
                issuedDate: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        });
        console.log(`   Emitidos nos últimos 7 dias: ${recentCertificates}`);
        console.log('');
        
        // 6. Verificar tamanho do banco
        console.log('6. 📊 Informações do banco...');
        try {
            const sizeInfo = await prisma.$queryRaw`
                SELECT 
                    pg_size_pretty(pg_database_size(current_database())) as database_size,
                    current_database() as database_name
            `;
            console.log(`   Banco: ${sizeInfo[0].database_name}`);
            console.log(`   Tamanho: ${sizeInfo[0].database_size}`);
        } catch (error) {
            console.log('   ⚠️  Não foi possível obter informações de tamanho');
        }
        console.log('');
        
        // 7. Salvar relatório
        const report = await generateReport();
        const reportPath = path.join(__dirname, '..', 'logs', `database-health-${new Date().toISOString().split('T')[0]}.json`);
        
        // Criar diretório de logs se não existir
        const logsDir = path.dirname(reportPath);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📋 Relatório salvo em: ${reportPath}`);
        
        console.log('\n✅ Monitoramento concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante monitoramento:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Gera relatório detalhado
 */
async function generateReport() {
    const report = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        checks: {}
    };
    
    try {
        // Conectividade
        const startTime = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        report.checks.connectivity = {
            status: 'OK',
            responseTime: Date.now() - startTime
        };
        
        // Contagem de tabelas
        const users = await prisma.mrs_users.count();
        const progress = await prisma.mrs_progress.count();
        const certificates = await prisma.mrs_certificates.count();
        
        report.checks.tables = {
            mrs_users: users,
            mrs_progress: progress,
            mrs_certificates: certificates
        };
        
        // Certificados por status
        const certificatesByStatus = await prisma.mrs_certificates.groupBy({
            by: ['status'],
            _count: { id: true }
        });
        
        report.checks.certificates = {};
        certificatesByStatus.forEach(stat => {
            report.checks.certificates[stat.status] = stat._count.id;
        });
        
        // Atividade recente
        const recentActivity = await prisma.mrs_certificates.count({
            where: {
                issuedDate: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // últimas 24h
                }
            }
        });
        
        report.checks.activity = {
            certificatesLast24h: recentActivity
        };
        
    } catch (error) {
        report.status = 'error';
        report.error = error.message;
    }
    
    return report;
}

/**
 * Executa limpeza de dados órfãos
 */
async function cleanupOrphanedData() {
    try {
        console.log('🧹 Iniciando limpeza de dados órfãos...');
        
        // Remover certificados órfãos
        const deletedCertificates = await prisma.mrs_certificates.deleteMany({
            where: {
                userId: {
                    notIn: await prisma.mrs_users.findMany({ select: { id: true } }).then(users => users.map(u => u.id))
                }
            }
        });
        
        // Remover progresso órfão
        const deletedProgress = await prisma.mrs_progress.deleteMany({
            where: {
                userId: {
                    notIn: await prisma.mrs_users.findMany({ select: { id: true } }).then(users => users.map(u => u.id))
                }
            }
        });
        
        console.log(`✅ Limpeza concluída:`);
        console.log(`   Certificados órfãos removidos: ${deletedCertificates.count}`);
        console.log(`   Progresso órfão removido: ${deletedProgress.count}`);
        
    } catch (error) {
        console.error('❌ Erro durante limpeza:', error.message);
        throw error;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const command = process.argv[2];
    
    switch (command) {
        case 'monitor':
        case undefined:
            monitorDatabase();
            break;
        case 'cleanup':
            cleanupOrphanedData();
            break;
        default:
            console.log('📖 Uso:');
            console.log('  node monitor-database.js monitor  - Monitorar saúde do banco');
            console.log('  node monitor-database.js cleanup  - Limpeza de dados órfãos');
    }
}

module.exports = { monitorDatabase, generateReport, cleanupOrphanedData }; 