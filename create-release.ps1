#############################################################################
# ZeroBitOne Dashboard - Release Package Creator (PowerShell)
# Creates a distributable archive with all necessary files
#############################################################################

param(
    [string]$Version = "1.0.0"
)

$ErrorActionPreference = "Stop"

# Configuration
$RELEASE_NAME = "ZeroBitOneDashboard-v$Version"
$RELEASE_DIR = "releases"
$ZIP_NAME = "$RELEASE_NAME.zip"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "  Creating ZeroBitOne Dashboard Release Package" -ForegroundColor Blue
Write-Host "  Version: $Version" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""

# Create releases directory
if (-not (Test-Path $RELEASE_DIR)) {
    New-Item -ItemType Directory -Path $RELEASE_DIR | Out-Null
}

# Create temporary directory for packaging
$TEMP_DIR = Join-Path $env:TEMP "ZBORelease_$(Get-Random)"
$PACKAGE_DIR = Join-Path $TEMP_DIR $RELEASE_NAME
New-Item -ItemType Directory -Path $PACKAGE_DIR -Force | Out-Null

Write-Host "Copying files..." -ForegroundColor Green

# Copy application files
Copy-Item -Path "server" -Destination $PACKAGE_DIR -Recurse -Force
Copy-Item -Path "public" -Destination $PACKAGE_DIR -Recurse -Force
if (Test-Path "data") {
    Copy-Item -Path "data" -Destination $PACKAGE_DIR -Recurse -Force
} else {
    New-Item -ItemType Directory -Path "$PACKAGE_DIR\data" | Out-Null
}
Copy-Item -Path "package.json" -Destination $PACKAGE_DIR -Force
if (Test-Path "package-lock.json") {
    Copy-Item -Path "package-lock.json" -Destination $PACKAGE_DIR -Force
}

# Copy installation scripts
Copy-Item -Path "install.sh" -Destination $PACKAGE_DIR -Force
Copy-Item -Path "install.bat" -Destination $PACKAGE_DIR -Force
Copy-Item -Path "install.ps1" -Destination $PACKAGE_DIR -Force
Copy-Item -Path "uninstall.sh" -Destination $PACKAGE_DIR -Force
Copy-Item -Path "uninstall.bat" -Destination $PACKAGE_DIR -Force
Copy-Item -Path "uninstall.ps1" -Destination $PACKAGE_DIR -Force

# Copy Docker files
Copy-Item -Path "Dockerfile" -Destination $PACKAGE_DIR -Force
if (Test-Path "Dockerfile.debian") {
    Copy-Item -Path "Dockerfile.debian" -Destination $PACKAGE_DIR -Force
}
Copy-Item -Path "docker-compose.yml" -Destination $PACKAGE_DIR -Force
if (Test-Path ".dockerignore") {
    Copy-Item -Path ".dockerignore" -Destination $PACKAGE_DIR -Force
}

# Copy documentation
Copy-Item -Path "README.md" -Destination $PACKAGE_DIR -Force
Copy-Item -Path "DATABASE_SETUP.md" -Destination $PACKAGE_DIR -Force
Copy-Item -Path "INSTALLATION.md" -Destination $PACKAGE_DIR -Force
Copy-Item -Path "QUICKSTART.md" -Destination $PACKAGE_DIR -Force

# Copy .env.example
Copy-Item -Path ".env.example" -Destination $PACKAGE_DIR -Force

# Copy .gitignore if exists
if (Test-Path ".gitignore") {
    Copy-Item -Path ".gitignore" -Destination $PACKAGE_DIR -Force
}

Write-Host "Creating archive..." -ForegroundColor Green

# Create zip archive
$zipPath = Join-Path $RELEASE_DIR $ZIP_NAME
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path "$PACKAGE_DIR\*" -DestinationPath $zipPath -CompressionLevel Optimal

Write-Host "✓ Created: $zipPath" -ForegroundColor Green

# Cleanup
Remove-Item -Path $TEMP_DIR -Recurse -Force

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Release package created successfully!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "File created:"
Write-Host "  - $zipPath"
Write-Host ""
Write-Host "Users can:"
Write-Host "  1. Download and extract the archive"
Write-Host "  2. Run install.bat or install.ps1"
Write-Host "  3. Or use Docker with docker-compose up -d"
Write-Host ""
