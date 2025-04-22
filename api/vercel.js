// Simplified Vercel API handler
const express = require('express');
const { join } = require('path');
const fs = require('fs');

// Create Express app
const app = express();

// Use JSON middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Static assets path
const staticPath = join(process.cwd(), 'dist');
const hasStaticFiles = fs.existsSync(staticPath);

// API endpoints for preview/demo data
app.get('/api/settings/logo', (req, res) => {
  res.json({
    imageUrl: 'https://28ab6440-e7e2-406a-9e35-29d8f501e03a.replit.dev/assets/blue_whale.svg'
  });
});

app.get('/api/settings/banner', (req, res) => {
  res.json({
    imageUrl: 'https://28ab6440-e7e2-406a-9e35-29d8f501e03a.replit.dev/assets/banner.jpg'
  });
});

app.get('/api/user', (req, res) => {
  res.status(401).json({ message: 'Not authenticated' });
});

app.get('/api/user/stats', (req, res) => {
  res.json({
    activeEntries: 1,
    totalEntries: 1,
    totalWins: 0,
    favoriteCategory: 'Appliances'
  });
});

app.get('/api/competitions', (req, res) => {
  res.json([{
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
});

app.get('/api/leaderboard', (req, res) => {
  res.json([
    { id: 1, username: 'SDK', initials: 'S', score: 3500, mascotId: 1 },
    { id: 2, username: 'JaneDoe', initials: 'JD', score: 2200, mascotId: 3 },
    { id: 3, username: 'BlueFin', initials: 'BF', score: 1800, mascotId: 2 }
  ]);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Handle all other routes - either serve static files or landing page
app.get('*', (req, res) => {
  if (hasStaticFiles) {
    // Check if this is a specific file path
    const filePath = join(staticPath, req.path);
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return res.sendFile(filePath);
    }
    
    // SPA fallback
    return res.sendFile(join(staticPath, 'index.html'));
  }
  
  // No static files available, use the landing page from index.js
  try {
    const indexModule = require('./index.js');
    return indexModule(req, res);
  } catch (error) {
    console.error('Failed to load landing page:', error);
    return res.status(500).send('Server error');
  }
});

// Export for Vercel serverless
module.exports = app;