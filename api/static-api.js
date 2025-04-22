// Static API fallback that works with minimal dependencies
// This is used in case the TypeScript server doesn't compile

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'dist');
const HAS_STATIC_FILES = fs.existsSync(PUBLIC_DIR);

// Data for static API responses
const apiResponses = {
  '/api/settings/logo': {
    imageUrl: 'https://28ab6440-e7e2-406a-9e35-29d8f501e03a.replit.dev/assets/blue_whale.svg'
  },
  '/api/settings/banner': {
    imageUrl: 'https://28ab6440-e7e2-406a-9e35-29d8f501e03a.replit.dev/assets/banner.jpg'
  },
  '/api/user': { 
    message: 'Not authenticated',
    statusCode: 401
  },
  '/api/user/stats': {
    activeEntries: 1,
    totalEntries: 1,
    totalWins: 0,
    favoriteCategory: 'Appliances'
  },
  '/api/competitions': [{
    id: 1,
    title: 'Ninja Air Fryer',
    organizerName: 'CompetitionTime',
    description: 'Win this amazing Air Fryer for your kitchen!',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec',
    ticketPrice: 4.99,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Appliances',
    totalTickets: 1000,
    soldTickets: 389
  }],
  '/api/leaderboard': [
    { id: 1, username: 'SDK', initials: 'S', score: 3500, mascotId: 1 },
    { id: 2, username: 'JaneDoe', initials: 'JD', score: 2200, mascotId: 3 },
    { id: 3, username: 'BlueFin', initials: 'BF', score: 1800, mascotId: 2 }
  ],
  '/api/status': {
    status: 'OK',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  }
};

// Import the index.js landing page for serving
let landingPage;
try {
  const indexModule = require('./index.js');
  if (typeof indexModule === 'function') {
    // It's a handler function
    landingPage = indexModule;
  } else if (indexModule.landingPage) {
    // It has a landingPage export
    landingPage = indexModule.landingPage;
  }
} catch (error) {
  console.error('Failed to load landing page from index.js:', error);
  // Fallback mini landing page
  landingPage = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blue Whale Competitions</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #090D1F; color: white; text-align: center; padding: 2rem; }
    h1 { font-size: 2rem; margin: 1rem 0; }
  </style>
</head>
<body>
  <h1>Blue Whale Competitions</h1>
  <p>The API is running but the app is not available in static mode.</p>
</body>
</html>`;
}

// MIME types for file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Create server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse URL to get pathname
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  // Handle API routes
  if (pathname.startsWith('/api/')) {
    // Check if we have a predefined response for this API endpoint
    if (apiResponses[pathname]) {
      const data = apiResponses[pathname];
      const statusCode = data.statusCode || 200;
      
      // Remove statusCode from the response data if it exists
      if (data.statusCode) {
        const { statusCode, ...responseData } = data;
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responseData));
      } else {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      }
      return;
    }
    
    // API endpoint not found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
    return;
  }
  
  // Serve static files if the dist directory exists
  if (HAS_STATIC_FILES) {
    let filePath;
    
    if (pathname === '/') {
      // Serve index.html for root path
      filePath = path.join(PUBLIC_DIR, 'index.html');
    } else {
      // Serve requested file
      filePath = path.join(PUBLIC_DIR, pathname);
    }
    
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // File not found, serve index.html (for SPA routing)
        filePath = path.join(PUBLIC_DIR, 'index.html');
        fs.readFile(filePath, (err, data) => {
          if (err) {
            // If even index.html is not found, serve a 404
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - File Not Found</h1>');
            return;
          }
          
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        });
        return;
      }
      
      // Get file extension for MIME type
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      // Read and serve the file
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end('<h1>500 - Internal Server Error</h1>');
          return;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });
  } else {
    // No static files available, serve the landing page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    
    if (typeof landingPage === 'function') {
      // Use the handler function from index.js
      landingPage(req, res);
    } else {
      // Use the static landingPage HTML
      res.end(landingPage);
    }
  }
});

// Start the server if this is run directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Static API server running on port ${PORT}`);
  });
}

// Export the server for Vercel
module.exports = server;