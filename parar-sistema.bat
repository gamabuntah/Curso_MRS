@echo off
title Parando Sistema PNSB
color 0C

echo.
echo ========================================
echo    PARANDO SISTEMA DE CERTIFICACAO PNSB
echo ========================================
echo.

echo [1/3] Parando servidor backend...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Backend parado!

echo.
echo [2/3] Parando servidor frontend...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Frontend parado!

echo.
echo [3/3] Limpando processos...
taskkill /f /im cmd.exe /fi "WINDOWTITLE eq Backend PNSB*" >nul 2>&1
taskkill /f /im cmd.exe /fi "WINDOWTITLE eq Frontend PNSB*" >nul 2>&1
echo ✅ Processos limpos!

echo.
echo ========================================
echo    SISTEMA PARADO COM SUCESSO!
echo ========================================
echo.
echo ✅ Todos os servidores foram parados
echo ✅ Portas 3000 e 8000 liberadas
echo.
echo Pressione qualquer tecla para sair...
pause >nul 