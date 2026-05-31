const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { authenticateJWT, requireRole } = require('../middleware/auth');

// Employees can read users list (e.g. to search who to share with)
router.get('/', authenticateJWT, usersController.getUsers);

// Only Admins can modify user roles or departments
router.post('/', authenticateJWT, requireRole(['Admin']), (req, res) => {
  // Translate req.body.id to req.params.id so usersController.updateUser can digest it
  if (req.body.id) {
    req.params.id = req.body.id;
  }
  return usersController.updateUser(req, res);
});

// Only Admins can delete users
router.delete('/:id', authenticateJWT, requireRole(['Admin']), usersController.deleteUser);

module.exports = router;
