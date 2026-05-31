const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // For development, allow all. In production, restrict to frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP logger
app.use(morgan('dev'));

// Health check / index route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Cloud Storage API is fully operational' });
});

// Import and register route modules
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/api', require('./routes/share')); // mounts /share and /shared
app.use('/api/audit', require('./routes/audit'));
app.use('/api/users', require('./routes/users'));
app.use('/api/departments', require('./routes/departments'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  
  // Custom S3 bucket access error or PG syntax error feedback
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Database constraint violation: Duplicate key exists.' });
  }

  res.status(500).json({
    error: 'An unexpected server error occurred.',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
