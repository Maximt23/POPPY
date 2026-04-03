@echo off
setlocal EnableDelayedExpansion

echo ==============================================
echo   Installing POPPY - Universal AI Project Manager
echo ==============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
echo [OK] Node.js %NODE_VERSION% found

REM Check Node version number
for /f "tokens=1 delims=v." %%a in ("%NODE_VERSION%") do set NODE_MAJOR=%%a
if %NODE_MAJOR% LSS 18 (
    echo [ERROR] Node.js 18+ required. Current: %NODE_VERSION%
    pause
    exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('npm --version') do set NPM_VERSION=%%a
echo [OK] npm %NPM_VERSION% found
echo.

REM Install globally
echo Installing POPPY globally...
npm install -g poppy-admin

if errorlevel 1 (
    echo [ERROR] Installation failed
    pause
    exit /b 1
)

echo.
echo ==============================================
echo   POPPY installed successfully!
echo ==============================================
echo.
echo To get started:
echo   1. Run: poppy --setup
echo   2. Run: poppy
echo.
echo For help: poppy --help
echo.
pause
