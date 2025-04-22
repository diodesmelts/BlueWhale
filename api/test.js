// Simple test endpoint
module.exports = (req, res) => {
  res.json({
    status: 'ok',
    message: 'Vercel API is working correctly',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development'
  });
};