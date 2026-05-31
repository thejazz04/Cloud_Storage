const db = require('../config/db');
const { logAction } = require('../services/auditService');

/**
 * Share a file with another user (by email)
 */
const shareFile = async (req, res) => {
  const { fileId, sharedWithEmail, permissionType } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (!fileId || !sharedWithEmail || !permissionType) {
    return res.status(400).json({ error: 'Please provide fileId, sharedWithEmail, and permissionType.' });
  }

  const normalizedEmail = sharedWithEmail.toLowerCase().trim();

  if (!['View', 'Download', 'Edit'].includes(permissionType)) {
    return res.status(400).json({ error: 'Invalid permission type. Must be View, Download, or Edit.' });
  }

  try {
    // 1. Fetch file record to verify existence and check owner
    const fileRes = await db.query('SELECT * FROM files WHERE id = $1', [fileId]);
    if (fileRes.rows.length === 0) {
      return res.status(404).json({ error: 'File not found.' });
    }
    const file = fileRes.rows[0];

    // 2. Validate ownership. "Only owner can manage sharing permissions" (Admins can also manage everything)
    if (file.owner_id !== userId && userRole !== 'Admin') {
      return res.status(403).json({ error: 'Access denied: Only the owner can manage sharing permissions for this file.' });
    }

    // 3. Find the recipient user by email
    const recipientRes = await db.query('SELECT id, name, department_id FROM users WHERE email = $1', [normalizedEmail]);
    if (recipientRes.rows.length === 0) {
      return res.status(404).json({ error: 'User to share with not found.' });
    }
    const recipient = recipientRes.rows[0];

    // 4. Prevent sharing with self
    if (recipient.id === file.owner_id) {
      return res.status(400).json({ error: 'You cannot share a file with its owner.' });
    }

    // 5. Upsert permission record
    const checkPermRes = await db.query(
      'SELECT id FROM file_permissions WHERE file_id = $1 AND shared_with = $2',
      [fileId, recipient.id]
    );

    let permissionRecord;
    if (checkPermRes.rows.length > 0) {
      // Update existing permission
      const updateQuery = `
        UPDATE file_permissions 
        SET permission_type = $1 
        WHERE file_id = $2 AND shared_with = $3 
        RETURNING *
      `;
      const updateRes = await db.query(updateQuery, [permissionType, fileId, recipient.id]);
      permissionRecord = updateRes.rows[0];
    } else {
      // Insert new permission
      const insertQuery = `
        INSERT INTO file_permissions (file_id, shared_with, permission_type) 
        VALUES ($1, $2, $3) 
        RETURNING *
      `;
      const insertRes = await db.query(insertQuery, [fileId, recipient.id, permissionType]);
      permissionRecord = insertRes.rows[0];
    }

    // 6. Log the action
    await logAction(
      userId, 
      'Share', 
      fileId, 
      `Shared file "${file.filename}" with user ${normalizedEmail} (${permissionType} permission)`
    );

    return res.status(200).json({
      message: `File shared successfully with ${recipient.name}.`,
      permission: permissionRecord
    });
  } catch (err) {
    console.error('Error sharing file:', err);
    return res.status(500).json({ error: 'An error occurred while sharing the file.' });
  }
};

/**
 * Fetch files shared with the current user
 */
const getSharedFiles = async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `
      SELECT f.*, fp.permission_type, u.name as owner_name, d.name as department_name
      FROM file_permissions fp
      JOIN files f ON fp.file_id = f.id
      JOIN users u ON f.owner_id = u.id
      JOIN departments d ON f.department_id = d.id
      WHERE fp.shared_with = $1
      ORDER BY fp.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching shared files:', err);
    return res.status(500).json({ error: 'Failed to retrieve shared files.' });
  }
};

module.exports = {
  shareFile,
  getSharedFiles,
};
