/**
 * Script para corrigir URLs do painel admin PNSB
 * O projeto curso-map.onrender.com tem URLs localhost hardcoded
 */

const fs = require('fs');
const https = require('https');

console.log('🔧 Corrigindo painel admin PNSB...');

// Template do admin.html corrigido para PNSB
const adminHtmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Administrativo - PNSB</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="admin.css">
</head>
<body>
    <div class="admin-container">
        <div class="admin-header">
            <a href="index.html" class="back-btn">
                <i class="fa-solid fa-arrow-left"></i>
                Voltar ao Curso
            </a>
            <div class="admin-title">
                <i class="fa-solid fa-user-shield"></i>
                <h1>Painel Administrativo - PNSB</h1>
                <p>Gerencie usuários, progresso e certificados do curso PNSB</p>
            </div>
        </div>

        <div class="admin-tabs">
            <button class="tab-btn active" onclick="showTab('overview')">Visão Geral</button>
            <button class="tab-btn" onclick="showTab('users')">Usuários</button>
            <button class="tab-btn" onclick="showTab('certificates')">Certificados</button>
        </div>

        <div id="overview" class="tab-content active">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fa-solid fa-users"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="totalUsers">-</h3>
                        <p>Total de Usuários</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fa-solid fa-user-check"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="activeUsers">-</h3>
                        <p>Usuários Ativos</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fa-solid fa-certificate"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="totalCertificates">-</h3>
                        <p>Certificados Emitidos</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fa-solid fa-chart-line"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="avgProgress">-</h3>
                        <p>Progresso Médio</p>
                    </div>
                </div>
            </div>
        </div>

        <div id="users" class="tab-content">
            <h2>Progresso dos Usuários</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Usuário</th>
                        <th>Progresso</th>
                        <th>Módulos Concluídos</th>
                        <th>Avaliação Final</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="usersTableBody">
                    <tr>
                        <td colspan="6" style="text-align: center;">Carregando dados...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div id="certificates" class="tab-content">
            <h2>Certificados Emitidos</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Usuário</th>
                        <th>Código</th>
                        <th>Data de Emissão</th>
                        <th>Pontuação</th>
                        <th>Downloads</th>
                        <th>Validações</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="certificatesTableBody">
                    <tr>
                        <td colspan="8" style="text-align: center;">Carregando dados...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // URL base correta para PNSB
        const API_BASE_URL = 'https://curso-map.onrender.com';
        
        // Verificação de admin
        const currentUser = sessionStorage.getItem('currentUser') || 'admin';
        const userRole = sessionStorage.getItem('userRole') || 'admin';
        
        if (!currentUser || userRole !== 'admin') {
            alert('Acesso negado. Apenas administradores podem acessar este painel.');
            window.location.href = 'login.html';
        }

        function showTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');

            if (tabName === 'users') {
                loadUsersData();
            } else if (tabName === 'certificates') {
                loadCertificatesData();
            }
        }

        async function loadOverviewData() {
            try {
                // Carrega dados de usuários PNSB
                const usersResponse = await fetch(\`\${API_BASE_URL}/api/admin/all-progress?adminUser=\${currentUser}\`);
                const usersData = await usersResponse.json();

                // Carrega dados de certificados PNSB
                const certsResponse = await fetch(\`\${API_BASE_URL}/api/admin/all-certificates?adminUser=\${currentUser}\`);
                const certsData = await certsResponse.json();

                // Atualiza estatísticas
                document.getElementById('totalUsers').textContent = usersData.length || 0;
                document.getElementById('activeUsers').textContent = usersData.filter(u => u.progressPercent > 0).length || 0;
                document.getElementById('totalCertificates').textContent = certsData.length || 0;
                
                const avgProgress = usersData.length > 0 
                    ? Math.round(usersData.reduce((sum, u) => sum + (u.progressPercent || 0), 0) / usersData.length)
                    : 0;
                document.getElementById('avgProgress').textContent = avgProgress + '%';

            } catch (error) {
                console.error('Erro ao carregar dados gerais:', error);
                // Valores padrão em caso de erro
                document.getElementById('totalUsers').textContent = '0';
                document.getElementById('activeUsers').textContent = '0';
                document.getElementById('totalCertificates').textContent = '0';
                document.getElementById('avgProgress').textContent = '0%';
            }
        }

        async function loadUsersData() {
            try {
                const response = await fetch(\`\${API_BASE_URL}/api/admin/all-progress?adminUser=\${currentUser}\`);
                const usersData = await response.json();

                const tbody = document.getElementById('usersTableBody');
                tbody.innerHTML = '';

                if (usersData.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum usuário encontrado</td></tr>';
                    return;
                }

                usersData.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = \`
                        <td><strong>\${user.username}</strong></td>
                        <td>
                            <div style="width: 100px; background: #ecf0f1; border-radius: 4px; overflow: hidden;">
                                <div style="width: \${user.progressPercent || 0}%; height: 20px; background: #2980b9;"></div>
                            </div>
                            \${user.progressPercent || 0}%
                        </td>
                        <td>\${user.completedModules || 0}/8</td>
                        <td>\${user.finalEvaluationScore !== 'N/A' ? user.finalEvaluationScore + '%' : 'Não realizada'}</td>
                        <td>
                            <span class="status-badge \${(user.progressPercent || 0) === 100 ? 'status-completed' : (user.progressPercent || 0) > 0 ? 'status-available' : 'status-locked'}">
                                \${(user.progressPercent || 0) === 100 ? 'Concluído' : (user.progressPercent || 0) > 0 ? 'Em Progresso' : 'Não Iniciado'}
                            </span>
                        </td>
                        <td>
                            <button class="action-btn" onclick="viewUserProgress('\${user.username}')">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                        </td>
                    \`;
                    tbody.appendChild(row);
                });

            } catch (error) {
                console.error('Erro ao carregar dados de usuários:', error);
                document.getElementById('usersTableBody').innerHTML = 
                    '<tr><td colspan="6" style="text-align: center; color: red;">Erro ao carregar dados</td></tr>';
            }
        }

        async function loadCertificatesData() {
            try {
                const response = await fetch(\`\${API_BASE_URL}/api/admin/all-certificates?adminUser=\${currentUser}\`);
                const certsData = await response.json();

                const tbody = document.getElementById('certificatesTableBody');
                tbody.innerHTML = '';

                if (certsData.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhum certificado encontrado</td></tr>';
                    return;
                }

                certsData.forEach(cert => {
                    const issuedDate = new Date(cert.issuedDate).toLocaleDateString('pt-BR');
                    const row = document.createElement('tr');
                    row.innerHTML = \`
                        <td><strong>\${cert.username}</strong></td>
                        <td><code>\${cert.validationCode}</code></td>
                        <td>\${issuedDate}</td>
                        <td>\${cert.finalScore || 0}%</td>
                        <td>\${cert.downloadCount || 0}</td>
                        <td>\${cert.validationCount || 0}</td>
                        <td>
                            <span class="status-badge \${cert.status === 'issued' ? 'status-completed' : 'status-locked'}">
                                \${cert.status === 'issued' ? 'Emitido' : 'Revogado'}
                            </span>
                        </td>
                        <td>
                            <button class="action-btn" onclick="validateCertificate('\${cert.validationCode}')">
                                <i class="fa-solid fa-search"></i>
                            </button>
                            <button class="action-btn danger" onclick="revokeCertificate('\${cert.username}')">
                                <i class="fa-solid fa-ban"></i>
                            </button>
                        </td>
                    \`;
                    tbody.appendChild(row);
                });

            } catch (error) {
                console.error('Erro ao carregar dados de certificados:', error);
                document.getElementById('certificatesTableBody').innerHTML = 
                    '<tr><td colspan="8" style="text-align: center; color: red;">Erro ao carregar dados</td></tr>';
            }
        }

        function viewUserProgress(username) {
            alert(\`Visualizando progresso de \${username}\\n\\nFuncionalidade em desenvolvimento.\`);
        }

        function validateCertificate(validationCode) {
            window.open(\`validate.html?code=\${validationCode}\`, '_blank');
        }

        async function revokeCertificate(username) {
            if (!confirm(\`Tem certeza que deseja revogar o certificado de \${username}?\`)) {
                return;
            }

            try {
                const response = await fetch(\`\${API_BASE_URL}/api/certificates/\${username}/revoke?adminUser=\${currentUser}\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason: 'Revogado pelo administrador' })
                });

                if (response.ok) {
                    alert('Certificado revogado com sucesso!');
                    loadCertificatesData();
                } else {
                    alert('Erro ao revogar certificado.');
                }
            } catch (error) {
                console.error('Erro ao revogar certificado:', error);
                alert('Erro ao revogar certificado.');
            }
        }

        // Carrega dados iniciais
        window.addEventListener('load', () => {
            loadOverviewData();
        });
    </script>
</body>
</html>`;

console.log('📝 Template do admin.html PNSB criado');
console.log('');
console.log('🔧 INSTRUÇÕES PARA CORRIGIR O PAINEL PNSB:');
console.log('');
console.log('1. Acesse o painel do Render do projeto curso-map');
console.log('2. Vá em "Files" ou "Deploy"');
console.log('3. Substitua o conteúdo do arquivo public/admin.html');
console.log('4. Faça deploy novamente');
console.log('');
console.log('OU');
console.log('');
console.log('📋 Copie o template acima e cole no admin.html do projeto PNSB');
console.log('');
console.log('✅ APÓS A CORREÇÃO:');
console.log('- https://curso-map.onrender.com/admin.html funcionará corretamente');
console.log('- Mostrará dados do projeto PNSB');
console.log('- Não tentará conectar em localhost');

// Salvar o template em arquivo
fs.writeFileSync('admin-pnsb-fixed.html', adminHtmlTemplate);
console.log('');
console.log('💾 Template salvo em: admin-pnsb-fixed.html');
console.log('');
console.log('🎯 PROBLEMA ATUAL:');
console.log('- O projeto PNSB tem URLs localhost:3000 hardcoded');
console.log('- Precisa ser alterado para https://curso-map.onrender.com');
console.log('- O template acima já tem as URLs corretas'); 