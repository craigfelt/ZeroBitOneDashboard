@echo off
REM ZeroBitOne Dashboard - Windows Batch Installer
REM This wrapper calls the PowerShell installer

echo ====================================================
echo   ZeroBitOne Dashboard - Windows Installer
echo ====================================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PowerShell is not available on this system.
    echo Please install PowerShell or use manual installation.
    pause
    exit /b 1
)

REM Run PowerShell installer
echo Starting PowerShell installer...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0install.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Installation failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo Installation completed successfully!
pause
