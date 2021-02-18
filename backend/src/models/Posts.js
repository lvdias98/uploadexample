const mongoose = require('mongoose');
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const s3 = new aws.S3();

const PostSchema = new mongoose.Schema({
  name: String,
  size: Number,
  key: String,
  urlOriginal: String,
  urlResized: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

PostSchema.pre('save', function () {
  if (!this.url) {
    const [name,extension] = this.key.split('.');
    this.urlOriginal = `${process.env.APP_URL}/files/${name}.${extension}`;
    this.urlResized = (`${process.env.APP_URL}/files/${name}.${extension}`).replace('-original.','-resized.');
  }
});

PostSchema.pre('remove', function () {
  if (process.env.STORAGE_TYPE === 's3') {
    return s3.deleteObject({
      Bucket: process.env.BUCKET_NAME,
      Key: this.key
    }).promise();
  } else {
    return promisify(fs.unlink)(path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key))
  }
});

module.exports = mongoose.model('Post', PostSchema);