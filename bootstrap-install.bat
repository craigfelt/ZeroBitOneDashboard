@echo off
REM ZeroBitOne Dashboard - Bootstrap Installer (Batch wrapper)
REM Downloads and installs everything automatically

echo ====================================================
echo   ZeroBitOne Dashboard - One-Click Installer
echo ====================================================
echo.
echo This installer will download and install the application
echo automatically. No manual downloads required!
echo.
pause

REM Check if PowerShell is available
where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PowerShell is not available on this system.
    echo.
    echo Please download the full package manually from:
    echo https://github.com/craigfelt/ZeroBitOneDashboard/releases
    pause
    exit /b 1
)

REM Download the bootstrap script
echo Downloading bootstrap installer...
powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/craigfelt/ZeroBitOneDashboard/main/bootstrap-install.ps1' -OutFile '%TEMP%\zbo-bootstrap.ps1'"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to download bootstrap script.
    echo Please check your internet connection.
    pause
    exit /b 1
)

REM Run the bootstrap script
echo Running installer...
powershell -ExecutionPolicy Bypass -File "%TEMP%\zbo-bootstrap.ps1"

REM Cleanup
del "%TEMP%\zbo-bootstrap.ps1" 2>nul

echo.
pause
