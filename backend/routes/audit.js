const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit');
const { authenticateJWT, requireRole } = require('../middleware/auth');

// GET /api/audit (Admin-only)
router.get('/', authenticateJWT, requireRole(['Admin']), auditController.getAuditLogs);

module.exports = router;
