document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#progress-table tbody');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessageDiv = document.getElementById('error-message-admin');
    const refreshBtn = document.getElementById('refresh-btn');

    const currentUser = sessionStorage.getItem('currentUser');
    const userRole = sessionStorage.getItem('userRole');
    const API_URL = `http://localhost:3002/api/admin/all-progress?adminUser=${currentUser}`;

    // Função para mostrar mensagens
    const showMessage = (message, isError = true) => {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    };

    // Função para buscar e renderizar os dados
    const fetchData = async () => {
        // Mostra o loading, esconde a tabela
        loadingMessage.style.display = 'block';
        tableBody.innerHTML = '';
        errorMessageDiv.style.display = 'none';

        // Verifica se o usuário é admin antes de fazer a chamada
        if (userRole !== 'admin') {
            loadingMessage.style.display = 'none';
            showMessage('Acesso negado. Você não tem permissão para ver esta página.');
            return;
        }

        try {
            const response = await fetch(API_URL);
            const data = await response.json();

            loadingMessage.style.display = 'none';

            if (!response.ok) {
                showMessage(data.message || 'Ocorreu um erro ao buscar os dados.');
                return;
            }

            if (data.length === 0) {
                showMessage('Nenhum progresso de usuário encontrado ainda.', false);
                return;
            }

            // Popula a tabela
            data.forEach(user => {
                const row = document.createElement('tr');
                
                // Formata a nota final
                const finalScore = user.finalEvaluationScore !== 'N/A' ? `${user.finalEvaluationScore}%` : 'N/A';

                row.innerHTML = `
                    <td><strong>${user.username}</strong></td>
                    <td>
                        <div class="progress-bar-container-admin">
                            <div class="progress-bar-admin" style="width: ${user.progressPercent}%;">
                                ${user.progressPercent}%
                            </div>
                        </div>
                    </td>
                    <td>${user.completedModules} de 8</td>
                    <td>${finalScore}</td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            loadingMessage.style.display = 'none';
            showMessage('Não foi possível conectar ao servidor. Verifique se ele está rodando.');
        }
    };

    // Adiciona o event listener para o botão de atualizar
    refreshBtn.addEventListener('click', fetchData);

    // Busca os dados ao carregar a página
    fetchData();
}); 