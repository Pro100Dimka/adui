@echo off
cd /d "%~dp0"
if not exist node_modules call npm install
if errorlevel 1 goto :error
call npm run release:patch
if errorlevel 1 goto :error
echo.
echo Patch version created in the release folder.
explorer "%~dp0release"
pause
exit /b 0
:error
pause
exit /b 1
