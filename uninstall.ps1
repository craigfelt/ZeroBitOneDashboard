#############################################################################
# ZeroBitOne Dashboard - PowerShell Uninstallation Script
# For Windows
#############################################################################

$ErrorActionPreference = "Stop"

$INSTALL_DIR = if ($env:INSTALL_DIR) { $env:INSTALL_DIR } else { "$env:USERPROFILE\ZeroBitOneDashboard" }

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-ColorOutput "============================================================" "Blue"
    Write-ColorOutput "  $Title" "Blue"
    Write-ColorOutput "============================================================" "Blue"
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✓ $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠ $Message" "Yellow"
}

function Uninstall {
    Write-Header "ZeroBitOne Dashboard - Uninstaller"
    
    Write-Host "This will remove ZeroBitOne Dashboard from your system."
    Write-Host "Installation directory: $INSTALL_DIR"
    Write-Host ""
    
    $keepData = Read-Host "Do you want to keep your data (database)? (y/N)"
    $confirm = Read-Host "Are you sure you want to uninstall? (y/N)"
    
    if ($confirm -notmatch '^[Yy]$') {
        Write-Host "Uninstallation cancelled"
        exit 0
    }
    
    Write-Header "Stopping Application"
    
    # Stop Node.js processes
    Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
        $_.Path -like "*$INSTALL_DIR*"
    } | Stop-Process -Force
    Write-Success "Stopped running application (if any)"
    
    Write-Header "Removing Files"
    
    # Backup data if requested
    if ($keepData -match '^[Yy]$') {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backupDir = "$env:USERPROFILE\ZeroBitOne_Backup_$timestamp"
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        
        if (Test-Path "$INSTALL_DIR\data") {
            Copy-Item -Path "$INSTALL_DIR\data" -Destination $backupDir -Recurse -Force
            Write-Success "Database backed up to: $backupDir"
        }
    }
    
    # Remove installation directory
    if (Test-Path $INSTALL_DIR) {
        Remove-Item -Path $INSTALL_DIR -Recurse -Force
        Write-Success "Removed installation directory"
    }
    
    # Remove desktop shortcut
    $desktopShortcut = "$env:USERPROFILE\Desktop\ZeroBitOne Dashboard.lnk"
    if (Test-Path $desktopShortcut) {
        Remove-Item -Path $desktopShortcut -Force
        Write-Success "Removed desktop shortcut"
    }
    
    # Remove Start Menu shortcuts
    $startMenuPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\ZeroBitOne Dashboard"
    if (Test-Path $startMenuPath) {
        Remove-Item -Path $startMenuPath -Recurse -Force
        Write-Success "Removed Start Menu shortcuts"
    }
    
    Write-Header "Uninstallation Complete"
    
    Write-ColorOutput "ZeroBitOne Dashboard has been uninstalled." "Green"
    if ($keepData -match '^[Yy]$') {
        Write-ColorOutput "Your data has been backed up to: $backupDir" "Yellow"
    }
    Write-Host ""
}

Uninstall
