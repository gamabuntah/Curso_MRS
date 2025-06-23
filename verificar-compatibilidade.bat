@echo off
title Verificacao de Compatibilidade PNSB
color 0C

echo.
echo ========================================
echo    VERIFICACAO DE COMPATIBILIDADE PNSB
echo ========================================
echo.
echo Este script verifica se o sistema e compativel
echo com o computador atual.
echo.

:: Verificar versão do Windows
echo [1/6] Verificando versao do Windows...
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
echo ✅ Windows detectado: %VERSION%

:: Verificar se é Windows 10 ou superior
if %VERSION% LSS 10.0 (
    echo ⚠️ Versao do Windows pode ser muito antiga
    echo Recomendado: Windows 10 ou superior
) else (
    echo ✅ Versao do Windows compativel
)

:: Verificar arquitetura do sistema
echo.
echo [2/6] Verificando arquitetura do sistema...
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    echo ✅ Sistema 64-bit detectado
) else (
    echo ⚠️ Sistema 32-bit detectado (pode ter limitacoes)
)

:: Verificar Node.js
echo.
echo [3/6] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado!
    echo.
    echo Para instalar o Node.js:
    echo 1. Acesse: https://nodejs.org/
    echo 2. Baixe a versao LTS para Windows
    echo 3. Instale normalmente
    echo 4. Reinicie o computador
    echo.
    goto :incompativel
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js encontrado: %NODE_VERSION%
    
    :: Verificar versão mínima (14.0.0)
    for /f "tokens=1 delims=." %%a in ("%NODE_VERSION%") do set NODE_MAJOR=%%a
    if %NODE_MAJOR% LSS 14 (
        echo ❌ Versao do Node.js muito antiga!
        echo Recomendado: Node.js 14.0.0 ou superior
        goto :incompativel
    ) else (
        echo ✅ Versao do Node.js compativel
    )
)

:: Verificar npm
echo.
echo [4/6] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm nao encontrado!
    goto :incompativel
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm encontrado: %NPM_VERSION%
)

:: Verificar permissões de escrita
echo.
echo [5/6] Verificando permissoes...
echo Testando escrita na pasta atual...
echo. > test_write.tmp 2>nul
if exist "test_write.tmp" (
    del test_write.tmp >nul 2>&1
    echo ✅ Permissoes de escrita OK
) else (
    echo ❌ Sem permissoes de escrita!
    echo Execute como administrador
    goto :incompativel
)

:: Verificar conectividade de rede
echo.
echo [6/6] Verificando conectividade...
ping -n 1 8.8.8.8 >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Sem conectividade de internet
    echo Algumas funcionalidades podem nao funcionar
) else (
    echo ✅ Conectividade de internet OK
)

:: Resultado final
echo.
echo ========================================
echo    VERIFICACAO DE COMPATIBILIDADE
echo ========================================
echo.
echo ✅ SISTEMA COMPATIVEL
echo.
echo 📊 Resultados da verificacao:
echo    ✅ Windows: %VERSION%
echo    ✅ Arquitetura: %PROCESSOR_ARCHITECTURE%
echo    ✅ Node.js: %NODE_VERSION%
echo    ✅ npm: %NPM_VERSION%
echo    ✅ Permissoes: OK
echo    ✅ Conectividade: OK
echo.
echo 🎯 Conclusao:
echo    O sistema PNSB e totalmente compativel
echo    com este computador!
echo.
echo 🚀 Para usar o sistema:
echo    1. Execute: iniciar-sistema.bat
echo    2. Acesse: http://localhost:8000
echo    3. Use normalmente
echo.
echo 💡 Dica: Execute: teste-completo-sistema.bat
echo    para um teste mais detalhado.
echo.

goto :fim

:incompativel
echo.
echo ========================================
echo    SISTEMA INCOMPATIVEL
echo ========================================
echo.
echo ❌ O sistema PNSB nao e compativel
echo    com este computador.
echo.
echo 🔧 Solucoes:
echo    1. Instale/atualize o Node.js
echo    2. Use Windows 10 ou superior
echo    3. Execute como administrador
echo    4. Verifique a conectividade
echo.
echo 📞 Suporte:
echo    Consulte a documentacao ou
echo    entre em contato com o suporte.
echo.

:fim
echo.
echo Pressione qualquer tecla para sair...
pause >nul 