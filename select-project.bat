@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║           🐶 Welcome back, Maxim!                            ║
echo ║           Code-Puppy Project Selector                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Available Projects:
echo.
echo   [1] 📱 WearWise (P1) - React Native / Expo app
echo       Location: \PersonalAI\P1
echo.
echo   [2] 🚀 Project Two (P2) - Node.js / Express server
echo       Location: \PersonalAI\P2
echo.
echo   [A] 🎛️  Admin Console - Project ^& Agent Management
echo       Location: \PersonalAI\admin
echo       Features: Daily planning, Agent inventory, Sharing
echo.
echo   [3] 🔄 Stay in current directory
echo.

set /p choice="Which project do you want to work on? (1/2/A/3): "

if "%choice%"=="1" (
    echo.
    echo 🐕 Switching to WearWise (P1)...
    cd /d "C:\Users\maxim\PersonalAI\P1"
    echo ✅ Now in P1 - WearWise
    echo.
    goto :end
)

if "%choice%"=="2" (
    echo.
    echo 🐕 Switching to Project Two (P2)...
    cd /d "C:\Users\maxim\PersonalAI\P2"
    echo ✅ Now in P2 - Project Two
    echo.
    goto :end
)

if /i "%choice%"=="A" (
    echo.
    echo 🐕 Launching Admin Console...
    cd /d "C:\Users\maxim\PersonalAI\admin"
    call node admin.js
    echo.
    echo ✅ Admin session complete
    echo.
    goto :end
)

if "%choice%"=="3" (
    echo.
    echo 🐕 Staying in current directory...
    echo ✅ No change made
    echo.
    goto :end
)

echo ❌ Invalid choice. Staying in current directory.

:end
