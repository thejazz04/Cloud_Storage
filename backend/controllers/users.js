const db = require('../config/db');

/**
 * Fetch list of all registered users
 */
const getUsers = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.name, u.email, u.role, u.department_id, d.name as department_name, u.created_at
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      ORDER BY u.name ASC
    `;
    const result = await db.query(query);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ error: 'Failed to retrieve users.' });
  }
};

/**
 * Update user role or department (Admin only)
 */
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { role, departmentId } = req.body;

  if (!role && !departmentId) {
    return res.status(400).json({ error: 'Provide role or departmentId to update.' });
  }

  try {
    let updateFields = [];
    let values = [];
    let counter = 1;

    if (role) {
      if (!['Admin', 'Employee'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role value.' });
      }
      updateFields.push(`role = $${counter++}`);
      values.push(role);
    }

    if (departmentId !== undefined) {
      const deptId = departmentId ? parseInt(departmentId, 10) : null;
      updateFields.push(`department_id = $${counter++}`);
      values.push(deptId);
    }

    values.push(id);
    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = $${counter} 
      RETURNING id, name, email, role, department_id
    `;

    const result = await db.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({
      message: 'User settings updated successfully.',
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ error: 'Failed to update user parameters.' });
  }
};

/**
 * Delete a user from the system (Admin only)
 */
const deleteUser = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  if (id === adminId) {
    return res.status(400).json({ error: 'Self-deletion is prohibited.' });
  }

  try {
    const checkQuery = 'SELECT id, name FROM users WHERE id = $1';
    const checkRes = await db.query(checkQuery, [id]);
    
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userName = checkRes.rows[0].name;

    // Delete user (cascade foreign keys will clean up files, permissions, etc.)
    await db.query('DELETE FROM users WHERE id = $1', [id]);

    return res.status(200).json({
      message: `User "${userName}" deleted successfully from system.`,
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
};

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
};
