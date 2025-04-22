// Minimal server backup for serverless deployment
const express = require('express');
const path = require('path');

// Create Express app
const app = express();

// Set up JSON parsing for request bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Basic API endpoints
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/competitions', (req, res) => {
  res.json([
    {
      id: 1,
      title: "Sample Competition",
      description: "This is a sample competition for the fallback server.",
      organizerName: "Blue Whale Competitions",
      image: "https://source.unsplash.com/random/800x600/?prize",
      ticketPrice: 4.99,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);
});

// Catch-all route to handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Export the Express API for serverless function
module.exports = app;