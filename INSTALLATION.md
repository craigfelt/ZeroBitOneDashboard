# ZeroBitOne Dashboard - Installation Guide

## Quick Start - Choose Your Installation Method

ZeroBitOne Dashboard can be installed in three ways:

1. **Automated Installer (Recommended)** - One-click installation
2. **Docker** - Containerized deployment
3. **Manual Installation** - Traditional npm install

---

## Method 1: Automated Installer (Recommended)

The automated installer handles everything for you: checking prerequisites, copying files, installing dependencies, and creating shortcuts.

### For Windows Users

1. **Download the Repository**
   - Download and extract the ZIP file from GitHub
   - Or clone: `git clone https://github.com/craigfelt/ZeroBitOneDashboard.git`

2. **Run the Installer**
   - Double-click `install.bat`
   - Or right-click `install.ps1` → "Run with PowerShell"
   
3. **Follow the Prompts**
   - The installer will check for Node.js (installs if missing)
   - Creates installation directory
   - Installs dependencies
   - Creates desktop and Start Menu shortcuts

4. **Start the Application**
   - Double-click the "ZeroBitOne Dashboard" shortcut on your desktop
   - Or run `start.bat` from the installation directory

5. **Access the Dashboard**
   - Open browser to: `http://localhost:5000`
   - Login with: `admin` / `admin123`
   - ⚠️ **Change password immediately!**

### For Linux/Mac Users

1. **Download the Repository**
   ```bash
   git clone https://github.com/craigfelt/ZeroBitOneDashboard.git
   cd ZeroBitOneDashboard
   ```

2. **Make Installer Executable**
   ```bash
   chmod +x install.sh
   ```

3. **Run the Installer**
   ```bash
   ./install.sh
   ```

4. **Follow the Prompts**
   - The installer will check for Node.js and npm
   - Creates installation directory (default: `~/ZeroBitOneDashboard`)
   - Installs dependencies
   - Creates startup scripts

5. **Start the Application**
   ```bash
   cd ~/ZeroBitOneDashboard
   ./start.sh
   ```
   
   Or use npm:
   ```bash
   npm start
   ```

6. **Access the Dashboard**
   - Open browser to: `http://localhost:5000`
   - Login with: `admin` / `admin123`
   - ⚠️ **Change password immediately!**

### Optional: Install as System Service (Linux)

For automatic startup on system boot:

```bash
sudo cp ~/ZeroBitOneDashboard/zerobitone.service /etc/systemd/system/
sudo systemctl enable zerobitone
sudo systemctl start zerobitone
```

Check status:
```bash
sudo systemctl status zerobitone
```

---

## Method 2: Docker Installation

Perfect for containerized deployments and easy updates.

### Prerequisites
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (usually included with Docker Desktop)

### Quick Start with Docker

1. **Clone the Repository**
   ```bash
   git clone https://github.com/craigfelt/ZeroBitOneDashboard.git
   cd ZeroBitOneDashboard
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env  # or use your preferred editor
   ```

3. **Build and Start**
   ```bash
   docker-compose up -d
   ```

4. **Access the Dashboard**
   - Open browser to: `http://localhost:5000`
   - Login with: `admin` / `admin123`

### Docker Management Commands

```bash
# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Restart
docker-compose restart

# Update to latest version
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Backup database
docker cp zerobitone-dashboard:/app/data/dashboard.db ./backup-$(date +%Y%m%d).db
```

### Docker - Advanced Configuration

**Custom Port:**
```bash
PORT=8080 docker-compose up -d
```

**Custom Data Directory:**
Edit `docker-compose.yml`:
```yaml
volumes:
  - /path/to/your/data:/app/data
```

**View Container Health:**
```bash
docker ps
docker inspect zerobitone-dashboard | grep -A 10 Health
```

---

## Method 3: Manual Installation

For developers or those who prefer manual control.

### Prerequisites
- Node.js 16 or higher ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- Git (optional but recommended)

### Installation Steps

1. **Clone or Download**
   ```bash
   git clone https://github.com/craigfelt/ZeroBitOneDashboard.git
   cd ZeroBitOneDashboard
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your settings:
   ```bash
   nano .env  # Linux/Mac
   notepad .env  # Windows
   ```

4. **Start the Application**
   
   **Development mode (with auto-reload):**
   ```bash
   npm run dev
   ```
   
   **Production mode:**
   ```bash
   npm start
   ```

5. **Access the Dashboard**
   - Open browser to: `http://localhost:5000`
   - Login with: `admin` / `admin123`

---

## Configuration

### Environment Variables

Edit the `.env` file to configure the application:

```bash
# Server Configuration
PORT=5000                          # Port to run the application
NODE_ENV=production                # Environment (development/production)
SESSION_SECRET=change-this-secret  # Session encryption key

# Microsoft 365 Integration (Optional)
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id
AZURE_REDIRECT_URI=http://localhost:5000/api/auth/m365/callback

# GitHub Integration (Optional)
GITHUB_TOKEN=your-github-token
GITHUB_ORG=your-github-org
```

### Microsoft 365 Setup (Optional)

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory → App registrations
3. Create new registration
4. Add API permissions:
   - `User.Read.All`
   - `Group.Read.All`
   - `Mail.Read`
   - `Calendars.Read`
   - `Files.Read.All`
5. Create client secret
6. Add credentials to `.env`

### GitHub Setup (Optional)

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Generate new token (classic)
3. Select scopes:
   - `repo` (Full control of repositories)
   - `workflow` (Update GitHub Actions)
   - `admin:org` (if using organizations)
4. Add token to `.env`

---

## Post-Installation

### Change Default Password

⚠️ **IMPORTANT**: Change the default admin password immediately!

1. Login with `admin` / `admin123`
2. Go to Settings → User Management
3. Change password

### Database Location

The SQLite database is stored at:
- **Linux/Mac**: `~/ZeroBitOneDashboard/data/dashboard.db`
- **Windows**: `C:\Users\YourUsername\ZeroBitOneDashboard\data\dashboard.db`
- **Docker**: `/app/data/dashboard.db` (mapped to host `./data/`)

### Backup Your Data

**Manual Backup:**
```bash
# Linux/Mac
cp ~/ZeroBitOneDashboard/data/dashboard.db ~/backup-$(date +%Y%m%d).db

# Windows
copy %USERPROFILE%\ZeroBitOneDashboard\data\dashboard.db backup.db

# Docker
docker cp zerobitone-dashboard:/app/data/dashboard.db ./backup.db
```

**Automated Daily Backup (Linux/Mac):**
```bash
# Add to crontab
crontab -e

# Add this line (runs at 2 AM daily)
0 2 * * * cp ~/ZeroBitOneDashboard/data/dashboard.db ~/backups/dashboard-$(date +\%Y\%m\%d).db
```

---

## Updating

### Automated Installer Version
```bash
cd ZeroBitOneDashboard
git pull
npm install
npm start
```

### Docker Version
```bash
cd ZeroBitOneDashboard
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Manual Version
```bash
cd ZeroBitOneDashboard
git pull
npm install
npm start
```

---

## Uninstalling

### Windows
- Double-click `uninstall.bat`
- Or run `uninstall.ps1` with PowerShell
- Choose whether to keep your data

### Linux/Mac
```bash
chmod +x uninstall.sh
./uninstall.sh
```

### Docker
```bash
docker-compose down -v  # Removes containers and volumes
rm -rf ZeroBitOneDashboard
```

---

## Troubleshooting

### Installation Issues

**"Node.js not found"**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Minimum version: 16.x

**"npm install fails"**
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**"Port 5000 already in use"**
- Change port in `.env`: `PORT=8080`
- Or kill process using port 5000

**"Database locked error"**
- Ensure only one instance is running
- Stop all Node.js processes
- Restart the application

### Docker Issues

**"Cannot connect to Docker daemon"**
- Ensure Docker Desktop is running
- On Linux: `sudo systemctl start docker`

**"Port already allocated"**
- Change port: `PORT=8080 docker-compose up -d`

**"Build fails"**
- Update Docker: `docker --version` (need 20.10+)
- Clear build cache: `docker system prune -a`

### Application Issues

**"Cannot login"**
- Use default credentials: `admin` / `admin123`
- Clear browser cookies
- Check `.env` file exists

**"M365 integration not working"**
- Verify Azure credentials in `.env`
- Check API permissions in Azure Portal
- Review server logs

**"GitHub integration not working"**
- Verify GitHub token in `.env`
- Check token has required scopes
- Review server logs

---

## System Requirements

### Minimum Requirements
- **CPU**: 1 core
- **RAM**: 512 MB
- **Storage**: 1 GB free space
- **OS**: Windows 10+, macOS 10.14+, Linux (any modern distribution)

### Recommended Requirements
- **CPU**: 2+ cores
- **RAM**: 2 GB
- **Storage**: 5 GB free space
- **OS**: Windows 11, macOS 12+, Ubuntu 20.04+

### Software Requirements
- **Node.js**: 16.x or higher
- **npm**: 7.x or higher
- **Docker**: 20.10+ (for Docker installation only)

---

## Getting Help

- **Documentation**: Check README.md and DATABASE_SETUP.md
- **Issues**: [GitHub Issues](https://github.com/craigfelt/ZeroBitOneDashboard/issues)
- **Security**: Report privately to repository owner

---

## Next Steps After Installation

1. ✅ Change default admin password
2. ✅ Configure environment variables (if using M365 or GitHub)
3. ✅ Set up automated backups
4. ✅ Review user roles and permissions
5. ✅ Create additional user accounts
6. ✅ Test M365 and GitHub integrations
7. ✅ Configure ticketing system categories

---

**Congratulations! You've successfully installed ZeroBitOne Dashboard!** 🎉

For more information, see:
- [README.md](README.md) - Full application documentation
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database management guide
