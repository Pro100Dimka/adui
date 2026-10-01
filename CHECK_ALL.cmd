@echo off
setlocal
cd /d "%~dp0"

echo [1/6] Checking component structure...
call npm run check:structure
if errorlevel 1 goto :error

echo [2/6] Checking colocation...
call npm run check:colocation
if errorlevel 1 goto :error

echo [3/6] Checking catalog examples...
call npm run check:catalog
if errorlevel 1 goto :error

echo [4/6] Checking responsive units...
call npm run check:units
if errorlevel 1 goto :error

echo [5/6] Checking adaptive layout and scroll contracts...
call npm run check:layout
if errorlevel 1 goto :error

echo [6/6] TypeScript typecheck...
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
