@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies for the first time...
  call npm install
  if errorlevel 1 goto :error
)
echo Starting A^&D UI Playground...
call npm run dev
exit /b %errorlevel%
:error
echo.
echo Installation failed. Check Node.js and npm, then try again.
pause
exit /b 1
