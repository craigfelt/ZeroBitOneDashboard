# ZeroBitOne Dashboard - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Choose Your Installation Method

#### Option A: Automated Installer (Easiest) ⭐

**Windows:**
```
1. Download or clone this repository
2. Double-click install.bat
3. Follow the prompts
```

**Linux/Mac:**
```bash
git clone https://github.com/craigfelt/ZeroBitOneDashboard.git
cd ZeroBitOneDashboard
chmod +x install.sh
./install.sh
```

#### Option B: Docker (Recommended for Production)

```bash
git clone https://github.com/craigfelt/ZeroBitOneDashboard.git
cd ZeroBitOneDashboard
cp .env.example .env
docker-compose up -d
```

#### Option C: Manual Installation

```bash
git clone https://github.com/craigfelt/ZeroBitOneDashboard.git
cd ZeroBitOneDashboard
npm install
cp .env.example .env
npm start
```

### Step 2: Access the Dashboard

Open your web browser to:
```
http://localhost:5000
```

### Step 3: Login

Default credentials:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change this password immediately after first login!

---

## 🎯 What's Next?

### Configure Integrations (Optional)

Edit the `.env` file to add:
- **Microsoft 365**: Connect your M365 account
- **GitHub**: Add your GitHub token

### Create Users

1. Go to Settings → User Management
2. Add team members
3. Assign roles and permissions

### Start Using Features

- **Ticketing System**: Create and manage support tickets
- **M365 Integration**: Access emails, calendar, files
- **GitHub Integration**: Run workflows and manage repositories

---

## 📖 Full Documentation

For detailed information, see:
- [INSTALLATION.md](INSTALLATION.md) - Complete installation guide
- [README.md](README.md) - Full feature documentation
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database management

---

## 🆘 Need Help?

**Common Issues:**

1. **Port already in use**
   - Change port in `.env`: `PORT=8080`

2. **Cannot install dependencies**
   - Ensure Node.js 16+ is installed
   - Run: `npm cache clean --force`

3. **Database locked**
   - Stop all running instances
   - Restart the application

**Get Support:**
- Check documentation files
- Open an issue on GitHub
- Review server logs in the console

---

## 🎉 You're All Set!

Enjoy using ZeroBitOne Dashboard - your complete self-hosted solution!
