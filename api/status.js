// Simple status API for Vercel serverless function
// This can be accessed at /api/status

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  res.status(200).json({
    status: 'OK',
    message: 'Blue Whale Competitions API is running',
    version: '1.0.0',
    environment: process.env.VERCEL_ENV || 'development',
    timestamp: new Date().toISOString()
  });
};