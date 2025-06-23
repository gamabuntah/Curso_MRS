@echo off
title Sistema de Certificacao PNSB - Inicializacao Automatica
color 0A

echo.
echo ========================================
echo    SISTEMA DE CERTIFICACAO PNSB
echo ========================================
echo.
echo Iniciando sistema automaticamente...
echo.

:: Verificar se Node.js está instalado
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERRO: Node.js nao encontrado!
    echo.
    echo Para instalar o Node.js:
    echo 1. Acesse: https://nodejs.org/
    echo 2. Baixe a versao LTS
    echo 3. Instale normalmente
    echo 4. Execute este script novamente
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js encontrado!

:: Verificar se as dependências estão instaladas
echo.
echo [2/5] Verificando dependencias...
if not exist "backend\node_modules" (
    echo Instalando dependencias do backend...
    cd backend
    npm install
    cd ..
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependencias!
        echo Verifique a conexao com a internet e tente novamente.
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas!
) else (
    echo ✅ Dependencias ja instaladas!
)

:: Verificar se live-server está disponível
echo.
echo [3/5] Verificando live-server...
live-server --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ live-server nao encontrado globalmente
    echo Instalando localmente...
    npm install live-server
    if errorlevel 1 (
        echo ❌ Erro ao instalar live-server!
        echo Execute: instalar-dependencias-globais.bat
        pause
        exit /b 1
    )
    echo ✅ live-server instalado localmente!
) else (
    echo ✅ live-server encontrado!
)

:: Iniciar o backend
echo.
echo [4/5] Iniciando servidor backend...
start "Backend PNSB" cmd /k "cd /d %~dp0backend && node server.js"

:: Aguardar um pouco para o backend inicializar
timeout /t 3 /nobreak >nul

:: Verificar se o backend está rodando
echo Verificando se o backend esta respondendo...
curl -s http://localhost:3000/api/progress/admin >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Aguardando backend inicializar...
    timeout /t 5 /nobreak >nul
    curl -s http://localhost:3000/api/progress/admin >nul 2>&1
    if %errorlevel% neq 0 (
        echo ⚠️ Backend pode estar demorando para inicializar
        echo Continue aguardando...
    )
)

:: Iniciar o frontend
echo.
echo [5/5] Iniciando servidor frontend...
if exist "node_modules\.bin\live-server.cmd" (
    start "Frontend PNSB" cmd /k "cd /d %~dp0 && npx live-server --port=8000 public/"
) else (
    start "Frontend PNSB" cmd /k "cd /d %~dp0 && live-server --port=8000 public/"
)

:: Aguardar um pouco para o frontend inicializar
timeout /t 3 /nobreak >nul

:: Abrir o navegador automaticamente
echo.
echo ========================================
echo    SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo 🌐 Abrindo navegador automaticamente...
echo.
echo 📍 URLs do sistema:
echo    Frontend: http://localhost:8000
echo    Backend:  http://localhost:3000
echo.
echo 👥 Usuarios para teste:
echo    - Gustavo (usuario comum)
echo    - admin (administrador)
echo.
echo 💡 Dica: Feche este terminal quando terminar de usar o sistema
echo.

:: Abrir o navegador
start http://localhost:8000

echo Sistema pronto! Pressione qualquer tecla para sair...
pause >nul 