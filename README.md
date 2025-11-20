# ZeroBitOne Dashboard

> 🎉 **NEW!** One-click installation now available! No manual downloads or Node.js management required. See [Quick Start](#quick-start) below.

A comprehensive, self-hosted dashboard application with Microsoft 365 integration, GitHub/Copilot agent management, and a complete ticketing system. Built with security, flexibility, and ease of use in mind.

## Features

### 🎫 Complete Ticketing System
- Create, manage, and track support tickets
- Multiple categories, priorities, and statuses
- Comments and conversation threads
- SLA tracking with automatic breach detection
- Ticket watchers and notifications
- Rich statistics and reporting
- Custom fields support

### 🔐 Strong Security & User Management
- Secure user authentication with bcrypt password hashing
- Role-based access control (RBAC)
- User groups with granular permissions
- Session management with express-session
- Activity logging and audit trails
- Admin, manager, and viewer roles

### ☁️ Microsoft 365 Integration
- Connect via Microsoft Graph API
- Live data feeds for emails, calendar, files
- User and group management
- SharePoint and Teams integration
- Real-time status monitoring
- Error tracking and reporting

### 🤖 GitHub & Copilot Agent Integration
- Execute GitHub workflows from the dashboard
- GUI for running Copilot agent tasks
- Repository and workflow management
- Task status monitoring
- Input forms for API variables
- Issue and PR management

### 💾 Free Local Database (SQLite)
- No subscription costs or cloud dependencies
- Zero-configuration setup
- Single-file database for easy backups
- Excellent performance for small-medium workloads
- Complete data ownership

## Quick Start

> 🚀 **New!** We now provide automated installers and pre-packaged releases for easy setup! See [INSTALLATION.md](INSTALLATION.md) for all installation methods.

### 📥 Download

**Option A: Release Package (Recommended)**
- Download from [GitHub Releases](https://github.com/craigfelt/ZeroBitOneDashboard/releases)
- Extract and run the installer for your platform

**Option B: Clone Repository**
```bash
git clone https://github.com/craigfelt/ZeroBitOneDashboard.git
cd ZeroBitOneDashboard
```

### Installation Options

Choose the method that works best for you:

#### Option 1: Automated Installer (Recommended)

**Windows:**
- Download release ZIP or clone repository
- Double-click `install.bat`
- Follow the prompts

**Linux/Mac:**
```bash
# After downloading or cloning:
chmod +x install.sh
./install.sh
```

#### Option 2: Docker (For Production)

```bash
# After downloading or cloning:
cp .env.example .env
docker-compose up -d
```

#### Option 3: Manual Installation

### Prerequisites
- Node.js 16+ installed
- Git (for cloning the repository)

1. **Clone the repository**
   ```bash
   git clone https://github.com/craigfelt/ZeroBitOneDashboard.git
   cd ZeroBitOneDashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your settings (see Configuration section below)

4. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Access the dashboard**
   
   Open your browser to: `http://localhost:5000`
   
   Default login credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
   
   ⚠️ **Change this password immediately after first login!**

## Configuration

### Environment Variables

Edit `.env` file with your settings:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
SESSION_SECRET=your-secret-key-change-in-production

# Microsoft 365 / Azure AD Configuration (Optional)
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-tenant-id
AZURE_REDIRECT_URI=http://localhost:5000/api/auth/m365/callback

# GitHub Configuration (Optional)
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_ORG=your-github-organization
```

### Microsoft 365 Setup (Optional)

To enable M365 integration:

1. Register an application in [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory > App registrations
3. Create a new registration
4. Add API permissions for Microsoft Graph:
   - `User.Read.All`
   - `Group.Read.All`
   - `Mail.Read`
   - `Calendars.Read`
   - `Files.Read.All`
5. Create a client secret
6. Add credentials to `.env` file

### GitHub Setup (Optional)

To enable GitHub integration:

1. Generate a [Personal Access Token](https://github.com/settings/tokens)
2. Required scopes:
   - `repo` (Full control of repositories)
   - `workflow` (Update GitHub Actions workflows)
   - `admin:org` (if using organization features)
3. Add token to `.env` file

## Database Setup

This application uses **SQLite** - a free, local, file-based database.

### Automatic Setup
The database is automatically created and initialized on first run. No manual steps required!

### Location
Database file: `/data/dashboard.db`

### Detailed Information
See [DATABASE_SETUP.md](DATABASE_SETUP.md) for:
- Complete schema documentation
- Backup and restore procedures
- Performance tuning
- Migration guides
- Troubleshooting

### Default Data
On first run, the system creates:
- Admin user (admin/admin123)
- 4 user groups with permissions
- 7 ticket categories
- 4 priority levels
- 6 status types

## Project Structure

```
ZeroBitOneDashboard/
├── server/
│   ├── config/
│   │   ├── database.js       # SQLite database setup
│   │   └── passport.js       # Authentication configuration
│   ├── middleware/
│   │   └── auth.js           # Authentication middleware
│   ├── models/
│   │   ├── user.js           # User model and permissions
│   │   └── ticket.js         # Ticket model
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── users.js          # User management routes
│   │   ├── tickets.js        # Ticketing system routes
│   │   ├── m365.js           # Microsoft 365 integration
│   │   └── github.js         # GitHub/Copilot integration
│   ├── services/
│   │   ├── m365Service.js    # M365 API client
│   │   └── githubService.js  # GitHub API client
│   └── index.js              # Express server entry point
├── public/
│   ├── index.html            # Main HTML file
│   ├── app.js                # React application
│   └── styles.css            # Stylesheet
├── data/
│   └── dashboard.db          # SQLite database (auto-created)
├── .env                      # Environment configuration
├── .env.example              # Environment template
├── package.json              # Dependencies
├── DATABASE_SETUP.md         # Database documentation
└── README.md                 # This file
```

## User Roles & Permissions

### Administrator
- Full system access
- User management
- All M365 and GitHub operations
- Ticket management

### M365 Manager
- Read/write M365 data
- Manage data feeds
- View all M365 resources

### GitHub Manager
- Read/write GitHub data
- Execute workflows and tasks
- Manage repositories

### Viewer
- Read-only access to M365 and GitHub
- Can create tickets
- View dashboards

## API Documentation

### Authentication Endpoints

```
POST /api/auth/login          # Login
POST /api/auth/logout         # Logout
POST /api/auth/register       # Register new user
GET  /api/auth/me             # Get current user
```

### Ticket Endpoints

```
GET    /api/tickets           # List tickets (with filters)
POST   /api/tickets           # Create ticket
GET    /api/tickets/:id       # Get ticket details
PUT    /api/tickets/:id       # Update ticket
DELETE /api/tickets/:id       # Delete ticket (admin only)
POST   /api/tickets/:id/comments        # Add comment
GET    /api/metadata/tickets  # Get categories, priorities, statuses
GET    /api/statistics/tickets # Get ticket statistics
```

### M365 Endpoints

```
GET  /api/m365/users          # List M365 users
GET  /api/m365/groups         # List groups
GET  /api/m365/teams          # List Teams
POST /api/m365/feeds/start    # Start data feed
GET  /api/m365/feeds          # List active feeds
```

### GitHub Endpoints

```
GET  /api/github/repositories              # List repositories
GET  /api/github/repositories/:owner/:repo/workflows # List workflows
POST /api/github/repositories/:owner/:repo/workflows/:id/dispatch # Trigger workflow
POST /api/github/copilot/tasks             # Execute Copilot task
GET  /api/github/tasks                     # List running tasks
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Secure, HTTP-only cookies
- **CSRF Protection**: Built-in express protections
- **SQL Injection Prevention**: Parameterized queries
- **Permission System**: Granular access control
- **Activity Logging**: Audit trail of all actions
- **Secure Headers**: Protection against common attacks

## Backup & Maintenance

### Daily Database Backup

Create a simple backup script:

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d)
cp data/dashboard.db backups/dashboard-$DATE.db
```

Run daily via cron:
```bash
0 2 * * * /path/to/backup.sh
```

### Vacuum Database (Monthly)

Optimize database performance:
```bash
sqlite3 data/dashboard.db "VACUUM;"
```

## Troubleshooting

### Server won't start
- Check if port 5000 is available
- Verify Node.js version (16+)
- Check `.env` file exists
- Review server logs

### Cannot login
- Verify default credentials (admin/admin123)
- Check database file exists
- Clear browser cookies
- Check session secret in `.env`

### M365 integration not working
- Verify Azure credentials in `.env`
- Check API permissions in Azure Portal
- Ensure network can reach Microsoft Graph API
- Review server logs for specific errors

### Database locked errors
- Already handled with WAL mode
- If persists, check file permissions
- Ensure only one server instance running

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for automatic server restart on file changes.

### Adding New Features

1. Backend API: Add routes in `server/routes/`
2. Database: Update schema in `server/config/database.js`
3. Models: Add business logic in `server/models/`
4. Frontend: Update React components in `public/app.js`

## Technology Stack

### Backend
- **Node.js & Express** - Server framework
- **SQLite & better-sqlite3** - Database
- **Passport.js** - Authentication
- **bcrypt** - Password hashing
- **Microsoft Graph Client** - M365 integration
- **Octokit** - GitHub API client

### Frontend
- **React 18** - UI framework (via CDN)
- **Font Awesome** - Icons
- **Pure CSS** - Responsive design

## Performance

### Recommended Limits (SQLite)
- Users: Up to 100 concurrent
- Tickets: Up to 100,000
- Comments: Unlimited
- File size: Grows with data, typically < 1GB

### Scaling Options
If you outgrow SQLite:
- PostgreSQL (free, local or cloud)
- MySQL/MariaDB (free, local or cloud)
- See [DATABASE_SETUP.md](DATABASE_SETUP.md) for migration guides

## License

ISC License - Free for personal and commercial use

## Support

- Documentation: Check README.md and DATABASE_SETUP.md
- Database issues: See DATABASE_SETUP.md
- GitHub Issues: Report bugs and feature requests
- Security issues: Report privately to repository owner

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Roadmap

- [ ] File attachment support for tickets
- [ ] Email notifications
- [ ] Advanced reporting and analytics
- [ ] Mobile-responsive improvements
- [ ] Dark mode theme
- [ ] Export tickets to PDF/CSV
- [ ] Integration with more services (Slack, Teams notifications)
- [ ] Two-factor authentication (2FA)
- [ ] REST API documentation (Swagger/OpenAPI)

---

**Made with ❤️ for teams who want complete control over their dashboard without subscription fees.**
