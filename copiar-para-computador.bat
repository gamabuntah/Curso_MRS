@echo off
title Copiar Sistema PNSB para Computador
color 0D

echo.
echo ========================================
echo    COPIAR SISTEMA PNSB PARA COMPUTADOR
echo ========================================
echo.

:: Verificar se estamos em um pendrive
echo [1/4] Verificando origem...
if /i "%cd:~1,1%"==":" (
    echo ✅ Detectado pendrive/dispositivo removivel
    set "ORIGEM=PENDRIVE"
) else (
    echo ℹ️ Detectado disco local
    set "ORIGEM=DISCO_LOCAL"
)

:: Solicitar pasta de destino
echo.
echo [2/4] Escolhendo pasta de destino...
echo.
echo Digite o caminho completo da pasta onde deseja copiar o sistema:
echo Exemplo: C:\SistemaPNSB ou C:\Users\%USERNAME%\Desktop\PNSB
echo.
set /p "DESTINO=Pasta de destino: "

:: Verificar se a pasta de destino existe
if not exist "%DESTINO%" (
    echo.
    echo Criando pasta de destino...
    mkdir "%DESTINO%" 2>nul
    if errorlevel 1 (
        echo ❌ Erro ao criar pasta de destino!
        echo Verifique as permissoes e tente novamente.
        pause
        exit /b 1
    )
    echo ✅ Pasta criada: %DESTINO%
) else (
    echo ✅ Pasta de destino encontrada: %DESTINO%
)

:: Copiar arquivos
echo.
echo [3/4] Copiando arquivos do sistema...
echo.

:: Criar pasta de destino se não existir
if not exist "%DESTINO%\SistemaPNSB" mkdir "%DESTINO%\SistemaPNSB"

:: Copiar todos os arquivos e pastas
xcopy /E /I /Y /Q "backend" "%DESTINO%\SistemaPNSB\backend\" >nul 2>&1
if errorlevel 1 (
    echo ❌ Erro ao copiar pasta backend
) else (
    echo ✅ Pasta backend copiada
)

xcopy /E /I /Y /Q "public" "%DESTINO%\SistemaPNSB\public\" >nul 2>&1
if errorlevel 1 (
    echo ❌ Erro ao copiar pasta public
) else (
    echo ✅ Pasta public copiada
)

:: Copiar arquivos individuais
copy "*.bat" "%DESTINO%\SistemaPNSB\" >nul 2>&1
copy "*.json" "%DESTINO%\SistemaPNSB\" >nul 2>&1
copy "*.md" "%DESTINO%\SistemaPNSB\" >nul 2>&1
copy "*.txt" "%DESTINO%\SistemaPNSB\" >nul 2>&1
echo ✅ Arquivos de sistema copiados

:: Verificar se a cópia foi bem-sucedida
echo.
echo [4/4] Verificando copia...
if exist "%DESTINO%\SistemaPNSB\iniciar-sistema.bat" (
    echo ✅ Sistema copiado com sucesso!
) else (
    echo ❌ Erro na copia do sistema!
    pause
    exit /b 1
)

:: Criar atalho na área de trabalho
echo.
echo ========================================
echo    SISTEMA COPIADO COM SUCESSO!
echo ========================================
echo.
echo 📁 Local do sistema: %DESTINO%\SistemaPNSB\
echo.
echo 🚀 Para usar o sistema:
echo    1. Navegue ate: %DESTINO%\SistemaPNSB\
echo    2. Duplo-clique em: iniciar-sistema.bat
echo.
echo 💡 Dica: Crie um atalho na area de trabalho para facilitar o acesso
echo.

:: Perguntar se quer criar atalho
set /p "CRIAR_ATALHO=Deseja criar um atalho na area de trabalho? (S/N): "
if /i "%CRIAR_ATALHO%"=="S" (
    echo.
    echo Criando atalho na area de trabalho...
    powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Sistema PNSB.lnk'); $Shortcut.TargetPath = '%DESTINO%\SistemaPNSB\iniciar-sistema.bat'; $Shortcut.WorkingDirectory = '%DESTINO%\SistemaPNSB'; $Shortcut.Description = 'Sistema de Certificacao PNSB'; $Shortcut.Save()"
    echo ✅ Atalho criado: "Sistema PNSB" na area de trabalho
)

echo.
echo 🎉 Sistema pronto para uso em: %DESTINO%\SistemaPNSB\
echo.
pause 