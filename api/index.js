// Optimized Vercel Serverless API handler
const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();

// Use JSON middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set CORS headers
app.use(cors({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  credentials: true
}));

// API endpoints for preview/demo data
app.get('/api/settings/logo', (req, res) => {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://bluewhale-competition.vercel.app';
    
  res.json({
    imageUrl: `${baseUrl}/assets/blue_whale.svg`
  });
});

app.get('/api/settings/banner', (req, res) => {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://bluewhale-competition.vercel.app';
    
  res.json({
    imageUrl: `${baseUrl}/assets/banner.jpg`
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
    organizerName: 'Blue Whale Competitions',
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
    environment: process.env.VERCEL_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Catch-all handler for API routes not explicitly defined
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: 'This endpoint is not available in preview mode.'
  });
});

// Export for Vercel serverless
module.exports = app;

// For Vercel's serverless functions
module.exports.default = (req, res) => {
  return app(req, res);
};