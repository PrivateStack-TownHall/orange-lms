const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const assertConfigured = () => {
  const missing = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ].filter((key) => !process.env[key]);

  if (!missing.length) return;

  const error = new Error(`Cloudinary configuration is incomplete: ${missing.join(", ")}`);
  error.status = 503;
  throw error;
};

module.exports = cloudinary;
module.exports.assertConfigured = assertConfigured;
