@echo off
:: POPPY Universal AI Project Manager - Windows Setup
:: Run this to install POPPY globally

echo ================================================
echo     POPPY Setup - Universal AI Manager
echo ================================================
echo.

:: Check if running as admin (optional but recommended for global install)
net session >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [OK] Running with administrator privileges
    set ADMIN=1
) else (
    echo [INFO] Running without admin privileges
    echo [INFO] Will install to user directory only
    set ADMIN=0
)

echo.
echo Step 1: Detecting POPPY location...

:: Find POPPY admin directory
if exist "%~dp0admin.js" (
    set "POPPY_DIR=%~dp0"
    echo [OK] Found POPPY at: %~dp0
) else if exist "%~dp0..\admin\admin.js" (
    set "POPPY_DIR=%~dp0..\admin\"
    echo [OK] Found POPPY at: %~dp0..\admin\
) else (
    echo [ERROR] Cannot find POPPY admin.js
    echo Please run this script from the admin folder
    pause
    exit /b 1
)

:: Get the root PersonalAI directory
for %%I in ("%POPPY_DIR%..") do set "PERSONALAI_ROOT=%%~fI"
echo [OK] PersonalAI root: %PERSONALAI_ROOT%

echo.
echo Step 2: Setting up global command...

:: Create .local\bin directory if it doesn't exist
if not exist "%USERPROFILE%\.local\bin" mkdir "%USERPROFILE%\.local\bin"

:: Create poppy.cmd in .local\bin
echo @echo off > "%USERPROFILE%\.local\bin\poppy.cmd"
echo :: POPPY Universal AI Project Manager >> "%USERPROFILE%\.local\bin\poppy.cmd"
echo node "%PERSONALAI_ROOT%\admin\admin.js" %%* >> "%USERPROFILE%\.local\bin\poppy.cmd"

if %ERRORLEVEL% == 0 (
    echo [OK] Created: %USERPROFILE%\.local\bin\poppy.cmd
) else (
    echo [ERROR] Failed to create poppy.cmd
    pause
    exit /b 1
)

echo.
echo Step 3: Creating user data directory...

:: Create .poppy directory for user data
if not exist "%USERPROFILE%\.poppy" mkdir "%USERPROFILE%\.poppy"
if not exist "%USERPROFILE%\.poppy\skills" mkdir "%USERPROFILE%\.poppy\skills"
if not exist "%USERPROFILE%\.poppy\agents" mkdir "%USERPROFILE%\.poppy\agents"
if not exist "%USERPROFILE%\.poppy\projects" mkdir "%USERPROFILE%\.poppy\projects"
if not exist "%USERPROFILE%\.poppy\communication" mkdir "%USERPROFILE%\.poppy\communication"

echo [OK] Created user data directories
echo   - %USERPROFILE%\.poppy\
echo   - %USERPROFILE%\.poppy\skills\
echo   - %USERPROFILE%\.poppy\agents\
echo   - %USERPROFILE%\.poppy\projects\
echo   - %USERPROFILE%\.poppy\communication\

echo.
echo Step 4: Checking PATH...

echo %PATH% | findstr /I "\.local\\bin" >nul
if %ERRORLEVEL% == 0 (
    echo [OK] .local\bin is already in PATH
) else (
    echo [INFO] Adding .local\bin to PATH...
    
    :: Add to user PATH
    for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v PATH 2^>nul ^| findstr /i "PATH"') do set "CURRENT_PATH=%%b"
    
    if defined CURRENT_PATH (
        setx PATH "%CURRENT_PATH%;%USERPROFILE%\.local\bin" >nul 2>&1
    ) else (
        setx PATH "%USERPROFILE%\.local\bin" >nul 2>&1
    )
    
    echo [OK] Added to user PATH
    echo [WARNING] You may need to restart your terminal for changes to take effect
)

echo.
echo Step 5: Initializing POPPY configuration...

:: Create initial config if it doesn't exist
if not exist "%USERPROFILE%\.poppy\config.json" (
    echo { > "%USERPROFILE%\.poppy\config.json"
    echo   "version": "1.0.0", >> "%USERPROFILE%\.poppy\config.json"
    echo   "installed_at": "%DATE% %TIME%", >> "%USERPROFILE%\.poppy\config.json"
    echo   "default_engine": "code-puppy", >> "%USERPROFILE%\.poppy\config.json"
    echo   "projects_root": "%PERSONALAI_ROOT%", >> "%USERPROFILE%\.poppy\config.json"
    echo   "theme": "green" >> "%USERPROFILE%\.poppy\config.json"
    echo } >> "%USERPROFILE%\.poppy\config.json"
    echo [OK] Created default configuration
)

echo.
echo ================================================
echo         SETUP COMPLETE!
echo ================================================
echo.
echo You can now run 'poppy' from anywhere!
echo.
echo Quick start:
echo   poppy              - Launch POPPY menu
echo   poppy --version    - Check version
echo   poppy --help       - Show help
echo.
echo User data location: %USERPROFILE%\.poppy\
echo.

:: Test the installation
echo Testing installation...
"%USERPROFILE%\.local\bin\poppy.cmd" --version >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [SUCCESS] POPPY is ready to use!
    poppy --version
) else (
    echo [WARNING] Test failed, but setup completed
    echo Try running 'poppy' after restarting your terminal
)

echo.
pause
