const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.IAM_ACCESS_KEY,
  secretAccessKey: process.env.IAM_SECRET_KEY
});

exports.uploadToS3 = async (data, filename) => {
  const params = {
    Bucket: 'expensetracker-567166881414',
    Key: filename,
    Body: data,
    ACL: 'public-read'
  };

  return s3.upload(params).promise(); // Returns a promise with Location (URL)
};
