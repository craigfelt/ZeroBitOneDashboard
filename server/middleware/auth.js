// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

// Middleware to check if user has required permission
function checkPermission(permission) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { hasPermission } = require('../models/user');
    
    if (hasPermission(req.user, permission)) {
      return next();
    }
    
    res.status(403).json({ error: 'Insufficient permissions' });
  };
}

// Middleware to check if user is admin
function ensureAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role === 'admin') {
    return next();
  }
  
  res.status(403).json({ error: 'Admin access required' });
}

module.exports = {
  ensureAuthenticated,
  checkPermission,
  ensureAdmin
};
