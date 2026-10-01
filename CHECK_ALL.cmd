@echo off
setlocal
cd /d "%~dp0"

echo [1/4] Checking component structure...
call npm run check:structure
if errorlevel 1 goto :error

echo [2/4] Checking colocation...
call npm run check:colocation
if errorlevel 1 goto :error

echo [3/4] Checking catalog examples...
call npm run check:catalog
if errorlevel 1 goto :error

echo [4/4] TypeScript typecheck...
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
