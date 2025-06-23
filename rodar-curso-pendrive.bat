@echo off
chcp 65001 >nul
setlocal

REM === Script inteligente para rodar o Curso PNSB do pendrive ===

REM Caminho do backend e frontend
set BACKEND_DIR=backend
set FRONTEND_DIR=public
set BACKEND_PORT=3002
set FRONTEND_PORT=8000

REM Verifica Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js não está instalado!
    echo Baixe e instale o Node.js pelo link: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo [OK] Node.js encontrado.
)

REM Instala dependências se não existir node_modules
if not exist "%BACKEND_DIR%\node_modules" (
    echo Instalando dependências do backend...
    cd "%BACKEND_DIR%"
    call npm install
    cd ..
)

REM Inicia o backend
start "Backend" cmd /k "cd /d %~dp0%BACKEND_DIR% && node server.js"

REM Aguarda backend subir
ping 127.0.0.1 -n 4 >nul

REM Inicia o frontend (live-server)
where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] npx (Node.js) não encontrado. Instale o Node.js corretamente.
    pause
    exit /b 1
)
start "Frontend" cmd /k "cd /d %~dp0 && npx live-server --port=%FRONTEND_PORT% %FRONTEND_DIR%"

REM Aguarda frontend subir
ping 127.0.0.1 -n 3 >nul

REM Abre navegador na página inicial
start http://localhost:%FRONTEND_PORT%

echo =============================================
echo Curso PNSB iniciado com sucesso!
echo Backend:   http://localhost:%BACKEND_PORT%
echo Frontend:  http://localhost:%FRONTEND_PORT%
echo =============================================
echo Para parar, feche as janelas do terminal.
pause 