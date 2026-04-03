@echo off
echo Setting up POPPY Command...
echo.

REM Get the current directory
set "POPPY_PATH=%~dp0"

REM Add to User PATH (requires restart of terminal)
for /f "tokens=2*" %%a in ('reg query HKCU\Environment /v PATH 2^>nul ^| findstr /i path') do set "CURRENT_PATH=%%b"

if defined CURRENT_PATH (
    echo %CURRENT_PATH% | find /i "%POPPY_PATH%" >nul
    if errorlevel 1 (
        echo Adding %POPPY_PATH% to your PATH...
        setx PATH "%CURRENT_PATH%;%POPPY_PATH%"
        echo POPPY path added!
    ) else (
        echo POPPY is already in your PATH
    )
) else (
    echo Creating new PATH with POPPY...
    setx PATH "%POPPY_PATH%"
    echo POPPY path added!
)

echo.
echo Setup complete! 
echo IMPORTANT: Close and reopen your terminal, then type 'poppy' to launch!
echo.
set /p "_=Press Enter to exit..."
