document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const errorMessageDiv = document.getElementById('error-message');

    const API_URL = 'https://curso-mrs.onrender.com/api';
    let isLoading = false;

    // Função para mostrar mensagens de erro/sucesso
    const showMessage = (message, isError = true) => {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.color = isError ? '#e53e3e' : '#28a745';
        errorMessageDiv.style.backgroundColor = isError ? 'rgba(229, 62, 62, 0.1)' : 'rgba(40, 167, 69, 0.1)';
        errorMessageDiv.style.display = 'block';
    };

    // Função para limpar mensagem
    const clearMessage = () => {
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
    };

    // Mostra spinner no botão
    const setLoading = (btn, loading) => {
        isLoading = loading;
        btn.disabled = loading;
        btn.innerHTML = loading ? '<span class="spinner"></span> Aguarde...' : btn.dataset.label;
    };

    // Função para lidar com o login
    const handleLogin = async () => {
        if (isLoading) return;
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showMessage('Por favor, preencha todos os campos.');
            return;
        }
        setLoading(loginBtn, true);
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('currentUser', data.username);
                sessionStorage.setItem('userRole', data.role);
                window.location.href = 'index.html';
            } else {
                showMessage(data.message || 'Erro desconhecido no login.');
            }
        } catch (error) {
            showMessage('Não foi possível conectar ao servidor. Verifique se ele está rodando.');
        }
        setLoading(loginBtn, false);
    };

    // Função para lidar com o registro
    const handleRegister = async () => {
        if (isLoading) return;
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showMessage('Por favor, preencha todos os campos.');
            return;
        }
        setLoading(registerBtn, true);
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (response.status === 201) {
                showMessage(data.message, false); // Mensagem de sucesso
                passwordInput.value = '';
            } else {
                showMessage(data.message || 'Erro desconhecido no registro.');
            }
        } catch (error) {
            showMessage('Não foi possível conectar ao servidor. Verifique se ele está rodando.');
        }
        setLoading(registerBtn, false);
    };

    // Adiciona os event listeners
    loginBtn.dataset.label = 'Entrar';
    registerBtn.dataset.label = 'Criar Novo Usuário';
    loginBtn.addEventListener('click', handleLogin);
    registerBtn.addEventListener('click', handleRegister);

    // Permite "Enter" para logar
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    usernameInput.addEventListener('input', clearMessage);
    passwordInput.addEventListener('input', clearMessage);
});

// CSS Spinner (injetado via JS para garantir portabilidade)
const style = document.createElement('style');
style.innerHTML = `
.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 3px solid #ccc;
  border-top: 3px solid #2b2d3a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  vertical-align: middle;
  margin-right: 8px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
document.head.appendChild(style); 