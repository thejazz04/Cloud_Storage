const db = require('../config/db');

/**
 * Retrieve audit logs (Admin only)
 */
const getAuditLogs = async (req, res) => {
  const { userId, action } = req.query;

  try {
    let query = `
      SELECT al.*, u.name as user_name, u.email as user_email, f.filename 
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN files f ON al.file_id = f.id
    `;
    const values = [];
    const conditions = [];

    // Filter by User ID if provided
    if (userId && userId.trim() !== '') {
      values.push(userId.trim());
      conditions.push(`al.user_id = $${values.length}`);
    }

    // Filter by Action if provided
    if (action && action.trim() !== '') {
      values.push(action.trim());
      conditions.push(`al.action = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Order chronologically, most recent first
    query += ' ORDER BY al.timestamp DESC LIMIT 150';

    const result = await db.query(query, values);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error retrieving audit logs:', err);
    return res.status(500).json({ error: 'Failed to retrieve audit logs.' });
  }
};

module.exports = {
  getAuditLogs,
};
