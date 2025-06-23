@echo off
title Verificacao do Sistema PNSB
color 0B

echo.
echo ========================================
echo    VERIFICACAO DO SISTEMA PNSB
echo ========================================
echo.

:: Verificar Node.js
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js encontrado: %NODE_VERSION%
) else (
    echo ❌ Node.js nao encontrado!
    echo    Instale em: https://nodejs.org/
    goto :end
)

:: Verificar npm
echo.
echo [2/5] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm encontrado: %NPM_VERSION%
) else (
    echo ❌ npm nao encontrado!
    goto :end
)

:: Verificar dependências
echo.
echo [3/5] Verificando dependencias...
if exist "backend\node_modules" (
    echo ✅ Dependencias instaladas
) else (
    echo ⚠️ Dependencias nao encontradas
    echo    Execute: iniciar-sistema.bat
    goto :end
)

:: Verificar arquivos essenciais
echo.
echo [4/5] Verificando arquivos do sistema...
if exist "backend\server.js" (
    echo ✅ Servidor backend encontrado
) else (
    echo ❌ Servidor backend nao encontrado!
    goto :end
)

if exist "public\index.html" (
    echo ✅ Interface frontend encontrada
) else (
    echo ❌ Interface frontend nao encontrada!
    goto :end
)

if exist "backend\database.json" (
    echo ✅ Banco de dados encontrado
) else (
    echo ⚠️ Banco de dados nao encontrado (sera criado automaticamente)
)

:: Verificar portas
echo.
echo [5/5] Verificando portas...
netstat -an | find "3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Porta 3000 em uso (backend pode estar rodando)
) else (
    echo ✅ Porta 3000 livre
)

netstat -an | find "8000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Porta 8000 em uso (frontend pode estar rodando)
) else (
    echo ✅ Porta 8000 livre
)

:: Resultado final
echo.
echo ========================================
echo    RESULTADO DA VERIFICACAO
echo ========================================
echo.
echo ✅ Sistema pronto para uso!
echo.
echo 📋 Para iniciar o sistema:
echo    Duplo-clique em: iniciar-sistema.bat
echo.
echo 📋 Para parar o sistema:
echo    Duplo-clique em: parar-sistema.bat
echo.
echo 📋 URLs do sistema:
echo    Frontend: http://localhost:8000
echo    Backend:  http://localhost:3000
echo.

:end
echo.
echo Pressione qualquer tecla para sair...
pause >nul 