const db = require('../config/database');

function findUserByUsername(username) {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username);
}

function findUserById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
}

function findUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

function createUser(userData) {
  const stmt = db.prepare(`
    INSERT INTO users (username, password, email, role, is_active) 
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    userData.username,
    userData.password,
    userData.email,
    userData.role || 'user',
    userData.isActive !== undefined ? userData.isActive : 1
  );
  
  const newUser = findUserById(result.lastInsertRowid);
  
  // Assign to groups if specified
  if (userData.groupIds && userData.groupIds.length > 0) {
    const assignStmt = db.prepare('INSERT INTO user_group_members (user_id, group_id) VALUES (?, ?)');
    userData.groupIds.forEach(groupId => {
      assignStmt.run(newUser.id, groupId);
    });
  }
  
  return newUser;
}

function updateUser(id, updates) {
  const fields = [];
  const values = [];
  
  if (updates.username !== undefined) {
    fields.push('username = ?');
    values.push(updates.username);
  }
  if (updates.password !== undefined) {
    fields.push('password = ?');
    values.push(updates.password);
  }
  if (updates.email !== undefined) {
    fields.push('email = ?');
    values.push(updates.email);
  }
  if (updates.role !== undefined) {
    fields.push('role = ?');
    values.push(updates.role);
  }
  if (updates.isActive !== undefined) {
    fields.push('is_active = ?');
    values.push(updates.isActive);
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  if (fields.length === 1) return findUserById(id); // Only updated_at, no real changes
  
  const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  
  // Update groups if specified
  if (updates.groupIds !== undefined) {
    // Remove existing groups
    db.prepare('DELETE FROM user_group_members WHERE user_id = ?').run(id);
    
    // Add new groups
    if (updates.groupIds.length > 0) {
      const assignStmt = db.prepare('INSERT INTO user_group_members (user_id, group_id) VALUES (?, ?)');
      updates.groupIds.forEach(groupId => {
        assignStmt.run(id, groupId);
      });
    }
  }
  
  return findUserById(id);
}

function deleteUser(id) {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

function getAllUsers() {
  const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
  return stmt.all();
}

function getUserGroups(userId) {
  const stmt = db.prepare(`
    SELECT g.* FROM user_groups g
    INNER JOIN user_group_members ugm ON g.id = ugm.group_id
    WHERE ugm.user_id = ?
  `);
  return stmt.all(userId);
}

function getAllGroups() {
  const stmt = db.prepare('SELECT * FROM user_groups ORDER BY name');
  return stmt.all();
}

function getUserPermissions(user) {
  const permissions = new Set();
  
  // Add role-based permissions
  if (user.role === 'admin') {
    permissions.add('all');
  }
  
  // Add group-based permissions
  const groups = getUserGroups(user.id);
  groups.forEach(group => {
    const groupPerms = JSON.parse(group.permissions);
    groupPerms.forEach(p => permissions.add(p));
  });
  
  return Array.from(permissions);
}

function hasPermission(user, permission) {
  const permissions = getUserPermissions(user);
  return permissions.includes('all') || permissions.includes(permission);
}

module.exports = {
  findUserByUsername,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserGroups,
  getAllGroups,
  getUserPermissions,
  hasPermission
};
