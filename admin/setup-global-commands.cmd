@echo off
:: Add POPPY commands to system PATH for global access
:: Run this as Administrator

echo Adding POPPY to system PATH...

set "POPPY_PATH=C:\Users\maxim\PersonalAI\admin"

:: Get current system PATH
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul ^| findstr /i "Path"') do set "SYSPATH=%%b"

:: Check if already in PATH
echo %SYSPATH% | find /i "%POPPY_PATH%" >nul
if %errorlevel% == 0 (
    echo POPPY is already in PATH
    goto :done
)

:: Add to system PATH
setx /M PATH "%SYSPATH%;%POPPY_PATH%" >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ POPPY added to system PATH successfully!
    echo.
    echo You can now use these commands from anywhere:
    echo   poppy       - Production version (no Creator Dashboard)
    echo   poppy-maxim - Creator version (with Creator Dashboard)
    echo.
    echo NOTE: You may need to restart your terminal for changes to take effect.
) else (
    echo ❌ Failed to add to PATH. Make sure you ran this as Administrator.
    echo.
    echo Alternative: Add this path manually to your PATH:
    echo   %POPPY_PATH%
)

:done
pause
