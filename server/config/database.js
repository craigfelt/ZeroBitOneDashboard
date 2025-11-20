const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database file location
const DB_PATH = path.join(__dirname, '../../data/dashboard.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
  console.log('Initializing database...');

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User groups table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      permissions TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User-Group mapping table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_group_members (
      user_id INTEGER NOT NULL,
      group_id INTEGER NOT NULL,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, group_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE
    )
  `);

  // Tickets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_number TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      priority_id INTEGER NOT NULL,
      status_id INTEGER NOT NULL,
      created_by INTEGER NOT NULL,
      assigned_to INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      closed_at DATETIME,
      estimated_hours REAL,
      actual_hours REAL,
      sla_response_deadline DATETIME,
      sla_resolution_deadline DATETIME,
      sla_breached INTEGER DEFAULT 0,
      custom_fields TEXT,
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
  `);

  // Ticket categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ticket_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ticket priorities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ticket_priorities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      level INTEGER NOT NULL,
      color TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ticket statuses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ticket_statuses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ticket comments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ticket_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_internal INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Ticket attachments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ticket_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER,
      comment_id INTEGER,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      filesize INTEGER,
      mime_type TEXT,
      uploaded_by INTEGER NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
      FOREIGN KEY (comment_id) REFERENCES ticket_comments(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )
  `);

  // Ticket watchers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ticket_watchers (
      ticket_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (ticket_id, user_id),
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Ticket tags table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ticket_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ticket-Tag mapping table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ticket_tag_mapping (
      ticket_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (ticket_id, tag_id),
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES ticket_tags(id) ON DELETE CASCADE
    )
  `);

  // M365 sessions table (for tracking active M365 connections)
  db.exec(`
    CREATE TABLE IF NOT EXISTS m365_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // GitHub tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS github_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT UNIQUE NOT NULL,
      task_type TEXT NOT NULL,
      config TEXT,
      status TEXT NOT NULL,
      output TEXT,
      errors TEXT,
      started_by INTEGER NOT NULL,
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_time DATETIME,
      FOREIGN KEY (started_by) REFERENCES users(id)
    )
  `);

  // Activity log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status_id);
    CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority_id);
    CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
    CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON ticket_comments(ticket_id);
    CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);
  `);

  console.log('Database tables created successfully');
}

// Seed initial data
function seedDatabase() {
  console.log('Seeding initial data...');

  // Insert default user groups
  const insertGroup = db.prepare(`
    INSERT OR IGNORE INTO user_groups (id, name, permissions) 
    VALUES (?, ?, ?)
  `);

  const groups = [
    [1, 'Administrators', JSON.stringify(['all'])],
    [2, 'M365 Managers', JSON.stringify(['m365:read', 'm365:write', 'm365:admin'])],
    [3, 'GitHub Managers', JSON.stringify(['github:read', 'github:write', 'github:execute'])],
    [4, 'Viewers', JSON.stringify(['m365:read', 'github:read'])]
  ];

  groups.forEach(group => insertGroup.run(...group));

  // Insert default admin user (password: admin123)
  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, username, password, email, role, is_active) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(1, 'admin', hashedPassword, 'admin@zerobitone.com', 'admin', 1);

  // Assign admin to Administrators group
  const assignGroup = db.prepare(`
    INSERT OR IGNORE INTO user_group_members (user_id, group_id) 
    VALUES (?, ?)
  `);

  assignGroup.run(1, 1);

  // Insert ticket categories
  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO ticket_categories (id, name, color) 
    VALUES (?, ?, ?)
  `);

  const categories = [
    [1, 'Technical Support', '#3B82F6'],
    [2, 'Bug Report', '#EF4444'],
    [3, 'Feature Request', '#10B981'],
    [4, 'Access Request', '#F59E0B'],
    [5, 'Microsoft 365 Issue', '#8B5CF6'],
    [6, 'GitHub/Copilot Issue', '#EC4899'],
    [7, 'General Inquiry', '#6B7280']
  ];

  categories.forEach(cat => insertCategory.run(...cat));

  // Insert ticket priorities
  const insertPriority = db.prepare(`
    INSERT OR IGNORE INTO ticket_priorities (id, name, level, color) 
    VALUES (?, ?, ?, ?)
  `);

  const priorities = [
    [1, 'Low', 1, '#10B981'],
    [2, 'Medium', 2, '#F59E0B'],
    [3, 'High', 3, '#EF4444'],
    [4, 'Critical', 4, '#DC2626']
  ];

  priorities.forEach(priority => insertPriority.run(...priority));

  // Insert ticket statuses
  const insertStatus = db.prepare(`
    INSERT OR IGNORE INTO ticket_statuses (id, name, color) 
    VALUES (?, ?, ?)
  `);

  const statuses = [
    [1, 'Open', '#3B82F6'],
    [2, 'In Progress', '#F59E0B'],
    [3, 'Waiting for Response', '#8B5CF6'],
    [4, 'Resolved', '#10B981'],
    [5, 'Closed', '#6B7280'],
    [6, 'Reopened', '#EF4444']
  ];

  statuses.forEach(status => insertStatus.run(...status));

  console.log('Initial data seeded successfully');
}

// Initialize and seed database
initializeDatabase();
seedDatabase();

module.exports = db;
