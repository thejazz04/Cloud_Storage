const db = require('../config/db');

/**
 * Middleware to check user permission on a specific file
 * Assumes req.params.id (or req.params.fileId) contains the file's UUID
 * @param {'view'|'download'|'edit'|'delete'} requiredAction
 */
const checkFilePermission = (requiredAction) => {
  return async (req, res, next) => {
    const fileId = req.params.id || req.params.fileId;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userDeptId = req.user?.departmentId;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID is missing from path parameters.' });
    }

    try {
      // 1. Fetch file details
      const fileQuery = 'SELECT * FROM files WHERE id = $1';
      const fileRes = await db.query(fileQuery, [fileId]);
      
      if (fileRes.rows.length === 0) {
        return res.status(404).json({ error: 'File not found.' });
      }
      
      const file = fileRes.rows[0];
      req.fileRecord = file; // Attach file metadata to request context for subsequent route handlers

      // 2. Admin Bypass
      if (userRole === 'Admin') {
        return next();
      }

      // 3. Resource Ownership Bypass
      const isOwner = file.owner_id === userId;
      if (isOwner) {
        return next();
      }

      // 4. If action is DELETE, only owner or admin can perform it
      if (requiredAction === 'delete') {
        return res.status(403).json({ error: 'Access denied: Only the owner or an administrator can delete files.' });
      }

      // 5. Fetch explicit sharing permissions for this user
      const shareQuery = `
        SELECT permission_type 
        FROM file_permissions 
        WHERE file_id = $1 AND shared_with = $2
      `;
      const shareRes = await db.query(shareQuery, [fileId, userId]);
      const explicitPermission = shareRes.rows.length > 0 ? shareRes.rows[0].permission_type : null;

      // 6. Check Department matching
      const isInSameDepartment = file.department_id === userDeptId;

      // 7. Enforce permissions rules
      if (requiredAction === 'edit') {
        // Edit requires Owner, Admin, or shared with 'Edit' permission
        if (explicitPermission === 'Edit') {
          return next();
        }
        return res.status(403).json({ error: 'Access denied: You do not have write/edit privileges for this file.' });
      }

      if (requiredAction === 'download') {
        // Download requires same department, or shared with 'Download'/'Edit'
        if (isInSameDepartment || explicitPermission === 'Download' || explicitPermission === 'Edit') {
          return next();
        }
        return res.status(403).json({ error: 'Access denied: You do not have download privileges for this file.' });
      }

      if (requiredAction === 'view') {
        // View requires same department, or shared with 'View'/'Download'/'Edit'
        if (isInSameDepartment || explicitPermission === 'View' || explicitPermission === 'Download' || explicitPermission === 'Edit') {
          return next();
        }
        return res.status(403).json({ error: 'Access denied: You do not have access to view this file.' });
      }

      return res.status(400).json({ error: 'Invalid file permission request.' });
    } catch (err) {
      console.error('Error validating file permissions:', err);
      return res.status(500).json({ error: 'Internal server error during permissions verification.' });
    }
  };
};

module.exports = {
  checkFilePermission,
};
