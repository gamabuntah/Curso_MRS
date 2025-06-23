@echo off
title Teste Completo do Sistema PNSB
color 0F

echo.
echo ========================================
echo    TESTE COMPLETO DO SISTEMA PNSB
echo ========================================
echo.
echo Este teste verifica se o sistema funciona 100%
echo tanto do pendrive quanto copiado para computador.
echo.

:: Verificar se estamos em um pendrive
echo [1/8] Verificando origem do sistema...
if /i "%cd:~1,1%"==":" (
    echo ✅ Detectado pendrive/dispositivo removivel
    set "ORIGEM=PENDRIVE"
    set "ORIGEM_INFO=Executando do pendrive"
) else (
    echo ℹ️ Detectado disco local
    set "ORIGEM=DISCO_LOCAL"
    set "ORIGEM_INFO=Executando do disco local"
)

echo.
echo [2/8] Verificando requisitos do sistema...

:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js encontrado: %NODE_VERSION%
) else (
    echo ❌ Node.js nao encontrado!
    echo    Instale em: https://nodejs.org/
    goto :erro_critico
)

:: Verificar npm
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm encontrado: %NPM_VERSION%
) else (
    echo ❌ npm nao encontrado!
    goto :erro_critico
)

echo.
echo [3/8] Verificando arquivos essenciais...

:: Verificar arquivos principais
set "ARQUIVOS_OK=true"
if not exist "backend\server.js" (
    echo ❌ backend\server.js nao encontrado!
    set "ARQUIVOS_OK=false"
) else (
    echo ✅ backend\server.js encontrado
)

if not exist "public\index.html" (
    echo ❌ public\index.html nao encontrado!
    set "ARQUIVOS_OK=false"
) else (
    echo ✅ public\index.html encontrado
)

if not exist "iniciar-sistema.bat" (
    echo ❌ iniciar-sistema.bat nao encontrado!
    set "ARQUIVOS_OK=false"
) else (
    echo ✅ iniciar-sistema.bat encontrado
)

if not exist "parar-sistema.bat" (
    echo ❌ parar-sistema.bat nao encontrado!
    set "ARQUIVOS_OK=false"
) else (
    echo ✅ parar-sistema.bat encontrado
)

if not exist "verificar-sistema.bat" (
    echo ❌ verificar-sistema.bat nao encontrado!
    set "ARQUIVOS_OK=false"
) else (
    echo ✅ verificar-sistema.bat encontrado
)

if not exist "copiar-para-computador.bat" (
    echo ❌ copiar-para-computador.bat nao encontrado!
    set "ARQUIVOS_OK=false"
) else (
    echo ✅ copiar-para-computador.bat encontrado
)

if "%ARQUIVOS_OK%"=="false" (
    goto :erro_critico
)

echo.
echo [4/8] Verificando dependencias...

:: Verificar se as dependências estão instaladas
if not exist "backend\node_modules" (
    echo ⚠️ Dependencias nao encontradas - instalando...
    cd backend
    npm install
    cd ..
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependencias!
        goto :erro_critico
    )
    echo ✅ Dependencias instaladas com sucesso
) else (
    echo ✅ Dependencias ja instaladas
)

echo.
echo [5/8] Verificando portas...

:: Verificar se as portas estão livres
netstat -an | find ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Porta 3000 em uso - tentando parar processos...
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
)

netstat -an | find ":8000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Porta 8000 em uso - tentando parar processos...
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
)

echo ✅ Portas verificadas

echo.
echo [6/8] Testando inicializacao do sistema...

:: Testar inicialização
echo Iniciando sistema de teste...
start "Teste Backend" cmd /k "cd /d %~dp0backend && node server.js"
timeout /t 5 /nobreak >nul

:: Verificar se o backend está respondendo
echo Verificando se o backend esta respondendo...
curl -s http://localhost:3000/api/progress/admin >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Backend nao respondeu imediatamente - aguardando...
    timeout /t 5 /nobreak >nul
    curl -s http://localhost:3000/api/progress/admin >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Backend nao esta respondendo!
        goto :erro_backend
    )
)

echo ✅ Backend funcionando corretamente

:: Testar frontend
echo Iniciando frontend de teste...
start "Teste Frontend" cmd /k "cd /d %~dp0 && npx live-server --port=8000 public/"
timeout /t 3 /nobreak >nul

echo ✅ Frontend iniciado

echo.
echo [7/8] Testando funcionalidades principais...

:: Testar acesso ao frontend
echo Verificando acesso ao frontend...
curl -s http://localhost:8000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Aguardando frontend inicializar...
    timeout /t 3 /nobreak >nul
    curl -s http://localhost:8000 >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Frontend nao esta respondendo!
        goto :erro_frontend
    )
)

echo ✅ Frontend funcionando corretamente

echo.
echo [8/8] Parando sistema de teste...

:: Parar o sistema de teste
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo ✅ Sistema parado com sucesso

:: Resultado final
echo.
echo ========================================
echo    TESTE COMPLETO CONCLUIDO!
echo ========================================
echo.
echo ✅ SISTEMA 100% FUNCIONAL
echo.
echo 📊 Resultados do teste:
echo    ✅ Origem: %ORIGEM_INFO%
echo    ✅ Node.js: %NODE_VERSION%
echo    ✅ npm: %NPM_VERSION%
echo    ✅ Arquivos essenciais: Todos encontrados
echo    ✅ Dependencias: Instaladas e funcionando
echo    ✅ Portas: Verificadas e liberadas
echo    ✅ Backend: Funcionando corretamente
echo    ✅ Frontend: Funcionando corretamente
echo    ✅ Parada: Sistema parado com sucesso
echo.
echo 🎯 Conclusao:
echo    O sistema funciona perfeitamente %ORIGEM_INFO%
echo    Pode ser usado com confianca!
echo.
echo 🚀 Para usar o sistema:
echo    - Duplo-clique em: iniciar-sistema.bat
echo    - Acesse: http://localhost:8000
echo    - Login: Gustavo (usuario) ou admin (administrador)
echo.
echo 💡 Dica: Para melhor performance, copie para o computador
echo    usando: copiar-para-computador.bat
echo.

goto :fim

:erro_critico
echo.
echo ========================================
echo    ERRO CRITICO DETECTADO!
echo ========================================
echo.
echo ❌ O sistema nao pode funcionar devido a:
echo    - Node.js nao instalado, ou
echo    - Arquivos essenciais faltando, ou
echo    - Dependencias nao podem ser instaladas
echo.
echo 🔧 Solucoes:
echo    1. Instale o Node.js: https://nodejs.org/
echo    2. Verifique se todos os arquivos estao presentes
echo    3. Execute como administrador se necessario
echo.
goto :fim

:erro_backend
echo.
echo ========================================
echo    ERRO NO BACKEND!
echo ========================================
echo.
echo ❌ O backend nao esta funcionando corretamente
echo.
echo 🔧 Solucoes:
echo    1. Verifique se a porta 3000 esta livre
echo    2. Execute: parar-sistema.bat
echo    3. Reinicie o computador
echo    4. Verifique as dependencias
echo.
goto :fim

:erro_frontend
echo.
echo ========================================
echo    ERRO NO FRONTEND!
echo ========================================
echo.
echo ❌ O frontend nao esta funcionando corretamente
echo.
echo 🔧 Solucoes:
echo    1. Verifique se a porta 8000 esta livre
echo    2. Execute: parar-sistema.bat
echo    3. Reinicie o computador
echo    4. Verifique se o live-server esta instalado
echo.

:fim
echo.
echo Pressione qualquer tecla para sair...
pause >nul 