// Extremely simple standalone Vercel handler
// No dependencies, no imports - just pure vanilla JavaScript

// HTML for our landing page
const landingPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blue Whale Competitions</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary-blue: #0261FE;
      --dark-blue: #090D1F;
      --darker-blue: #01081B;
      --text-white: #FFFFFF;
      --light-gray: #F3F4F6;
      --card-pink: #FFF1F6;
      --card-green: #ECFDF7;
      --card-yellow: #FFF8E6;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background-color: var(--darker-blue);
      color: var(--text-white);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    header {
      background-color: var(--dark-blue);
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .logo {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-white);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .logo-icon {
      width: 40px;
      height: 40px;
      background-color: var(--primary-blue);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
    
    .header-links {
      display: flex;
      gap: 2rem;
    }
    
    .header-link {
      color: var(--text-white);
      text-decoration: none;
      font-weight: 500;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }
    
    .header-link:hover {
      opacity: 1;
    }
    
    .active-link {
      opacity: 1;
      position: relative;
    }
    
    .active-link::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--primary-blue);
    }
    
    main {
      flex: 1;
      padding: 3rem 2rem;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
    }
    
    .hero {
      margin-bottom: 4rem;
      text-align: center;
    }
    
    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #00C2FF, #0261FE);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
    }
    
    .hero p {
      font-size: 1.2rem;
      max-width: 700px;
      margin: 0 auto;
      opacity: 0.9;
    }
    
    .competitions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }
    
    .competition-card {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.05);
      position: relative;
    }
    
    .competition-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(2, 97, 254, 0.15);
      border-color: rgba(2, 97, 254, 0.2);
    }
    
    .card-image {
      height: 200px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 1.5rem;
      background-size: cover;
      background-position: center;
      position: relative;
    }
    
    .appliances .card-image {
      background: linear-gradient(135deg, #FF4B8B, #FF8E53);
    }
    
    .cash .card-image {
      background: linear-gradient(135deg, #10B981, #3B82F6);
    }
    
    .family .card-image {
      background: linear-gradient(135deg, #FBBF24, #F59E0B);
    }
    
    .card-content {
      padding: 1.5rem;
    }
    
    .card-category {
      display: inline-block;
      font-size: 0.75rem;
      padding: 0.35rem 0.75rem;
      border-radius: 50px;
      margin-bottom: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    
    .appliances .card-category {
      background-color: var(--card-pink);
      color: #FF4B8B;
    }
    
    .cash .card-category {
      background-color: var(--card-green);
      color: #10B981;
    }
    
    .family .card-category {
      background-color: var(--card-yellow);
      color: #F59E0B;
    }
    
    .card-title {
      font-size: 1.35rem;
      margin-bottom: 0.75rem;
      color: white;
    }
    
    .card-price {
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--primary-blue);
      display: block;
      margin-top: 1rem;
    }
    
    .progress-container {
      margin-top: 1rem;
      height: 6px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
    }
    
    .progress-bar {
      height: 100%;
      background-color: var(--primary-blue);
      border-radius: 3px;
    }
    
    .progress-text {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      margin-top: 0.5rem;
      opacity: 0.7;
    }
    
    footer {
      background-color: var(--dark-blue);
      padding: 2rem;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.6);
    }
    
    .btn-primary {
      display: inline-block;
      background-color: var(--primary-blue);
      color: white;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      text-decoration: none;
      margin-top: 3rem;
      transition: all 0.2s ease;
      border: none;
      cursor: pointer;
    }
    
    .btn-primary:hover {
      background-color: #0052E0;
      transform: translateY(-2px);
      box-shadow: 0 8px 15px rgba(2, 97, 254, 0.2);
    }
    
    .btn-wrapper {
      text-align: center;
      margin-top: 2rem;
    }
    
    @media (max-width: 768px) {
      .header-links {
        display: none;
      }
      
      h1 {
        font-size: 2.2rem;
      }
      
      .hero p {
        font-size: 1rem;
      }
      
      .competitions-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">
      <div class="logo-icon">BW</div>
      Blue Whale Competitions
    </div>
    <div class="header-links">
      <a href="#" class="header-link active-link">Home</a>
      <a href="#" class="header-link">Competitions</a>
      <a href="#" class="header-link">Winners</a>
      <a href="#" class="header-link">How It Works</a>
    </div>
  </header>
  
  <main>
    <section class="hero">
      <h1>Your Source for Amazing Competitions</h1>
      <p>Discover and participate in exciting competitions. Win incredible prizes including electronics, cash rewards, family experiences, and much more!</p>
    </section>
    
    <div class="competitions-grid">
      <div class="competition-card appliances">
        <div class="card-image">Air Fryer</div>
        <div class="card-content">
          <span class="card-category">Appliances</span>
          <h3 class="card-title">Win a Ninja Air Fryer</h3>
          <span class="card-price">£4.99 per ticket</span>
          <div class="progress-container">
            <div class="progress-bar" style="width: 38%;"></div>
          </div>
          <div class="progress-text">
            <span>389 entries</span>
            <span>1000 total</span>
          </div>
        </div>
      </div>
      
      <div class="competition-card cash">
        <div class="card-image">Cash Prize</div>
        <div class="card-content">
          <span class="card-category">Cash</span>
          <h3 class="card-title">£500 Cash Giveaway</h3>
          <span class="card-price">£3.49 per ticket</span>
          <div class="progress-container">
            <div class="progress-bar" style="width: 65%;"></div>
          </div>
          <div class="progress-text">
            <span>650 entries</span>
            <span>1000 total</span>
          </div>
        </div>
      </div>
      
      <div class="competition-card family">
        <div class="card-image">Family Holiday</div>
        <div class="card-content">
          <span class="card-category">Family</span>
          <h3 class="card-title">Family Trip to Disneyland</h3>
          <span class="card-price">£9.99 per ticket</span>
          <div class="progress-container">
            <div class="progress-bar" style="width: 22%;"></div>
          </div>
          <div class="progress-text">
            <span>220 entries</span>
            <span>1000 total</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="btn-wrapper">
      <a href="#" class="btn-primary">View All Competitions</a>
    </div>
  </main>
  
  <footer>
    <p>&copy; 2025 Blue Whale Competitions. All rights reserved.</p>
    <p style="margin-top: 8px; font-size: 0.8rem;">This is a static preview. The full application is currently being deployed.</p>
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
    // Determine the base URL for assets
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://bluewhale-competition.vercel.app';
      
    // Logo endpoint
    if (url === '/api/settings/logo') {
      return sendJSON({
        imageUrl: `${baseUrl}/assets/blue_whale.svg`
      });
    }
    
    // Banner endpoint
    if (url === '/api/settings/banner') {
      return sendJSON({
        imageUrl: `${baseUrl}/assets/banner.jpg`
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
        environment: process.env.VERCEL_ENV || 'development',
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'local',
        region: process.env.VERCEL_REGION || 'local',
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