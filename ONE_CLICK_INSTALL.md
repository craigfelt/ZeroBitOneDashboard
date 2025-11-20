# One-Click Installation Guide

## No Manual Download Required! 🎉

You can now install ZeroBitOne Dashboard with a **single file download** - no need to download the full repository first!

---

## Windows - One-Click Install

### Method 1: Download and Run (Easiest)

1. **Download ONE file:**
   - Right-click this link and "Save as": [bootstrap-install.bat](https://raw.githubusercontent.com/craigfelt/ZeroBitOneDashboard/main/bootstrap-install.bat)
   
2. **Run it:**
   - Double-click `bootstrap-install.bat`
   - That's it! The installer will automatically:
     - Download the latest release
     - Extract files
     - Install dependencies
     - Create shortcuts

### Method 2: PowerShell One-Liner

Open PowerShell and paste this command:

```powershell
iwr -useb https://raw.githubusercontent.com/craigfelt/ZeroBitOneDashboard/main/bootstrap-install.ps1 | iex
```

---

## Linux/Mac - One-Click Install

### Method 1: Download and Run

1. **Download ONE file:**
   ```bash
   curl -O https://raw.githubusercontent.com/craigfelt/ZeroBitOneDashboard/main/bootstrap-install.sh
   ```

2. **Run it:**
   ```bash
   chmod +x bootstrap-install.sh
   ./bootstrap-install.sh
   ```

### Method 2: One-Liner

Copy and paste this into your terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/craigfelt/ZeroBitOneDashboard/main/bootstrap-install.sh | bash
```

---

## What the Bootstrap Installer Does

1. ✅ **Downloads** the latest release automatically
2. ✅ **Extracts** the files
3. ✅ **Checks** for Node.js and dependencies
4. ✅ **Installs** everything
5. ✅ **Creates** shortcuts
6. ✅ **Cleans up** temporary files

---

## Alternative: Manual Download Method

If you prefer to download everything first:

### Windows
1. Download: [ZeroBitOneDashboard-v1.0.0.zip](https://github.com/craigfelt/ZeroBitOneDashboard/releases/latest)
2. Extract the ZIP
3. Run `install.bat`

### Linux/Mac
1. Download: [ZeroBitOneDashboard-v1.0.0.tar.gz](https://github.com/craigfelt/ZeroBitOneDashboard/releases/latest)
2. Extract: `tar -xzf ZeroBitOneDashboard-v1.0.0.tar.gz`
3. Run: `cd ZeroBitOneDashboard-v1.0.0 && ./install.sh`

---

## After Installation

The installer will ask: **"Would you like to start the application now?"**

Say **Yes** and the app starts automatically!

Or start it later:
- **Windows**: Double-click "ZeroBitOne Dashboard" on your desktop
- **Linux/Mac**: Run `./start.sh` or click the app icon

> 💡 **No manual Node.js management needed!** Node.js runs automatically in the background when you start the app - just like Java runs automatically for Minecraft. You never have to think about it!

1. **Access the dashboard:**
   ```
   http://localhost:5000
   ```

2. **Login:**
   - Username: `admin`
   - Password: `admin123`
   - ⚠️ **Change this immediately!**

3. **Optional Configuration:**
   - Edit `.env` file for Microsoft 365 or GitHub integration
   - See [INSTALLATION.md](INSTALLATION.md) for details

**Want auto-start on boot?** See [HOW_TO_RUN.md](HOW_TO_RUN.md) for instructions!

---

## Requirements

- **Node.js 16+** (installer will check for this)
- **Internet connection** (for bootstrap download)
- **curl/wget** (Linux/Mac - usually pre-installed)
- **PowerShell** (Windows - usually pre-installed)

---

## Comparison of Methods

| Method | Download Size | Steps | Internet Required |
|--------|---------------|-------|-------------------|
| **Bootstrap (One-Click)** | ~5 KB | 1-2 | Yes (during install) |
| **Manual Download** | ~81-94 KB | 3 | Only for download |
| **Docker** | Varies | 2-3 | Yes (for image) |

---

## Troubleshooting

### Bootstrap installer fails to download

**Windows:**
- Ensure PowerShell is available
- Check internet connection
- Try manual download method

**Linux/Mac:**
- Ensure curl or wget is installed: `sudo apt install curl` (Ubuntu/Debian)
- Check internet connection
- Try manual download method

### "Node.js not found"

Install Node.js from [nodejs.org](https://nodejs.org/) then run the installer again.

### Firewall blocks download

- Add exception for the installer
- Use manual download method instead

---

## Security Note

The bootstrap installers download from:
- GitHub releases (official release packages)
- GitHub raw content (for the bootstrap scripts themselves)

Always verify you're downloading from the official repository:
`https://github.com/craigfelt/ZeroBitOneDashboard`

---

## For Advanced Users

### Install specific version

**Windows:**
```powershell
.\bootstrap-install.ps1 -Version "1.0.0"
```

**Linux/Mac:**
```bash
VERSION=1.0.0 ./bootstrap-install.sh
```

### Customize installation directory

**Windows:**
```powershell
$env:INSTALL_DIR = "C:\MyApps\ZeroBitOne"
.\bootstrap-install.ps1
```

**Linux/Mac:**
```bash
INSTALL_DIR=/opt/zerobitone ./bootstrap-install.sh
```

---

## Summary

✨ **New users:** Use the one-click bootstrap installer!
- Windows: Download `bootstrap-install.bat` and run it
- Linux/Mac: `curl ... | bash` one-liner

📦 **Prefer control:** Use the manual download method
- Download full package from releases
- Extract and run installer

🐳 **Production:** Use Docker
- `docker-compose up -d`

---

**Now you can install with just ONE small file download!** 🚀
