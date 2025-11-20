#!/bin/bash

##############################################################################
# ZeroBitOne Dashboard - Release Package Creator
# Creates a distributable archive with all necessary files
##############################################################################

set -e

# Configuration
VERSION=${VERSION:-"1.0.0"}
RELEASE_NAME="ZeroBitOneDashboard-v${VERSION}"
RELEASE_DIR="releases"
ARCHIVE_NAME="${RELEASE_NAME}.tar.gz"
ZIP_NAME="${RELEASE_NAME}.zip"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}  Creating ZeroBitOne Dashboard Release Package${NC}"
echo -e "${BLUE}  Version: ${VERSION}${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# Create releases directory
mkdir -p "$RELEASE_DIR"

# Create temporary directory for packaging
TEMP_DIR=$(mktemp -d)
PACKAGE_DIR="$TEMP_DIR/$RELEASE_NAME"
mkdir -p "$PACKAGE_DIR"

echo -e "${GREEN}Copying files...${NC}"

# Copy application files
cp -r server "$PACKAGE_DIR/"
cp -r public "$PACKAGE_DIR/"
cp -r data "$PACKAGE_DIR/" 2>/dev/null || mkdir -p "$PACKAGE_DIR/data"
cp package.json "$PACKAGE_DIR/"
cp package-lock.json "$PACKAGE_DIR/" 2>/dev/null || true

# Copy installation scripts
cp install.sh "$PACKAGE_DIR/"
cp install.bat "$PACKAGE_DIR/"
cp install.ps1 "$PACKAGE_DIR/"
cp uninstall.sh "$PACKAGE_DIR/"
cp uninstall.bat "$PACKAGE_DIR/"
cp uninstall.ps1 "$PACKAGE_DIR/"

# Copy Docker files
cp Dockerfile "$PACKAGE_DIR/"
cp Dockerfile.debian "$PACKAGE_DIR/" 2>/dev/null || true
cp docker-compose.yml "$PACKAGE_DIR/"
cp .dockerignore "$PACKAGE_DIR/" 2>/dev/null || true

# Copy documentation
cp README.md "$PACKAGE_DIR/"
cp DATABASE_SETUP.md "$PACKAGE_DIR/"
cp INSTALLATION.md "$PACKAGE_DIR/"
cp QUICKSTART.md "$PACKAGE_DIR/"

# Copy .env.example
cp .env.example "$PACKAGE_DIR/"

# Copy .gitignore
cp .gitignore "$PACKAGE_DIR/" 2>/dev/null || true

# Make scripts executable
chmod +x "$PACKAGE_DIR/install.sh"
chmod +x "$PACKAGE_DIR/uninstall.sh"

echo -e "${GREEN}Creating archives...${NC}"

# Create tar.gz archive (for Linux/Mac)
cd "$TEMP_DIR"
tar -czf "$ARCHIVE_NAME" "$RELEASE_NAME"
mv "$ARCHIVE_NAME" "$OLDPWD/$RELEASE_DIR/"
echo -e "${GREEN}✓ Created: $RELEASE_DIR/$ARCHIVE_NAME${NC}"

# Create zip archive (for Windows)
if command -v zip &> /dev/null; then
    zip -r "$ZIP_NAME" "$RELEASE_NAME" > /dev/null
    mv "$ZIP_NAME" "$OLDPWD/$RELEASE_DIR/"
    echo -e "${GREEN}✓ Created: $RELEASE_DIR/$ZIP_NAME${NC}"
else
    echo -e "${BLUE}ℹ zip command not found - skipping .zip creation${NC}"
fi

# Cleanup
cd "$OLDPWD"
rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  Release packages created successfully!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "Files created:"
echo "  - $RELEASE_DIR/$ARCHIVE_NAME (Linux/Mac)"
if [ -f "$RELEASE_DIR/$ZIP_NAME" ]; then
    echo "  - $RELEASE_DIR/$ZIP_NAME (Windows)"
fi
echo ""
echo "Users can:"
echo "  1. Download and extract the archive"
echo "  2. Run the installer script for their platform"
echo "  3. Or use Docker with docker-compose up -d"
echo ""
