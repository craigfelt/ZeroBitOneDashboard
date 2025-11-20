#############################################################################
# ZeroBitOne Dashboard - Bootstrap Installer (PowerShell)
# Downloads and installs the application automatically
#############################################################################

param(
    [string]$Version = "latest"
)

$ErrorActionPreference = "Stop"

# Configuration
$REPO_OWNER = "craigfelt"
$REPO_NAME = "ZeroBitOneDashboard"
$GITHUB_API = "https://api.github.com"
$GITHUB_DOWNLOAD = "https://github.com"

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

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ $Message" "Cyan"
}

function Get-ReleaseUrl {
    Write-Header "Getting Release Information"
    
    if ($Version -eq "latest") {
        Write-Info "Fetching latest release..."
        
        try {
            $releaseData = Invoke-RestMethod -Uri "$GITHUB_API/repos/$REPO_OWNER/$REPO_NAME/releases/latest"
            $asset = $releaseData.assets | Where-Object { $_.name -like "*.zip" } | Select-Object -First 1
            
            if ($asset) {
                $script:downloadUrl = $asset.browser_download_url
            } else {
                Write-ErrorMsg "Could not find release asset"
                Write-Info "Falling back to main branch download..."
                $script:downloadUrl = "$GITHUB_DOWNLOAD/$REPO_OWNER/$REPO_NAME/archive/refs/heads/main.zip"
            }
        } catch {
            Write-ErrorMsg "Could not fetch release information"
            Write-Info "Falling back to main branch download..."
            $script:downloadUrl = "$GITHUB_DOWNLOAD/$REPO_OWNER/$REPO_NAME/archive/refs/heads/main.zip"
        }
    } else {
        $script:downloadUrl = "$GITHUB_DOWNLOAD/$REPO_OWNER/$REPO_NAME/releases/download/v$Version/ZeroBitOneDashboard-v$Version.zip"
    }
    
    Write-Success "Download URL: $script:downloadUrl"
}

function Download-Release {
    Write-Header "Downloading Application"
    
    $script:tempDir = Join-Path $env:TEMP "ZBOInstall_$(Get-Random)"
    New-Item -ItemType Directory -Path $script:tempDir -Force | Out-Null
    
    $script:archiveFile = Join-Path $script:tempDir "zerobitone.zip"
    
    Write-Info "Downloading to $script:tempDir..."
    
    try {
        # Show progress
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $script:downloadUrl -OutFile $script:archiveFile
        $ProgressPreference = 'Continue'
        Write-Success "Download complete"
    } catch {
        Write-ErrorMsg "Download failed: $($_.Exception.Message)"
        Remove-Item -Path $script:tempDir -Recurse -Force -ErrorAction SilentlyContinue
        exit 1
    }
}

function Expand-Release {
    Write-Header "Extracting Archive"
    
    try {
        Expand-Archive -Path $script:archiveFile -DestinationPath $script:tempDir -Force
        
        # Find the extracted directory
        $extractedDir = Get-ChildItem -Path $script:tempDir -Directory | Where-Object { 
            $_.Name -like "ZeroBitOne*" 
        } | Select-Object -First 1
        
        if (-not $extractedDir) {
            Write-ErrorMsg "Could not find extracted directory"
            Remove-Item -Path $script:tempDir -Recurse -Force
            exit 1
        }
        
        $script:installerDir = $extractedDir.FullName
        Write-Success "Extracted to $script:installerDir"
    } catch {
        Write-ErrorMsg "Extraction failed: $($_.Exception.Message)"
        Remove-Item -Path $script:tempDir -Recurse -Force -ErrorAction SilentlyContinue
        exit 1
    }
}

function Invoke-Installer {
    Write-Header "Running Installer"
    
    $installerScript = Join-Path $script:installerDir "install.ps1"
    
    if (Test-Path $installerScript) {
        # Run the installer
        & $installerScript
    } else {
        Write-ErrorMsg "install.ps1 not found in the package"
        Write-Info "You can manually install by running:"
        Write-Info "  cd $script:installerDir"
        Write-Info "  npm install"
        Write-Info "  npm start"
        exit 1
    }
}

function Remove-TempFiles {
    if ($script:tempDir -and (Test-Path $script:tempDir)) {
        Write-Info "Cleaning up temporary files..."
        Remove-Item -Path $script:tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function Main {
    Clear-Host
    Write-Header "ZeroBitOne Dashboard - Bootstrap Installer"
    
    Write-Host "This script will:"
    Write-Host "  1. Download the latest ZeroBitOne Dashboard release"
    Write-Host "  2. Extract the files"
    Write-Host "  3. Run the installer automatically"
    Write-Host ""
    Write-Host "Press Enter to continue or Ctrl+C to cancel..."
    Read-Host
    
    try {
        Get-ReleaseUrl
        Download-Release
        Expand-Release
        Invoke-Installer
        Remove-TempFiles
        
        Write-Header "Bootstrap Complete!"
        Write-Host "The application has been installed."
        Write-Host ""
    } catch {
        Write-ErrorMsg "Installation failed: $($_.Exception.Message)"
        Remove-TempFiles
        exit 1
    }
}

# Run main
Main
