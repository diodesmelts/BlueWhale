// Extremely simple standalone Vercel handler
// No dependencies, no imports - just pure vanilla JavaScript

// HTML for our landing page
const landingPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blue Whale Competitions</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background-color: #0a192f;
      color: white;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      margin: 0;
      padding: 0;
    }
    header {
      padding: 2rem 1rem;
      display: flex;
      justify-content: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .logo {
      font-size: 1.75rem;
      font-weight: 700;
      color: #64ffda;
    }
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
      text-align: center;
    }
    .container {
      max-width: 800px;
      width: 100%;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      background: linear-gradient(to right, #4a00e0, #8e2de2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .competitions-preview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 3rem;
    }
    .competition-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .competition-card:hover {
      transform: translateY(-5px);
    }
    .card-image {
      height: 180px;
      width: 100%;
      background: linear-gradient(to right, #4a00e0, #8e2de2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
    .card-content {
      padding: 1.5rem;
    }
    .card-category {
      display: inline-block;
      font-size: 0.75rem;
      background-color: rgba(100, 255, 218, 0.2);
      color: #64ffda;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    .card-title {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
    }
    .card-price {
      font-weight: 700;
      color: #64ffda;
    }
    footer {
      padding: 2rem 1rem;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      color: #8892b0;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">Blue Whale Competitions</div>
  </header>
  
  <main>
    <div class="container">
      <h1>Your Source for Amazing Competitions</h1>
      <p>Discover and participate in exciting competitions. Win incredible prizes including electronics, cash rewards, family experiences, and much more!</p>
      
      <div class="competitions-preview">
        <div class="competition-card">
          <div class="card-image">Air Fryer</div>
          <div class="card-content">
            <span class="card-category">Appliances</span>
            <h3 class="card-title">Win a Ninja Air Fryer</h3>
            <span class="card-price">£4.99 per ticket</span>
          </div>
        </div>
        
        <div class="competition-card">
          <div class="card-image">Cash Prize</div>
          <div class="card-content">
            <span class="card-category">Cash</span>
            <h3 class="card-title">£500 Cash Giveaway</h3>
            <span class="card-price">£3.49 per ticket</span>
          </div>
        </div>
        
        <div class="competition-card">
          <div class="card-image">Family Holiday</div>
          <div class="card-content">
            <span class="card-category">Family</span>
            <h3 class="card-title">Family Trip to Disneyland</h3>
            <span class="card-price">£9.99 per ticket</span>
          </div>
        </div>
      </div>
    </div>
  </main>
  
  <footer>
    &copy; 2025 Blue Whale Competitions. All rights reserved.
  </footer>
</body>
</html>`;

// Simple function to handle any serverless environment
module.exports = function(req, res) {
  // Get the request URL
  const url = req.url || '/';
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }
  
  // Helper for sending JSON responses
  function sendJSON(data, statusCode = 200) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  }
  
  // API Routes
  if (url.startsWith('/api/')) {
    // Logo endpoint
    if (url === '/api/settings/logo') {
      return sendJSON({
        imageUrl: 'https://28ab6440-e7e2-406a-9e35-29d8f501e03a.replit.dev/assets/blue_whale.svg'
      });
    }
    
    // Banner endpoint
    if (url === '/api/settings/banner') {
      return sendJSON({
        imageUrl: 'https://28ab6440-e7e2-406a-9e35-29d8f501e03a.replit.dev/assets/banner.jpg'
      });
    }
    
    // User auth endpoint (not authenticated)
    if (url === '/api/user') {
      return sendJSON({ message: 'Not authenticated' }, 401);
    }
    
    // User stats
    if (url === '/api/user/stats') {
      return sendJSON({
        activeEntries: 1,
        totalEntries: 1,
        totalWins: 0,
        favoriteCategory: 'Appliances'
      });
    }
    
    // Competitions
    if (url === '/api/competitions') {
      return sendJSON([{
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
      }]);
    }
    
    // Leaderboard
    if (url === '/api/leaderboard') {
      return sendJSON([
        { id: 1, username: 'SDK', initials: 'S', score: 3500, mascotId: 1 },
        { id: 2, username: 'JaneDoe', initials: 'JD', score: 2200, mascotId: 3 },
        { id: 3, username: 'BlueFin', initials: 'BF', score: 1800, mascotId: 2 }
      ]);
    }
    
    // Status endpoint
    if (url === '/api/status') {
      return sendJSON({
        status: 'OK',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    }
    
    // Not found API endpoint
    return sendJSON({ error: 'Endpoint not found' }, 404);
  }
  
  // For all other routes, serve the landing page
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  return res.end(landingPage);
};