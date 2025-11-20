#!/bin/bash

##############################################################################
# ZeroBitOne Dashboard - Uninstallation Script
# For Linux and macOS
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

INSTALL_DIR="${INSTALL_DIR:-$HOME/ZeroBitOneDashboard}"

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

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

uninstall() {
    print_header "ZeroBitOne Dashboard - Uninstaller"
    
    echo "This will remove ZeroBitOne Dashboard from your system."
    echo "Installation directory: $INSTALL_DIR"
    echo ""
    
    read -p "Do you want to keep your data (database)? (y/N): " -n 1 -r
    echo
    KEEP_DATA=$REPLY
    
    read -p "Are you sure you want to uninstall? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Uninstallation cancelled"
        exit 0
    fi
    
    print_header "Stopping Application"
    
    # Stop the application
    pkill -f "node.*server/index.js" && print_success "Stopped running application" || print_warning "Application not running"
    
    # Stop systemd service if installed
    if systemctl is-active --quiet zerobitone; then
        sudo systemctl stop zerobitone
        sudo systemctl disable zerobitone
        sudo rm -f /etc/systemd/system/zerobitone.service
        sudo systemctl daemon-reload
        print_success "Removed systemd service"
    fi
    
    print_header "Removing Files"
    
    # Backup data if requested
    if [[ $KEEP_DATA =~ ^[Yy]$ ]]; then
        BACKUP_DIR="$HOME/ZeroBitOne_Backup_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        if [ -d "$INSTALL_DIR/data" ]; then
            cp -r "$INSTALL_DIR/data" "$BACKUP_DIR/"
            print_success "Database backed up to: $BACKUP_DIR"
        fi
    fi
    
    # Remove installation directory
    if [ -d "$INSTALL_DIR" ]; then
        rm -rf "$INSTALL_DIR"
        print_success "Removed installation directory"
    fi
    
    # Remove desktop shortcut
    if [ -f "$HOME/.local/share/applications/zerobitone.desktop" ]; then
        rm -f "$HOME/.local/share/applications/zerobitone.desktop"
        print_success "Removed desktop shortcut"
    fi
    
    print_header "Uninstallation Complete"
    
    echo -e "${GREEN}ZeroBitOne Dashboard has been uninstalled.${NC}"
    if [[ $KEEP_DATA =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Your data has been backed up to: $BACKUP_DIR${NC}"
    fi
    echo ""
}

uninstall
