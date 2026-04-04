@echo off
:: Add POPPY commands to system PATH for global access
:: Run this as Administrator

echo ==========================================
echo   POPPY Global Setup
echo ==========================================
echo.
echo This will add POPPY to your system PATH.
echo Run this as Administrator for it to work.
echo.

set "POPPY_PATH=C:\Users\maxim\PersonalAI\admin"

:: Get current user PATH
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul ^| findstr /i "Path"') do set "USERPATH=%%b"

:: If no user PATH exists, use system PATH
if not defined USERPATH (
    for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul ^| findstr /i "Path"') do set "USERPATH=%%b"
)

:: Check if already in PATH
echo %USERPATH% | find /i "%POPPY_PATH%" >nul
if %errorlevel% == 0 (
    echo ✅ POPPY is already in your PATH
    echo.
    echo You can now use:
    echo   poppy       - from any folder
    echo   poppy-maxim - from any folder
    echo.
    pause
    exit /b 0
)

:: Add to user PATH (doesn't require admin)
setx PATH "%USERPATH%;%POPPY_PATH%" >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ POPPY added to PATH successfully!
    echo.
    echo Commands available:
    echo   poppy       - Production version
    echo   poppy-maxim - Creator version (with dashboard)
    echo.
    echo ⚠️  IMPORTANT: Restart your terminal for changes to take effect!
    echo.
) else (
    echo ❌ Failed to add to PATH automatically.
    echo.
    echo Manual setup:
    echo 1. Open System Properties -^> Advanced -^> Environment Variables
    echo 2. Edit your PATH variable
    echo 3. Add this folder:
    echo    %POPPY_PATH%
    echo.
)

pause
