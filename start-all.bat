@echo off
title House of Frac Ecosystem Launcher
echo ========================================================
echo        STARTING HOUSE OF FRAC ECOSYSTEM
echo ========================================================
echo.

echo 1. Starting Backend API Server on Port 9001...
start "HOF Server [Port 9001]" cmd /k "cd /d C:\projects\house-of-frac\server && npm run start:dev"

echo Waiting for Server to initialize (6 seconds)...
timeout /t 6 /nobreak >nul

echo 2. Starting Web Marketplace (Portal) on Port 3000...
start "HOF Web Portal [Port 3000]" cmd /k "cd /d C:\projects\house-of-frac\portal && npm run dev"

echo 3. Starting Admin Portal on Port 3001...
start "HOF Admin Portal [Port 3001]" cmd /k "cd /d C:\projects\house-of-frac\admin && npm run dev"

echo 4. Starting Trustee Portal on Port 3002...
start "HOF Trustee Portal [Port 3002]" cmd /k "cd /d C:\projects\house-of-frac\trustee && npm run dev"

echo.
echo ========================================================
echo ALL SERVICES ARE LAUNCHED!
echo ========================================================
echo Backend Server:      http://localhost:9001
echo Web Marketplace:     http://localhost:3000
echo Admin Portal:        http://localhost:3001
echo Trustee Portal:      http://localhost:3002
echo ========================================================
pause

