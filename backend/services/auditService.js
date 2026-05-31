const db = require('../config/db');

/**
 * Creates an entry in the audit_logs table
 * @param {string|null} userId 
 * @param {string} action 
 * @param {string|null} fileId 
 * @param {string|null} details 
 * @returns {Promise<object|null>}
 */
const logAction = async (userId, action, fileId = null, details = null) => {
  try {
    const query = `
      INSERT INTO audit_logs (user_id, action, file_id, details)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [userId, action, fileId, details];
    const res = await db.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error('Failed to persist audit log to DB:', err);
    // Don't throw errors so audits don't crash main transaction
    return null;
  }
};

module.exports = {
  logAction,
};
