// API route for status check
module.exports = (req, res) => {
  res.json({
    status: 'OK',
    version: '1.0.0',
    environment: process.env.VERCEL_ENV || 'development',
    timestamp: new Date().toISOString()
  });
};