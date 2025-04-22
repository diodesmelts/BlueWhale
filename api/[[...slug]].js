// API route handler for Vercel serverless
// This is a catch-all for all /api/* requests

const express = require('express');
const app = express();

// Basic API endpoints
app.get('/api/status', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/settings/logo', (req, res) => {
  res.status(200).json({ imageUrl: 'https://28ab6440-e7e2-406a-9e35-29d8f501e03a.replit.dev/assets/blue_whale.svg' });
});

app.get('/api/settings/banner', (req, res) => {
  res.status(200).json({ imageUrl: 'https://28ab6440-e7e2-406a-9e35-29d8f501e03a.replit.dev/assets/banner.jpg' });
});

app.get('/api/user', (req, res) => {
  res.status(401).json({ message: 'Not authenticated' });
});

app.get('/api/leaderboard', (req, res) => {
  res.status(200).json([
    {
      id: 1,
      username: 'SDK',
      initials: 'S',
      score: 3500,
      mascotId: 1
    },
    {
      id: 2,
      username: 'JaneDoe',
      initials: 'JD',
      score: 2200,
      mascotId: 3
    },
    {
      id: 3,
      username: 'BlueFin',
      initials: 'BF',
      score: 1800,
      mascotId: 2
    }
  ]);
});

app.get('/api/user/stats', (req, res) => {
  res.status(200).json({
    activeEntries: 1,
    totalEntries: 1,
    totalWins: 0,
    favoriteCategory: 'Appliances'
  });
});

app.get('/api/competitions', (req, res) => {
  res.status(200).json([
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
});

// Handle any API path
module.exports = (req, res) => {
  // Set appropriate headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Extract the API path from the URL
  const url = req.url;
  
  // Handle some API requests directly
  if (url === '/api/status') {
    return res.status(200).json({ status: 'ok', message: 'Server is running' });
  }
  
  if (url === '/api/settings/logo') {
    return res.status(200).json({ imageUrl: 'https://28ab6440-e7e2-406a-9e35-29d8f501e03a.replit.dev/assets/blue_whale.svg' });
  }
  
  if (url === '/api/settings/banner') {
    return res.status(200).json({ imageUrl: 'https://28ab6440-e7e2-406a-9e35-29d8f501e03a.replit.dev/assets/banner.jpg' });
  }
  
  if (url === '/api/user') {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  if (url === '/api/leaderboard') {
    return res.status(200).json([
      { id: 1, username: 'SDK', initials: 'S', score: 3500, mascotId: 1 },
      { id: 2, username: 'JaneDoe', initials: 'JD', score: 2200, mascotId: 3 },
      { id: 3, username: 'BlueFin', initials: 'BF', score: 1800, mascotId: 2 }
    ]);
  }
  
  if (url === '/api/user/stats') {
    return res.status(200).json({
      activeEntries: 1,
      totalEntries: 1,
      totalWins: 0,
      favoriteCategory: 'Appliances'
    });
  }
  
  if (url === '/api/competitions') {
    return res.status(200).json([
      {
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
      }
    ]);
  }
  
  // Use express app for processing more complex requests
  app(req, res);
};