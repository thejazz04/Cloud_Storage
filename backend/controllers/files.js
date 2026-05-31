const crypto = require('crypto');
const db = require('../config/db');
const s3Service = require('../services/s3Service');
const { logAction } = require('../services/auditService');

/**
 * Upload a file to S3 and save metadata in Database
 */
const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const userId = req.user.id;
  const userDeptId = req.user.departmentId;

  if (!userDeptId) {
    return res.status(400).json({ error: 'You must be assigned to a department to upload files.' });
  }

  const originalName = req.file.originalname;
  const mimeType = req.file.mimetype;
  const fileSize = req.file.size;
  const fileBuffer = req.file.buffer;

  // Generate unique S3 key to avoid collisions
  const fileUuid = crypto.randomUUID();
  const fileExtension = originalName.includes('.') ? originalName.substring(originalName.lastIndexOf('.')) : '';
  const s3Key = `uploads/${userDeptId}/${fileUuid}${fileExtension}`;

  try {
    // 1. Upload to S3
    await s3Service.uploadFileToS3(fileBuffer, s3Key, mimeType);

    // 2. Save file metadata to PostgreSQL
    const insertQuery = `
      INSERT INTO files (filename, s3_key, owner_id, department_id, file_size, mime_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const insertRes = await db.query(insertQuery, [
      originalName,
      s3Key,
      userId,
      userDeptId,
      fileSize,
      mimeType,
    ]);
    const fileRecord = insertRes.rows[0];

    // 3. Log the action
    await logAction(userId, 'Upload', fileRecord.id, `Uploaded file: ${originalName} (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`);

    return res.status(201).json({
      message: 'File uploaded successfully.',
      file: fileRecord,
    });
  } catch (err) {
    console.error('File upload error:', err);
    return res.status(500).json({ error: 'Failed to upload file to storage.' });
  }
};

/**
 * List files accessible by the user (department files + owned files)
 */
const getFiles = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const userDeptId = req.user.departmentId;

  try {
    let query = '';
    let values = [];

    if (userRole === 'Admin') {
      // Admins see all files from all departments
      query = `
        SELECT f.*, u.name as owner_name, d.name as department_name
        FROM files f
        JOIN users u ON f.owner_id = u.id
        JOIN departments d ON f.department_id = d.id
        ORDER BY f.created_at DESC
      `;
    } else {
      // Employees see files of their own department
      query = `
        SELECT f.*, u.name as owner_name, d.name as department_name
        FROM files f
        JOIN users u ON f.owner_id = u.id
        JOIN departments d ON f.department_id = d.id
        WHERE f.department_id = $1 OR f.owner_id = $2
        ORDER BY f.created_at DESC
      `;
      values = [userDeptId, userId];
    }

    const result = await db.query(query, values);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching files list:', err);
    return res.status(500).json({ error: 'Failed to retrieve files list.' });
  }
};

/**
 * Get single file metadata
 */
const getFileById = async (req, res) => {
  // req.fileRecord is populated by checkFilePermission middleware
  return res.status(200).json(req.fileRecord);
};

/**
 * Generate download link for a file
 */
const downloadFile = async (req, res) => {
  const file = req.fileRecord; // Populated by checkFilePermission middleware
  const userId = req.user.id;

  // Read configurable expiry (in seconds). Default: 300s (5 mins). Allowed range: 300s - 900s
  let expiresIn = 300;
  if (req.query.expiresIn) {
    const parsedExpiry = parseInt(req.query.expiresIn, 10);
    if (parsedExpiry >= 300 && parsedExpiry <= 900) {
      expiresIn = parsedExpiry;
    }
  }

  try {
    // Generate pre-signed URL
    const downloadUrl = await s3Service.generatePresignedUrl(file.s3_key, file.filename, expiresIn);

    // Log the download action
    await logAction(userId, 'Download', file.id, `Generated S3 pre-signed URL (expires in ${expiresIn / 60} mins) for file: ${file.filename}`);

    return res.status(200).json({
      downloadUrl,
      expiresIn,
    });
  } catch (err) {
    console.error('Error generating pre-signed URL:', err);
    return res.status(500).json({ error: 'Failed to generate download link.' });
  }
};

/**
 * Delete a file from S3 and database
 */
const deleteFile = async (req, res) => {
  const file = req.fileRecord; // Populated by checkFilePermission middleware
  const userId = req.user.id;

  try {
    // 1. Delete from AWS S3
    await s3Service.deleteFileFromS3(file.s3_key);

    // 2. Delete from PostgreSQL Database (cascade will delete related file_permissions)
    const deleteQuery = 'DELETE FROM files WHERE id = $1';
    await db.query(deleteQuery, [file.id]);

    // 3. Log the deletion action
    await logAction(userId, 'Delete', null, `Deleted file: ${file.filename} (previously ID: ${file.id})`);

    return res.status(200).json({
      message: 'File successfully deleted.',
    });
  } catch (err) {
    console.error('Error deleting file:', err);
    return res.status(500).json({ error: 'Failed to delete file.' });
  }
};

module.exports = {
  uploadFile,
  getFiles,
  getFileById,
  downloadFile,
  deleteFile,
};
