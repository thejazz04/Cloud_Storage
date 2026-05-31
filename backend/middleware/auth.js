const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

/**
 * Middleware to authenticate requests via JWT
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token missing or invalid.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      departmentId: decoded.departmentId
    };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Session expired or token invalid.' });
  }
};

/**
 * Middleware to require specific user roles
 * @param {string[]} allowedRoles 
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Access denied.' });
    }
    next();
  };
};

module.exports = {
  authenticateJWT,
  requireRole,
};
