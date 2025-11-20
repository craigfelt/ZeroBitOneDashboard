# ZeroBitOne Dashboard - Release Notes

## Version 1.0.0

### 🎉 What's New

This release introduces **automated installers** and **Docker support** to make deploying ZeroBitOne Dashboard easier than ever!

### 📦 Download Options

#### Option 1: Release Archive (Recommended for Most Users)

Download the pre-packaged release archive:

**For Windows Users:**
- Download: `ZeroBitOneDashboard-v1.0.0.zip`
- Extract the ZIP file
- Run `install.bat` or `install.ps1`

**For Linux/Mac Users:**
- Download: `ZeroBitOneDashboard-v1.0.0.tar.gz`
- Extract: `tar -xzf ZeroBitOneDashboard-v1.0.0.tar.gz`
- Navigate: `cd ZeroBitOneDashboard-v1.0.0`
- Run: `chmod +x install.sh && ./install.sh`

#### Option 2: Clone from GitHub

```bash
git clone https://github.com/craigfelt/ZeroBitOneDashboard.git
cd ZeroBitOneDashboard
./install.sh  # or install.bat on Windows
```

#### Option 3: Docker

```bash
# Download and extract the release archive, then:
cd ZeroBitOneDashboard-v1.0.0
cp .env.example .env
docker-compose up -d
```

### ✨ New Features

#### Automated Installers

- **Windows**: `install.bat` and `install.ps1` (PowerShell)
- **Linux/Mac**: `install.sh` (Bash)
- Features:
  - Automatic prerequisite checking (Node.js, npm)
  - One-click installation
  - Creates desktop shortcuts
  - Creates system service files
  - Easy uninstallation

#### Docker Support

- **Dockerfile**: Alpine-based lightweight container
- **Dockerfile.debian**: Debian-based alternative (if Alpine has issues)
- **docker-compose.yml**: Complete orchestration setup
- Features:
  - Automatic health checks
  - Persistent data volumes
  - Easy configuration via environment variables
  - Automatic restart on failure

#### Release Packaging

- **create-release.sh**: Creates distributable packages for Linux/Mac
- **create-release.ps1**: Creates distributable packages for Windows
- Packages include:
  - All application files
  - Installation scripts
  - Docker configuration
  - Complete documentation

### 📖 Documentation

New documentation files:

- **INSTALLATION.md**: Comprehensive installation guide for all platforms
- **QUICKSTART.md**: Get started in 3 steps
- **DATABASE_SETUP.md**: Database management and migration guide (existing)
- **README.md**: Updated with new installation options

### 🔧 Installation Methods

1. **Automated Installer** (Easiest)
   - One-click installation
   - Automatic prerequisite checking
   - Desktop/Start Menu shortcuts
   - System service setup

2. **Docker** (Production Ready)
   - Containerized deployment
   - Easy updates
   - Isolated environment
   - Portable across systems

3. **Manual** (Developer Friendly)
   - Full control
   - Development mode support
   - Direct npm access

### 🛠️ Technical Details

#### System Requirements

**Minimum:**
- CPU: 1 core
- RAM: 512 MB
- Storage: 1 GB
- OS: Windows 10+, macOS 10.14+, Linux

**Recommended:**
- CPU: 2+ cores
- RAM: 2 GB
- Storage: 5 GB
- OS: Windows 11, macOS 12+, Ubuntu 20.04+

#### Software Requirements

- Node.js 16+ (for non-Docker installations)
- Docker 20.10+ (for Docker installations)
- npm 7+ (comes with Node.js)

### 📝 What's Included

Each release package contains:

```
ZeroBitOneDashboard-v1.0.0/
├── server/                 # Server-side application
├── public/                 # Frontend files
├── data/                   # Database directory (created on first run)
├── install.sh             # Linux/Mac installer
├── install.bat            # Windows batch installer
├── install.ps1            # Windows PowerShell installer
├── uninstall.sh           # Linux/Mac uninstaller
├── uninstall.bat          # Windows batch uninstaller
├── uninstall.ps1          # Windows PowerShell uninstaller
├── Dockerfile             # Docker configuration (Alpine)
├── Dockerfile.debian      # Docker configuration (Debian)
├── docker-compose.yml     # Docker Compose configuration
├── .dockerignore          # Docker ignore file
├── package.json           # Node.js dependencies
├── .env.example           # Environment configuration template
├── README.md              # Full documentation
├── DATABASE_SETUP.md      # Database guide
├── INSTALLATION.md        # Installation guide
└── QUICKSTART.md          # Quick start guide
```

### 🚀 Quick Start

1. **Download** the release package for your platform
2. **Extract** the archive
3. **Run** the installer (`install.sh` or `install.bat`)
4. **Access** the dashboard at `http://localhost:5000`
5. **Login** with `admin` / `admin123`
6. **Change** the default password immediately!

### 🔒 Security

- All passwords are hashed with bcrypt
- Session management with secure cookies
- Role-based access control (RBAC)
- Activity logging and audit trails
- Default credentials must be changed on first login

### 🐛 Known Issues

None at this time.

### 📞 Support

- **Documentation**: Check README.md, INSTALLATION.md, and DATABASE_SETUP.md
- **Issues**: [GitHub Issues](https://github.com/craigfelt/ZeroBitOneDashboard/issues)
- **Security**: Report privately to repository owner

### 🙏 Acknowledgments

Thank you to all users who requested easier installation methods!

### 📅 Release Date

November 20, 2025

---

**Enjoy your self-hosted dashboard without subscription fees!** 🎉
