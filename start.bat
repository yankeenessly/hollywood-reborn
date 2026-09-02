@echo off
echo ===================================================
echo   Starting Hollywood Reborn Gift Card Marketplace
echo ===================================================

echo Starting Backend Server on port 5000...
start "Hollywood Reborn - Backend" cmd /k "cd /d %~dp0server && node server.js"

timeout /t 2 >nul

echo Starting Frontend Dev Server on port 5173...
start "Hollywood Reborn - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo   Storefront & Admin: http://localhost:5173
echo   Production Unified URL: http://localhost:5000
echo   Default Admin Password: admin123
echo ===================================================
echo.
pause
