// Main API route handler for Vercel
const serverBackup = require('./server-backup.js');

// Export the Express API for serverless function
module.exports = serverBackup;