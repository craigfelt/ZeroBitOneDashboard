const express = require('express');
const bcrypt = require('bcryptjs');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const {
  findUserById,
  findUserByUsername,
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getAllGroups,
  getUserPermissions
} = require('../models/user');

const router = express.Router();

// Get all users (admin only)
router.get('/', ensureAuthenticated, ensureAdmin, (req, res) => {
  try {
    const users = getAllUsers();
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json({ users: usersWithoutPasswords });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', ensureAuthenticated, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Users can view their own profile, admins can view anyone
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const user = findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user;
    
    res.json({ 
      user: userWithoutPassword,
      permissions: getUserPermissions(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user (admin only)
router.post('/', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const { username, email, password, role, groupIds } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email, and password are required' 
      });
    }
    
    // Check if user already exists
    if (findUserByUsername(username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    if (findUserByEmail(email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = createUser({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      groupIds: groupIds || [4] // Default to Viewers group
    });
    
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user
router.put('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Users can update their own profile, admins can update anyone
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const updates = { ...req.body };
    
    // Hash password if it's being updated
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    
    // Only admins can change roles and groups
    if (req.user.role !== 'admin') {
      delete updates.role;
      delete updates.groupIds;
    }
    
    const updatedUser = updateUser(userId, updates);
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.json({
      message: 'User updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user (admin only)
router.delete('/:id', ensureAuthenticated, ensureAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent deleting yourself
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const deleted = deleteUser(userId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all user groups
router.get('/groups/all', ensureAuthenticated, (req, res) => {
  try {
    const groups = getAllGroups();
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's permissions
router.get('/:id/permissions', ensureAuthenticated, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Users can view their own permissions, admins can view anyone's
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const user = findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const permissions = getUserPermissions(user);
    
    res.json({ permissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
