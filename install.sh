#!/bin/bash

##############################################################################
# ZeroBitOne Dashboard - Installation Script
# For Linux and macOS
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="ZeroBitOne Dashboard"
INSTALL_DIR="${INSTALL_DIR:-$HOME/ZeroBitOneDashboard}"
PORT="${PORT:-5000}"
NODE_MIN_VERSION="16"

##############################################################################
# Helper Functions
##############################################################################

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

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_command() {
    if command -v "$1" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

##############################################################################
# Pre-installation Checks
##############################################################################

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local missing_deps=0
    
    # Check for Node.js
    if check_command node; then
        local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -ge "$NODE_MIN_VERSION" ]; then
            print_success "Node.js $(node -v) found"
        else
            print_error "Node.js version $NODE_MIN_VERSION or higher required (found v$node_version)"
            missing_deps=1
        fi
    else
        print_error "Node.js is not installed"
        print_info "Install Node.js from: https://nodejs.org/"
        missing_deps=1
    fi
    
    # Check for npm
    if check_command npm; then
        print_success "npm $(npm -v) found"
    else
        print_error "npm is not installed"
        missing_deps=1
    fi
    
    # Check for git (optional but recommended)
    if check_command git; then
        print_success "git $(git --version | cut -d' ' -f3) found"
    else
        print_warning "git is not installed (optional but recommended)"
    fi
    
    if [ $missing_deps -eq 1 ]; then
        print_error "Missing required dependencies. Please install them and try again."
        exit 1
    fi
}

##############################################################################
# Installation
##############################################################################

create_installation_directory() {
    print_header "Creating Installation Directory"
    
    if [ -d "$INSTALL_DIR" ]; then
        print_warning "Directory $INSTALL_DIR already exists"
        read -p "Do you want to continue? This will overwrite existing files. (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Installation cancelled"
            exit 0
        fi
    else
        mkdir -p "$INSTALL_DIR"
        print_success "Created directory: $INSTALL_DIR"
    fi
}

copy_files() {
    print_header "Copying Application Files"
    
    # Get the directory where this script is located
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    
    # Copy all necessary files
    print_info "Copying files from $SCRIPT_DIR to $INSTALL_DIR..."
    
    # Copy package files
    cp "$SCRIPT_DIR/package.json" "$INSTALL_DIR/" 2>/dev/null || true
    cp "$SCRIPT_DIR/package-lock.json" "$INSTALL_DIR/" 2>/dev/null || true
    
    # Copy server directory
    if [ -d "$SCRIPT_DIR/server" ]; then
        cp -r "$SCRIPT_DIR/server" "$INSTALL_DIR/" 2>/dev/null || true
    fi
    
    # Copy public directory
    if [ -d "$SCRIPT_DIR/public" ]; then
        cp -r "$SCRIPT_DIR/public" "$INSTALL_DIR/" 2>/dev/null || true
    fi
    
    # Copy documentation
    cp "$SCRIPT_DIR/README.md" "$INSTALL_DIR/" 2>/dev/null || true
    cp "$SCRIPT_DIR/DATABASE_SETUP.md" "$INSTALL_DIR/" 2>/dev/null || true
    cp "$SCRIPT_DIR/INSTALLATION.md" "$INSTALL_DIR/" 2>/dev/null || true
    cp "$SCRIPT_DIR/QUICKSTART.md" "$INSTALL_DIR/" 2>/dev/null || true
    
    # Copy .env.example
    if [ -f "$SCRIPT_DIR/.env.example" ]; then
        cp "$SCRIPT_DIR/.env.example" "$INSTALL_DIR/.env.example"
    else
        # Create a basic .env.example if it doesn't exist
        cat > "$INSTALL_DIR/.env.example" << 'ENVEOF'
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
ENVEOF
    fi
    
    # Create data directory
    mkdir -p "$INSTALL_DIR/data"
    
    print_success "Files copied successfully"
}

install_dependencies() {
    print_header "Installing Dependencies"
    
    cd "$INSTALL_DIR"
    print_info "Running npm install (this may take a few minutes)..."
    
    if npm install --production; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

setup_environment() {
    print_header "Setting Up Environment"
    
    cd "$INSTALL_DIR"
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file with your configuration"
    else
        print_warning ".env file already exists - skipping"
    fi
}

create_startup_script() {
    print_header "Creating Startup Scripts"
    
    # Create start script
    cat > "$INSTALL_DIR/start.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "Starting ZeroBitOne Dashboard..."
npm start
EOF
    chmod +x "$INSTALL_DIR/start.sh"
    print_success "Created start.sh"
    
    # Create stop script
    cat > "$INSTALL_DIR/stop.sh" << 'EOF'
#!/bin/bash
echo "Stopping ZeroBitOne Dashboard..."
pkill -f "node.*server/index.js" && echo "Dashboard stopped" || echo "Dashboard not running"
EOF
    chmod +x "$INSTALL_DIR/stop.sh"
    print_success "Created stop.sh"
    
    # Create systemd service file (optional)
    cat > "$INSTALL_DIR/zerobitone.service" << EOF
[Unit]
Description=ZeroBitOne Dashboard
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=$(which node) $INSTALL_DIR/server/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
    print_success "Created systemd service file (zerobitone.service)"
}

create_desktop_shortcut() {
    print_header "Creating Desktop Shortcut"
    
    # For Linux with Desktop Entry support
    if [ -d "$HOME/.local/share/applications" ]; then
        cat > "$HOME/.local/share/applications/zerobitone.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=ZeroBitOne Dashboard
Comment=Self-hosted dashboard application
Exec=$INSTALL_DIR/start.sh
Icon=utilities-terminal
Terminal=true
Categories=Development;Utility;
EOF
        print_success "Created desktop shortcut"
    else
        print_info "Desktop shortcut not created (unsupported desktop environment)"
    fi
}

##############################################################################
# Post-Installation
##############################################################################

show_completion_message() {
    print_header "Installation Complete!"
    
    echo -e "${GREEN}$APP_NAME has been successfully installed!${NC}"
    echo ""
    echo -e "${BLUE}Installation Directory:${NC} $INSTALL_DIR"
    echo -e "${BLUE}Default Port:${NC} $PORT"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo ""
    echo "1. Configure your settings:"
    echo "   cd $INSTALL_DIR"
    echo "   nano .env"
    echo ""
    echo "2. Start the application:"
    echo "   cd $INSTALL_DIR"
    echo "   ./start.sh"
    echo "   OR"
    echo "   npm start"
    echo ""
    echo "3. Access the dashboard:"
    echo "   http://localhost:$PORT"
    echo ""
    echo "4. Login with default credentials:"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo "   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!"
    echo ""
    echo -e "${YELLOW}Optional: Install as System Service${NC}"
    echo "   sudo cp $INSTALL_DIR/zerobitone.service /etc/systemd/system/"
    echo "   sudo systemctl enable zerobitone"
    echo "   sudo systemctl start zerobitone"
    echo ""
    echo -e "${GREEN}Thank you for installing ZeroBitOne Dashboard!${NC}"
    echo ""
}

##############################################################################
# Main Installation Process
##############################################################################

main() {
    clear
    print_header "ZeroBitOne Dashboard - Installer"
    
    echo "This script will install $APP_NAME on your system."
    echo "Installation directory: $INSTALL_DIR"
    echo ""
    read -p "Press Enter to continue or Ctrl+C to cancel..."
    
    check_prerequisites
    create_installation_directory
    copy_files
    install_dependencies
    setup_environment
    create_startup_script
    create_desktop_shortcut
    show_completion_message
}

# Run main installation
main
