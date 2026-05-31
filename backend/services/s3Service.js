const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/s3');
require('dotenv').config();

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

/**
 * Uploads a file buffer to the private S3 bucket
 * @param {Buffer} fileBuffer 
 * @param {string} s3Key 
 * @param {string} mimeType 
 * @returns {Promise<any>}
 */
const uploadFileToS3 = async (fileBuffer, s3Key, mimeType) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: mimeType,
  });
  return s3Client.send(command);
};

/**
 * Deletes an object from the S3 bucket
 * @param {string} s3Key 
 * @returns {Promise<any>}
 */
const deleteFileFromS3 = async (s3Key) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });
  return s3Client.send(command);
};

/**
 * Generates a short-lived download URL for an object
 * @param {string} s3Key 
 * @param {string} originalFilename 
 * @param {number} expiresInSeconds 
 * @returns {Promise<string>}
 */
const generatePresignedUrl = async (s3Key, originalFilename, expiresInSeconds = 300) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(originalFilename)}"`,
  });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
};

module.exports = {
  uploadFileToS3,
  deleteFileFromS3,
  generatePresignedUrl,
};
