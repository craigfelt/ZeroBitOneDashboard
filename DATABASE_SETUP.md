# ZeroBitOne Dashboard - Database Setup Guide

## Overview

This dashboard uses **SQLite** as its database - a free, serverless, zero-configuration database that stores everything in a single file. Perfect for local deployments without any paid services!

## Why SQLite?

✅ **Completely Free** - No subscription costs, no cloud fees
✅ **Zero Configuration** - No database server to install or manage  
✅ **Self-Contained** - Everything stored in a single file
✅ **Reliable** - Battle-tested, used by millions of applications
✅ **Fast** - Excellent performance for small to medium workloads
✅ **Easy Backups** - Just copy the database file
✅ **Cross-Platform** - Works on Windows, Mac, Linux

## Database Location

The SQLite database is stored at:
```
/data/dashboard.db
```

This file contains all your data:
- Users and permissions
- User groups
- Tickets and comments
- Activity logs
- M365 sessions
- GitHub tasks

## Installation & Setup

### 1. Install Dependencies

The required packages are already included in `package.json`:

```bash
npm install
```

This installs:
- `better-sqlite3` - High-performance SQLite driver
- `sqlite3` - Node.js SQLite bindings

### 2. Automatic Database Initialization

The database is automatically created and initialized when you first start the server:

```bash
npm start
```

On first run, the system will:
1. Create the `/data` directory
2. Create `dashboard.db` file
3. Create all necessary tables
4. Seed initial data (admin user, categories, priorities, etc.)

### 3. Default Credentials

After setup, you can login with:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change this password immediately after first login!

## Database Schema

### Core Tables

#### Users Table
- Stores user accounts with bcrypt-hashed passwords
- Tracks roles (admin, user)
- Manages active/inactive status

#### User Groups & Permissions
- `user_groups` - Define permission groups
- `user_group_members` - Assign users to groups
- Default groups: Administrators, M365 Managers, GitHub Managers, Viewers

#### Tickets System
- `tickets` - Main ticket records with SLA tracking
- `ticket_categories` - Categories (Technical Support, Bug Report, etc.)
- `ticket_priorities` - Priority levels (Low, Medium, High, Critical)
- `ticket_statuses` - Status tracking (Open, In Progress, Resolved, etc.)
- `ticket_comments` - Conversation threads
- `ticket_watchers` - Users following tickets
- `ticket_tags` - Flexible tagging system
- `ticket_attachments` - File uploads (future feature)

#### Integration Tables
- `m365_sessions` - Microsoft 365 access tokens
- `github_tasks` - GitHub/Copilot agent task tracking
- `activity_log` - Audit trail of all actions

## Database Management

### Viewing the Database

You can inspect your database using any SQLite viewer:

**Command Line:**
```bash
sqlite3 data/dashboard.db
.tables          # List all tables
.schema tickets  # View table structure
SELECT * FROM users;
```

**GUI Tools (Free):**
- [DB Browser for SQLite](https://sqlitebrowser.org/) - Windows, Mac, Linux
- [SQLite Viewer](https://inloop.github.io/sqlite-viewer/) - Web-based
- [DBeaver](https://dbeaver.io/) - Universal database tool

### Backup Your Database

**Simple Backup:**
```bash
cp data/dashboard.db data/dashboard.backup.db
```

**Automated Daily Backup (Linux/Mac):**
```bash
# Add to crontab
0 2 * * * cp /path/to/data/dashboard.db /path/to/backups/dashboard-$(date +\%Y\%m\%d).db
```

**Windows Scheduled Task:**
```powershell
Copy-Item data\dashboard.db -Destination backups\dashboard-backup.db
```

### Restore from Backup

```bash
# Stop the server first!
cp data/dashboard.backup.db data/dashboard.db
# Restart the server
```

### Reset Database

If you want to start fresh:

```bash
# Stop the server
rm data/dashboard.db
# Restart the server - it will recreate everything
npm start
```

## Performance Considerations

### Good For:
- ✅ Single-server deployments
- ✅ Up to ~100,000 tickets
- ✅ Small to medium teams (1-100 users)
- ✅ Read-heavy workloads
- ✅ Development and testing

### Consider Upgrading To PostgreSQL/MySQL If:
- ❌ Need multi-server deployments
- ❌ Millions of records
- ❌ Very high concurrent write volume
- ❌ Need advanced features like full-text search, JSON queries

## Migration Path (If Needed Later)

If you outgrow SQLite, the application is designed for easy migration:

### PostgreSQL Migration

1. Install PostgreSQL locally:
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# Windows
# Download installer from postgresql.org
```

2. Create database:
```bash
createdb zerobitone
```

3. Update code to use PostgreSQL:
```bash
npm install pg
```

4. Update `server/config/database.js` to use `pg` instead of `better-sqlite3`

5. Export data from SQLite and import to PostgreSQL

### MySQL/MariaDB Migration

Similar process - install MySQL/MariaDB locally (also free) and migrate.

## Troubleshooting

### "Database is locked" Error

This happens when multiple processes try to write simultaneously.

**Solution:**
```javascript
// Already configured in database.js
db.pragma('journal_mode = WAL'); // Write-Ahead Logging
```

### "SQLITE_BUSY" Error

Too many concurrent writes.

**Solution:**
```javascript
// Add retry logic (already included)
db.pragma('busy_timeout = 5000'); // Wait 5 seconds
```

### Database File Corruption

Very rare, but if it happens:

```bash
# Check integrity
sqlite3 data/dashboard.db "PRAGMA integrity_check;"

# Repair (creates new file)
sqlite3 data/dashboard.db ".dump" | sqlite3 data/dashboard_new.db
mv data/dashboard_new.db data/dashboard.db
```

### Missing Tables After Update

```bash
# Recreate tables (preserves data)
npm start
```

The database initialization script uses `CREATE TABLE IF NOT EXISTS`, so it won't destroy existing data.

## Security Best Practices

1. **File Permissions**
   ```bash
   chmod 600 data/dashboard.db  # Only owner can read/write
   ```

2. **Backup Encryption**
   ```bash
   gpg -c data/dashboard.db  # Creates encrypted backup
   ```

3. **Regular Backups**
   - Set up automated daily backups
   - Store backups in a different location
   - Test restore procedures regularly

4. **Password Security**
   - Change default admin password immediately
   - All passwords are hashed with bcrypt
   - Never store passwords in plain text

## Advanced Configuration

### Enable WAL Mode (Better Concurrency)

Already enabled by default in `server/config/database.js`:

```javascript
db.pragma('journal_mode = WAL');
```

Benefits:
- Multiple readers + one writer simultaneously
- Better performance
- More reliable

### Optimize for Your Workload

```javascript
// For read-heavy workloads
db.pragma('cache_size = -64000'); // 64MB cache

// For write-heavy workloads  
db.pragma('synchronous = NORMAL');

// For maximum durability
db.pragma('synchronous = FULL');
```

## Monitoring

### Check Database Size

```bash
ls -lh data/dashboard.db
```

### Vacuum Database (Reclaim Space)

```bash
sqlite3 data/dashboard.db "VACUUM;"
```

Run this periodically to:
- Reclaim deleted space
- Defragment the database
- Improve performance

### Query Performance

```bash
sqlite3 data/dashboard.db
EXPLAIN QUERY PLAN SELECT * FROM tickets WHERE status_id = 1;
```

Indexes are already created for common queries.

## Cost Comparison

| Solution | Monthly Cost | Setup Complexity |
|----------|-------------|------------------|
| **SQLite (This)** | **$0** | **Zero config** |
| Supabase | $25+ | Medium |
| MongoDB Atlas | $57+ | Medium |
| AWS RDS | $15+ | High |
| Azure SQL | $5+ | High |

With SQLite, you pay **$0** and have **complete control** over your data!

## Support

For database issues:
1. Check this guide
2. Review server logs
3. Verify file permissions
4. Test database integrity
5. Check available disk space

## Summary

✨ **You're all set!** Your dashboard uses a free, reliable, local SQLite database. No subscriptions, no cloud dependencies, no complex setup. Just run `npm start` and everything works!

---

For more information about SQLite: https://sqlite.org/
