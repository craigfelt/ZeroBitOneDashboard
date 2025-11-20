const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { createUser, findUserByUsername, findUserByEmail } = require('../models/user');
const { ensureAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: info.message || 'Invalid credentials' });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login error' });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return res.json({
        message: 'Login successful',
        user: userWithoutPassword
      });
    });
  })(req, res, next);
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, groupIds } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
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
      role: 'user',
      groupIds: groupIds || [4] // Default to Viewers group
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout error' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
router.get('/me', ensureAuthenticated, (req, res) => {
  const { password, ...userWithoutPassword } = req.user;
  const { getUserPermissions } = require('../models/user');
  
  res.json({
    user: userWithoutPassword,
    permissions: getUserPermissions(req.user)
  });
});

module.exports = router;
