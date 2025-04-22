// API endpoint for user data
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  // Return 401 for unauthenticated users
  res.status(401).json({ 
    message: 'Not authenticated' 
  });
};