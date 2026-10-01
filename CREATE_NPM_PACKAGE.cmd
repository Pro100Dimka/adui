@echo off
cd /d "%~dp0"
if not exist node_modules call npm install
if errorlevel 1 goto :error
call npm run package
if errorlevel 1 goto :error
echo.
echo NPM package created in the release folder.
explorer "%~dp0release"
pause
exit /b 0
:error
echo.
echo Package creation failed. See the error above.
pause
exit /b 1
