const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

const region = process.env.AWS_REGION || 'us-east-1';

// Ensure credentials exist or warn
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.warn('WARNING: AWS S3 credentials are missing from environment variables.');
}

const s3Client = new S3Client({
  region: region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'placeholder',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'placeholder',
  },
});

module.exports = s3Client;
