const express = require('express');
const router = express.Router();
const multer = require('multer');
const filesController = require('../controllers/files');
const { authenticateJWT } = require('../middleware/auth');
const { checkFilePermission } = require('../middleware/permission');

// Setup multer for in-memory file handling (15MB cap)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

// File routes
router.post('/upload', authenticateJWT, upload.single('file'), filesController.uploadFile);
router.get('/', authenticateJWT, filesController.getFiles);
router.get('/:id', authenticateJWT, checkFilePermission('view'), filesController.getFileById);
router.get('/:id/download', authenticateJWT, checkFilePermission('download'), filesController.downloadFile);
router.delete('/:id', authenticateJWT, checkFilePermission('delete'), filesController.deleteFile);

module.exports = router;
