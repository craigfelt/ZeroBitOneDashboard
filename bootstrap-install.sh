#!/bin/bash

##############################################################################
# ZeroBitOne Dashboard - Bootstrap Installer
# Downloads and installs the application automatically
##############################################################################

set -e

# Configuration
REPO_OWNER="craigfelt"
REPO_NAME="ZeroBitOneDashboard"
VERSION="${VERSION:-latest}"
GITHUB_API="https://api.github.com"
GITHUB_DOWNLOAD="https://github.com"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}============================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check for required commands
check_dependencies() {
    print_header "Checking Dependencies"
    
    local missing=0
    
    # Check for curl or wget
    if command -v curl &> /dev/null; then
        DOWNLOAD_CMD="curl"
        print_success "curl found"
    elif command -v wget &> /dev/null; then
        DOWNLOAD_CMD="wget"
        print_success "wget found"
    else
        print_error "Neither curl nor wget found. Please install one of them."
        missing=1
    fi
    
    # Check for tar
    if command -v tar &> /dev/null; then
        print_success "tar found"
    else
        print_error "tar not found. Please install tar."
        missing=1
    fi
    
    if [ $missing -eq 1 ]; then
        exit 1
    fi
}

# Get latest release info
get_release_url() {
    print_header "Getting Release Information"
    
    if [ "$VERSION" = "latest" ]; then
        print_info "Fetching latest release..."
        
        if [ "$DOWNLOAD_CMD" = "curl" ]; then
            RELEASE_DATA=$(curl -sL "$GITHUB_API/repos/$REPO_OWNER/$REPO_NAME/releases/latest")
        else
            RELEASE_DATA=$(wget -qO- "$GITHUB_API/repos/$REPO_OWNER/$REPO_NAME/releases/latest")
        fi
        
        # Extract download URL for .tar.gz
        DOWNLOAD_URL=$(echo "$RELEASE_DATA" | grep -o "https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/[^\"]*\.tar\.gz" | head -1)
        
        if [ -z "$DOWNLOAD_URL" ]; then
            print_error "Could not find release download URL"
            print_info "Falling back to main branch download..."
            DOWNLOAD_URL="$GITHUB_DOWNLOAD/$REPO_OWNER/$REPO_NAME/archive/refs/heads/main.tar.gz"
        fi
    else
        DOWNLOAD_URL="$GITHUB_DOWNLOAD/$REPO_OWNER/$REPO_NAME/releases/download/v$VERSION/ZeroBitOneDashboard-v$VERSION.tar.gz"
    fi
    
    print_success "Download URL: $DOWNLOAD_URL"
}

# Download the release
download_release() {
    print_header "Downloading Application"
    
    TEMP_DIR=$(mktemp -d)
    ARCHIVE_FILE="$TEMP_DIR/zerobitone.tar.gz"
    
    print_info "Downloading to $TEMP_DIR..."
    
    if [ "$DOWNLOAD_CMD" = "curl" ]; then
        curl -L -o "$ARCHIVE_FILE" "$DOWNLOAD_URL" --progress-bar
    else
        wget -O "$ARCHIVE_FILE" "$DOWNLOAD_URL" --show-progress
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Download complete"
    else
        print_error "Download failed"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
}

# Extract the archive
extract_release() {
    print_header "Extracting Archive"
    
    cd "$TEMP_DIR"
    tar -xzf "$ARCHIVE_FILE"
    
    # Find the extracted directory
    EXTRACTED_DIR=$(find . -maxdepth 1 -type d -name "ZeroBitOne*" | head -1)
    
    if [ -z "$EXTRACTED_DIR" ]; then
        print_error "Could not find extracted directory"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    print_success "Extracted to $EXTRACTED_DIR"
}

# Run the installer
run_installer() {
    print_header "Running Installer"
    
    cd "$EXTRACTED_DIR"
    
    if [ -f "install.sh" ]; then
        chmod +x install.sh
        ./install.sh
    else
        print_error "install.sh not found in the package"
        print_info "You can manually install by running:"
        print_info "  cd $EXTRACTED_DIR"
        print_info "  npm install"
        print_info "  npm start"
        exit 1
    fi
}

# Cleanup
cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        print_info "Cleaning up temporary files..."
        rm -rf "$TEMP_DIR"
    fi
}

# Main installation process
main() {
    clear
    print_header "ZeroBitOne Dashboard - Bootstrap Installer"
    
    echo "This script will:"
    echo "  1. Download the latest ZeroBitOne Dashboard release"
    echo "  2. Extract the files"
    echo "  3. Run the installer automatically"
    echo ""
    read -p "Press Enter to continue or Ctrl+C to cancel..."
    
    check_dependencies
    get_release_url
    download_release
    extract_release
    run_installer
    cleanup
    
    print_header "Bootstrap Complete!"
    echo "The application has been installed."
    echo ""
}

# Trap cleanup on exit
trap cleanup EXIT

# Run main
main
