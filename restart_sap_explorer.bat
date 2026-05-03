@echo off
title SAP Explorer - Rebuild ^& Rehost
echo ==============================================
echo SAP Explorer: Kill, Rebuild, and Rehost
echo ==============================================

:: Change directory to the SAP Explorer workspace
cd /d "C:\Users\baska\OneDrive\Documents\Compass\SAP Explorer"

echo.
echo [1/3] Killing existing processes on port 3000...
:: Find the PID listening on port 3000 and kill it gracefully
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :3000') DO (
    taskkill /F /PID %%T 2>NUL
)
:: Give it a second to free up the port
timeout /t 2 /nobreak > NUL

echo.
echo [2/4] Clearing previous build cache (.next)...
if exist ".next" (
    rmdir /S /Q ".next"
)

echo.
echo [3/4] Rebuilding Next.js application...
call npm run build

echo.
echo [4/4] Starting the production server...
echo The app will be available at http://localhost:3000
echo Close this window to stop the server.
echo.
call npm run start

pause
