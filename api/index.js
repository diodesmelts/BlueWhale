// Simplified API endpoint for Vercel serverless function
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Main API response
  res.setHeader('Content-Type', 'application/json');
  
  return res.status(200).json({
    status: 'OK',
    message: 'Blue Whale Competitions API is running',
    version: '1.0.0',
    environment: process.env.VERCEL_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/status',
      '/api/competitions',
      '/api/leaderboard',
      '/api/user/stats',
      '/api/settings/logo',
      '/api/settings/banner'
    ]
  });
};