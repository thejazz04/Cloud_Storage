const express = require('express');
const router = express.Router();
const departmentsController = require('../controllers/departments');
const { authenticateJWT, requireRole } = require('../middleware/auth');

// Employees and Admins can view departments (used for registration selection and filtering)
router.get('/', authenticateJWT, departmentsController.getDepartments);

// Only Admin can create new departments
router.post('/', authenticateJWT, requireRole(['Admin']), departmentsController.createDepartment);

module.exports = router;
