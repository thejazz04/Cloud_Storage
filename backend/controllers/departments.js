const db = require('../config/db');

/**
 * Get all departments
 */
const getDepartments = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM departments ORDER BY name ASC');
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching departments:', err);
    return res.status(500).json({ error: 'Failed to retrieve departments.' });
  }
};

/**
 * Create a new department
 */
const createDepartment = async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Department name is required.' });
  }

  const cleanName = name.trim();

  try {
    // Check duplicate
    const checkQuery = 'SELECT id FROM departments WHERE LOWER(name) = LOWER($1)';
    const checkRes = await db.query(checkQuery, [cleanName]);
    if (checkRes.rows.length > 0) {
      return res.status(409).json({ error: 'A department with this name already exists.' });
    }

    const insertQuery = 'INSERT INTO departments (name) VALUES ($1) RETURNING *';
    const result = await db.query(insertQuery, [cleanName]);
    
    return res.status(201).json({
      message: 'Department created successfully.',
      department: result.rows[0],
    });
  } catch (err) {
    console.error('Error creating department:', err);
    return res.status(500).json({ error: 'Failed to create department.' });
  }
};

module.exports = {
  getDepartments,
  createDepartment,
};
