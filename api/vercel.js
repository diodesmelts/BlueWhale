// Vercel standard API handler
const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const fs = require('fs');

// Create Express app
const app = express();

// Use JSON middleware
app.use(express.json());

// Serve static files from dist folder if it exists
if (fs.existsSync(join(process.cwd(), 'dist'))) {
  app.use(express.static(join(process.cwd(), 'dist')));
}

// API endpoints (same as in index.js but more structured)
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

// SPA Fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  if (fs.existsSync(join(process.cwd(), 'dist', 'index.html'))) {
    res.sendFile(join(process.cwd(), 'dist', 'index.html'));
  } else {
    // Serve the landing page from index.js
    const indexModule = require('./index.js');
    indexModule(req, res);
  }
});

// Create HTTP server
const server = createServer(app);

// Start server if not running as Vercel serverless function
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;