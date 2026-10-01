@echo off
setlocal
cd /d "%~dp0"

echo [1/3] Checking component structure...
call npm run check:structure
if errorlevel 1 goto :error

echo [2/3] Checking catalog examples...
call npm run check:catalog
if errorlevel 1 goto :error

echo [3/3] TypeScript typecheck...
call npm run typecheck
if errorlevel 1 goto :error

echo.
echo Everything is OK.
pause
exit /b 0

:error
echo.
echo CHECK FAILED.
pause
exit /b 1
