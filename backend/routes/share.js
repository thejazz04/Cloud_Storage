const express = require('express');
const router = express.Router();
const shareController = require('../controllers/share');
const { authenticateJWT } = require('../middleware/auth');

// Map to POST /api/share and GET /api/shared
router.post('/share', authenticateJWT, shareController.shareFile);
router.get('/shared', authenticateJWT, shareController.getSharedFiles);

module.exports = router;
