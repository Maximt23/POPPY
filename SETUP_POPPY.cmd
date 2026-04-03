@echo off
:: =====================================================
:: POPPY - 2-Click Setup (Windows)
:: =====================================================
:: Just double-click this file and POPPY will work!

color 0A
title POPPY Setup

echo.
echo  ================================================
echo   POPPY Project Manager - Setup
echo  ================================================
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo  [X] Node.js not found!
    echo.
    echo  Please install Node.js from:
    echo  https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
    echo.
    pause
    exit /b 1
)

echo  [OK] Node.js found

:: Install dependencies  
cd /d "%~dp0admin"
echo  [..] Installing POPPY dependencies...
call npm install --silent
if errorlevel 1 (
    echo  [X] npm install failed
    pause
    exit /b 1
)

:: Add to PATH
echo  [..] Adding POPPY to your system...
set "POPPY_PATH=%~dp0admin"
for /f "tokens=2*" %%a in ('reg query HKCU\Environment /v PATH 2^>nul ^| findstr /i path') do set "CURRENT_PATH=%%b"

if not defined CURRENT_PATH (
    setx PATH "%POPPY_PATH%"
) else (
    echo %CURRENT_PATH% | find /i "%POPPY_PATH%" >nul
    if errorlevel 1 (
        setx PATH "%CURRENT_PATH%;%POPPY_PATH%"
    )
)

echo  [OK] POPPY is ready!
echo.
echo  ================================================
echo   SETUP COMPLETE!
echo  ================================================
echo.
echo  You can now launch POPPY by typing:
echo.
echo      poppy
echo.
echo  Or double-click: admin
go.cmd
echo.
echo  IMPORTANT: Close and reopen your terminal
echo  for the 'poppy' command to work everywhere.
echo.
pause

:: Launch POPPY now
call "%~dp0admin\go.cmd"
