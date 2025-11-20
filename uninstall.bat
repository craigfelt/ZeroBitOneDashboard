@echo off
REM ZeroBitOne Dashboard - Windows Batch Uninstaller

echo ====================================================
echo   ZeroBitOne Dashboard - Uninstaller
echo ====================================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PowerShell is not available on this system.
    pause
    exit /b 1
)

REM Run PowerShell uninstaller
powershell -ExecutionPolicy Bypass -File "%~dp0uninstall.ps1"

pause
