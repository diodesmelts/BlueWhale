// Standalone Vercel serverless handler
const serverBackup = require('./server-backup.js');

// Required for Vercel Serverless API Functions
module.exports = (req, res) => {
  // Set standard headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '/';
  
  // API Endpoints
  if (url.startsWith('/api/')) {
    return handleApiRequest(req, res);
  }

  // Serve the landing page for all other routes
  res.setHeader('Content-Type', 'text/html');
  return res.end(serverBackup);
};

// JSON helper for the response object
function addJsonMethod(res) {
  if (!res.json) {
    res.json = function(obj) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(obj));
      return res;
    };
  }
  return res;
}

// Add status method if it doesn't exist
function addStatusMethod(res) {
  if (!res.status) {
    res.status = function(code) {
      res.statusCode = code;
      return res;
    };
  }
  return res;
}

// API Request Handler
function handleApiRequest(req, res) {
  // Add convenience methods if they don't exist (in some serverless environments)
  res = addJsonMethod(res);
  res = addStatusMethod(res);
  
  const url = req.url || '/';
  
  console.log(`API Request: ${url}`);
  
  // Logo endpoint
  if (url === '/api/settings/logo') {
    return res.json({ 
      imageUrl: 'https://28ab6440-e7e2-406a-9e35-29d8f501e03a.replit.dev/assets/blue_whale.svg' 
    });
  }
  
  // Banner endpoint
  if (url === '/api/settings/banner') {
    return res.json({ 
      imageUrl: 'https://28ab6440-e7e2-406a-9e35-29d8f501e03a.replit.dev/assets/banner.jpg' 
    });
  }
  
  // User auth endpoint (default: not authenticated)
  if (url === '/api/user') {
    return res.status(401).json({ 
      message: 'Not authenticated' 
    });
  }
  
  // User stats endpoint
  if (url === '/api/user/stats') {
    return res.json({
      activeEntries: 1,
      totalEntries: 1,
      totalWins: 0,
      favoriteCategory: 'Appliances'
    });
  }
  
  // Competitions listing endpoint
  if (url === '/api/competitions') {
    return res.json([
      {
        id: 1,
        title: 'Ninja Air Fryer',
        organizerName: 'CompetitionTime',
        description: 'Win this amazing Air Fryer for your kitchen! Perfect for cooking healthier meals with less oil.',
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?ixlib=rb-4.0.3',
        ticketPrice: 4.99,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Appliances',
        totalTickets: 1000,
        soldTickets: 389
      }
    ]);
  }
  
  // Leaderboard endpoint
  if (url === '/api/leaderboard') {
    return res.json([
      { id: 1, username: 'SDK', initials: 'S', score: 3500, mascotId: 1 },
      { id: 2, username: 'JaneDoe', initials: 'JD', score: 2200, mascotId: 3 },
      { id: 3, username: 'BlueFin', initials: 'BF', score: 1800, mascotId: 2 }
    ]);
  }
  
  // Status endpoint
  if (url === '/api/status') {
    return res.json({
      status: 'OK',
      environment: 'production',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }
  
  // Default response for unknown endpoints
  return res.status(404).json({ 
    error: 'Endpoint not found',
    path: url
  });
}