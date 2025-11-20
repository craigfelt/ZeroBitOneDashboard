#############################################################################
# ZeroBitOne Dashboard - PowerShell Installation Script
# For Windows
#############################################################################

# Ensure script stops on errors
$ErrorActionPreference = "Stop"

# Configuration
$APP_NAME = "ZeroBitOne Dashboard"
$INSTALL_DIR = if ($env:INSTALL_DIR) { $env:INSTALL_DIR } else { "$env:USERPROFILE\ZeroBitOneDashboard" }
$PORT = if ($env:PORT) { $env:PORT } else { "5000" }
$NODE_MIN_VERSION = 16

#############################################################################
# Helper Functions
#############################################################################

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

function Write-ErrorMsg {
    param([string]$Message)
    Write-ColorOutput "✗ $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠ $Message" "Yellow"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ $Message" "Cyan"
}

function Test-CommandExists {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

#############################################################################
# Pre-installation Checks
#############################################################################

function Test-Prerequisites {
    Write-Header "Checking Prerequisites"
    
    $missingDeps = $false
    
    # Check for Node.js
    if (Test-CommandExists "node") {
        $nodeVersionString = node -v
        $nodeVersion = [int]($nodeVersionString -replace 'v(\d+)\..*', '$1')
        if ($nodeVersion -ge $NODE_MIN_VERSION) {
            Write-Success "Node.js $nodeVersionString found"
        } else {
            Write-ErrorMsg "Node.js version $NODE_MIN_VERSION or higher required (found $nodeVersionString)"
            $missingDeps = $true
        }
    } else {
        Write-ErrorMsg "Node.js is not installed"
        Write-Info "Download and install from: https://nodejs.org/"
        $missingDeps = $true
    }
    
    # Check for npm
    if (Test-CommandExists "npm") {
        $npmVersion = npm -v
        Write-Success "npm $npmVersion found"
    } else {
        Write-ErrorMsg "npm is not installed"
        $missingDeps = $true
    }
    
    # Check for git (optional)
    if (Test-CommandExists "git") {
        $gitVersion = git --version
        Write-Success "$gitVersion found"
    } else {
        Write-Warning "git is not installed (optional but recommended)"
    }
    
    if ($missingDeps) {
        Write-ErrorMsg "Missing required dependencies. Please install them and try again."
        exit 1
    }
}

#############################################################################
# Installation
#############################################################################

function New-InstallationDirectory {
    Write-Header "Creating Installation Directory"
    
    if (Test-Path $INSTALL_DIR) {
        Write-Warning "Directory $INSTALL_DIR already exists"
        $response = Read-Host "Do you want to continue? This will overwrite existing files. (y/N)"
        if ($response -notmatch '^[Yy]$') {
            Write-Info "Installation cancelled"
            exit 0
        }
    } else {
        New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null
        Write-Success "Created directory: $INSTALL_DIR"
    }
}

function Copy-ApplicationFiles {
    Write-Header "Copying Application Files"
    
    # Get the directory where this script is located
    $SCRIPT_DIR = Split-Path -Parent $MyInvocation.PSCommandPath
    
    Write-Info "Copying files from $SCRIPT_DIR to $INSTALL_DIR..."
    
    # Copy package files
    Copy-Item -Path "$SCRIPT_DIR\package.json" -Destination $INSTALL_DIR -Force -ErrorAction SilentlyContinue
    Copy-Item -Path "$SCRIPT_DIR\package-lock.json" -Destination $INSTALL_DIR -Force -ErrorAction SilentlyContinue
    
    # Copy server directory
    if (Test-Path "$SCRIPT_DIR\server") {
        Copy-Item -Path "$SCRIPT_DIR\server" -Destination $INSTALL_DIR -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Copy public directory
    if (Test-Path "$SCRIPT_DIR\public") {
        Copy-Item -Path "$SCRIPT_DIR\public" -Destination $INSTALL_DIR -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Copy documentation
    Copy-Item -Path "$SCRIPT_DIR\README.md" -Destination $INSTALL_DIR -Force -ErrorAction SilentlyContinue
    Copy-Item -Path "$SCRIPT_DIR\DATABASE_SETUP.md" -Destination $INSTALL_DIR -Force -ErrorAction SilentlyContinue
    Copy-Item -Path "$SCRIPT_DIR\INSTALLATION.md" -Destination $INSTALL_DIR -Force -ErrorAction SilentlyContinue
    Copy-Item -Path "$SCRIPT_DIR\QUICKSTART.md" -Destination $INSTALL_DIR -Force -ErrorAction SilentlyContinue
    
    # Copy .env.example
    if (Test-Path "$SCRIPT_DIR\.env.example") {
        Copy-Item -Path "$SCRIPT_DIR\.env.example" -Destination "$INSTALL_DIR\.env.example" -Force
    } else {
        # Create a basic .env.example if it doesn't exist
        $envContent = @"
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
SESSION_SECRET=your-secret-key-change-in-production

# Microsoft 365 / Azure AD Configuration
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-tenant-id
AZURE_REDIRECT_URI=http://localhost:5000/api/auth/m365/callback

# GitHub Configuration
GITHUB_TOKEN=your-github-token
GITHUB_ORG=your-github-org
"@
        Set-Content -Path "$INSTALL_DIR\.env.example" -Value $envContent
    }
    
    # Create data directory
    if (-not (Test-Path "$INSTALL_DIR\data")) {
        New-Item -ItemType Directory -Path "$INSTALL_DIR\data" -Force | Out-Null
    }
    
    Write-Success "Files copied successfully"
}

function Install-Dependencies {
    Write-Header "Installing Dependencies"
    
    Push-Location $INSTALL_DIR
    
    Write-Info "Running npm install (this may take a few minutes)..."
    
    try {
        npm install --production 2>&1 | Out-Null
        Write-Success "Dependencies installed successfully"
    } catch {
        Write-ErrorMsg "Failed to install dependencies"
        Write-ErrorMsg $_.Exception.Message
        Pop-Location
        exit 1
    }
    
    Pop-Location
}

function Initialize-Environment {
    Write-Header "Setting Up Environment"
    
    $envFile = "$INSTALL_DIR\.env"
    
    if (-not (Test-Path $envFile)) {
        Copy-Item "$INSTALL_DIR\.env.example" $envFile
        Write-Success "Created .env file from template"
        Write-Warning "Please edit .env file with your configuration"
    } else {
        Write-Warning ".env file already exists - skipping"
    }
}

function New-StartupScripts {
    Write-Header "Creating Startup Scripts"
    
    # Create start.bat script
    $startBat = @"
@echo off
cd /d "%~dp0"
echo Starting ZeroBitOne Dashboard...
npm start
pause
"@
    Set-Content -Path "$INSTALL_DIR\start.bat" -Value $startBat
    Write-Success "Created start.bat"
    
    # Create stop.bat script
    $stopBat = @"
@echo off
echo Stopping ZeroBitOne Dashboard...
taskkill /F /FI "WINDOWTITLE eq ZeroBitOne*" /T >nul 2>&1
taskkill /F /IM node.exe /FI "MEMUSAGE gt 2" >nul 2>&1
echo Dashboard stopped (if it was running)
pause
"@
    Set-Content -Path "$INSTALL_DIR\stop.bat" -Value $stopBat
    Write-Success "Created stop.bat"
    
    # Create start.ps1 script
    $startPs1 = @"
Set-Location `$PSScriptRoot
Write-Host "Starting ZeroBitOne Dashboard..." -ForegroundColor Green
npm start
"@
    Set-Content -Path "$INSTALL_DIR\start.ps1" -Value $startPs1
    Write-Success "Created start.ps1"
}

function New-DesktopShortcut {
    Write-Header "Creating Desktop Shortcut"
    
    try {
        $WshShell = New-Object -ComObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\ZeroBitOne Dashboard.lnk")
        $Shortcut.TargetPath = "$INSTALL_DIR\start.bat"
        $Shortcut.WorkingDirectory = $INSTALL_DIR
        $Shortcut.Description = "Start ZeroBitOne Dashboard"
        $Shortcut.Save()
        Write-Success "Created desktop shortcut"
    } catch {
        Write-Warning "Could not create desktop shortcut: $($_.Exception.Message)"
    }
}

function New-StartMenuShortcut {
    Write-Header "Creating Start Menu Shortcut"
    
    try {
        $startMenuPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\ZeroBitOne Dashboard"
        if (-not (Test-Path $startMenuPath)) {
            New-Item -ItemType Directory -Path $startMenuPath -Force | Out-Null
        }
        
        $WshShell = New-Object -ComObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut("$startMenuPath\ZeroBitOne Dashboard.lnk")
        $Shortcut.TargetPath = "$INSTALL_DIR\start.bat"
        $Shortcut.WorkingDirectory = $INSTALL_DIR
        $Shortcut.Description = "Start ZeroBitOne Dashboard"
        $Shortcut.Save()
        
        $Shortcut2 = $WshShell.CreateShortcut("$startMenuPath\Uninstall.lnk")
        $Shortcut2.TargetPath = "$INSTALL_DIR\uninstall.bat"
        $Shortcut2.WorkingDirectory = $INSTALL_DIR
        $Shortcut2.Description = "Uninstall ZeroBitOne Dashboard"
        $Shortcut2.Save()
        
        Write-Success "Created Start Menu shortcuts"
    } catch {
        Write-Warning "Could not create Start Menu shortcuts: $($_.Exception.Message)"
    }
}

#############################################################################
# Post-Installation
#############################################################################

function Show-CompletionMessage {
    Write-Header "Installation Complete!"
    
    Write-ColorOutput "$APP_NAME has been successfully installed!" "Green"
    Write-Host ""
    Write-ColorOutput "Installation Directory: " "Cyan" -NoNewline
    Write-Host $INSTALL_DIR
    Write-ColorOutput "Default Port: " "Cyan" -NoNewline
    Write-Host $PORT
    Write-Host ""
    Write-ColorOutput "Next Steps:" "Yellow"
    Write-Host ""
    Write-Host "1. Configure your settings:"
    Write-Host "   cd $INSTALL_DIR"
    Write-Host "   notepad .env"
    Write-Host ""
    Write-Host "2. Start the application:"
    Write-Host "   - Double-click 'ZeroBitOne Dashboard' on your Desktop"
    Write-Host "   OR"
    Write-Host "   - Run start.bat from the installation directory"
    Write-Host "   OR"
    Write-Host "   cd $INSTALL_DIR"
    Write-Host "   npm start"
    Write-Host ""
    Write-Host "3. Access the dashboard:"
    Write-Host "   http://localhost:$PORT"
    Write-Host ""
    Write-Host "4. Login with default credentials:"
    Write-Host "   Username: admin"
    Write-Host "   Password: admin123"
    Write-ColorOutput "   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!" "Yellow"
    Write-Host ""
    Write-ColorOutput "Thank you for installing ZeroBitOne Dashboard!" "Green"
    Write-Host ""
}

#############################################################################
# Main Installation Process
#############################################################################

function Main {
    Clear-Host
    Write-Header "ZeroBitOne Dashboard - Installer"
    
    Write-Host "This script will install $APP_NAME on your system."
    Write-Host "Installation directory: $INSTALL_DIR"
    Write-Host ""
    Write-Host "Press Enter to continue or Ctrl+C to cancel..."
    Read-Host
    
    Test-Prerequisites
    New-InstallationDirectory
    Copy-ApplicationFiles
    Install-Dependencies
    Initialize-Environment
    New-StartupScripts
    New-DesktopShortcut
    New-StartMenuShortcut
    Show-CompletionMessage
}

# Run main installation
Main
