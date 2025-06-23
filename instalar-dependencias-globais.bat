@echo off
title Instalacao de Dependencias Globais PNSB
color 0E

echo.
echo ========================================
echo    INSTALACAO DE DEPENDENCIAS GLOBAIS
echo ========================================
echo.
echo Este script instala as dependencias globais
echo necessarias para o sistema funcionar em qualquer
echo computador Windows.
echo.

:: Verificar se Node.js está instalado
echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Node.js nao encontrado!
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

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js encontrado: %NODE_VERSION%

:: Verificar se npm está instalado
echo.
echo [2/4] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm nao encontrado!
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm encontrado: %NPM_VERSION%

:: Instalar live-server globalmente
echo.
echo [3/4] Instalando live-server globalmente...
echo.
echo ⚠️ Esta operacao pode demorar alguns minutos...
echo.

npm install -g live-server
if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao instalar live-server!
    echo.
    echo Possiveis solucoes:
    echo 1. Execute como administrador
    echo 2. Verifique a conexao com a internet
    echo 3. Tente novamente
    echo.
    pause
    exit /b 1
)

echo ✅ live-server instalado com sucesso!

:: Verificar se o live-server foi instalado
echo.
echo [4/4] Verificando instalacao...
live-server --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ live-server nao foi instalado corretamente!
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('live-server --version') do set LIVE_SERVER_VERSION=%%i
echo ✅ live-server funcionando: %LIVE_SERVER_VERSION%

:: Resultado final
echo.
echo ========================================
echo    INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo ✅ Todas as dependencias globais foram instaladas:
echo.
echo 📊 Dependencias instaladas:
echo    ✅ Node.js: %NODE_VERSION%
echo    ✅ npm: %NPM_VERSION%
echo    ✅ live-server: %LIVE_SERVER_VERSION%
echo.
echo 🎯 O sistema PNSB agora pode funcionar em qualquer
echo    computador Windows com estas dependencias!
echo.
echo 🚀 Para usar o sistema:
echo    1. Copie a pasta do sistema para o computador
echo    2. Execute: iniciar-sistema.bat
echo    3. Acesse: http://localhost:8000
echo.
echo 💡 Dica: Execute este script uma vez em cada
echo    computador onde deseja usar o sistema.
echo.

pause 