// Simple API handler for Vercel
const fs = require('fs');
const path = require('path');

// Simple static content serving for Vercel
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const url = req.url || '/';
  
  // API endpoints
  if (url.startsWith('/api/')) {
    return handleApiRequest(req, res);
  }

  // Send the index.html for all other routes (client-side routing)
  try {
    const indexPath = path.join(__dirname, '../dist/index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      return res.end(content);
    }
    
    // Fallback if no index.html exists
    return res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Blue Whale Competitions</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              background-color: #0a192f;
              color: white;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              flex-direction: column;
            }
            .container {
              text-align: center;
              max-width: 600px;
              padding: 20px;
            }
            .logo {
              font-size: 2rem;
              font-weight: bold;
              color: #64ffda;
              margin-bottom: 20px;
            }
            p {
              line-height: 1.6;
              opacity: 0.9;
            }
            .coming-soon {
              font-size: 1.5rem;
              margin-top: 20px;
              color: #64ffda;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Blue Whale Competitions</div>
            <p>We're currently deploying our exciting competition platform. Check back soon to discover and enter amazing competitions!</p>
            <div class="coming-soon">Coming Soon</div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    res.statusCode = 500;
    res.end('Server Error');
  }
};

// Handle API requests
function handleApiRequest(req, res) {
  const url = req.url || '/';
  
  // Settings endpoints
  if (url === '/api/settings/logo') {
    return res.json({ imageUrl: 'https://28ab6440-e7e2-406a-9e35-29d8f501e03a.replit.dev/assets/blue_whale.svg' });
  }
  
  if (url === '/api/settings/banner') {
    return res.json({ imageUrl: 'https://28ab6440-e7e2-406a-9e35-29d8f501e03a.replit.dev/assets/banner.jpg' });
  }
  
  // User endpoints
  if (url === '/api/user') {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  if (url === '/api/user/stats') {
    return res.json({
      activeEntries: 1,
      totalEntries: 1,
      totalWins: 0,
      favoriteCategory: 'Appliances'
    });
  }
  
  // Competitions endpoint
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
  
  // Default for unknown API endpoints
  return res.status(404).json({ error: 'Not found' });
}