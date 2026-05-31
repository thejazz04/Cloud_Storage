const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { logAction } = require('../services/auditService');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

/**
 * Register a new user
 */
const register = async (req, res) => {
  const { name, email, password, role, departmentId } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // 1. Check if user already exists
    const checkQuery = 'SELECT id FROM users WHERE email = $1';
    const checkRes = await db.query(checkQuery, [normalizedEmail]);
    if (checkRes.rows.length > 0) {
      return res.status(409).json({ error: 'A user with this email address already exists.' });
    }

    // 2. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Insert user
    const insertQuery = `
      INSERT INTO users (name, email, password, role, department_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role, department_id, created_at
    `;
    const deptId = departmentId ? parseInt(departmentId, 10) : null;
    const values = [name, normalizedEmail, hashedPassword, role, deptId];
    
    const insertRes = await db.query(insertQuery, values);
    const newUser = insertRes.rows[0];

    // 4. Generate JWT
    const token = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        departmentId: newUser.department_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log the registration event in the audits
    await logAction(newUser.id, 'Register', null, `User registered: ${newUser.name} (${newUser.role})`);

    return res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        departmentId: newUser.department_id
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to register user.' });
  }
};

/**
 * Authenticate existing user
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both email and password.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // 1. Fetch user by email
    const query = `
      SELECT u.*, d.name as department_name 
      FROM users u 
      LEFT JOIN departments d ON u.department_id = d.id 
      WHERE u.email = $1
    `;
    const result = await db.query(query, [normalizedEmail]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // 2. Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.department_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Log the action
    await logAction(user.id, 'Login', null, `User logged in from client.`);

    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.department_id,
        departmentName: user.department_name
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'An error occurred during login.' });
  }
};

module.exports = {
  register,
  login,
};
