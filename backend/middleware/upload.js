const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Load our secret keys

// 1. Log into Cloudinary using the keys from your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Set up the Cloudinary Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'real_estate_properties', // Cloudinary will create this folder for you!
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] // Only allow images
  }
});

// 3. Create the Multer upload tool
const upload = multer({ storage: storage });

module.exports = upload;