@echo off
title Estudio Personal - Lanzador
cd /d "%~dp0"

:: Verificar si el servidor ya está corriendo en el puerto 3005
netstat -ano | findstr :3005 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    echo Iniciando servidor de Estudio Personal...
    start /b "" node server.js >nul 2>&1
    timeout /t 2 /nobreak >nul
)

:: Abrir en modo aplicación nativa independiente (Edge o Chrome) o navegador predeterminado
start msedge --app=http://localhost:3005 2>nul || start chrome --app=http://localhost:3005 2>nul || start http://localhost:3005
exit
