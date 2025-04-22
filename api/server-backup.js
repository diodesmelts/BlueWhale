// Minimal server backup for serverless deployment
const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();

// Set up JSON parsing for request bodies
app.use(express.json());

// Basic API endpoints
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/competitions', (req, res) => {
  res.json([
    {
      id: 1,
      title: "Ninja Air Fryer",
      description: "Win this amazing air fryer for your kitchen!",
      organizerName: "Blue Whale Competitions",
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?ixlib=rb-4.0.3",
      ticketPrice: 4.99,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);
});

// Serve the WhaleBlue landing page for all other routes
app.get('*', (req, res) => {
  const landingPage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blue Whale Competitions</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #001933;
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
    }
    .logo {
      width: 120px;
      height: 120px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 2.5rem;
      margin: 0 0 10px 0;
      color: #00a8e8;
    }
    p {
      font-size: 1.2rem;
      margin: 10px 0;
      max-width: 600px;
    }
    .card {
      background-color: rgba(0, 41, 84, 0.8);
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(0, 168, 232, 0.3);
      margin: 20px 0;
      backdrop-filter: blur(10px);
    }
    .loading {
      display: inline-block;
      width: 50px;
      height: 50px;
      border: 3px solid rgba(0, 168, 232, 0.3);
      border-radius: 50%;
      border-top-color: #00a8e8;
      animation: spin 1s ease-in-out infinite;
      margin: 20px 0;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .button {
      background-color: #00a8e8;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 20px;
      text-decoration: none;
      font-weight: bold;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #0089c1;
    }
    .whale-svg {
      stroke: #00a8e8;
      fill: #00a8e8;
      width: 100px;
      height: 100px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="card">
    <svg class="whale-svg" viewBox="0 0 100 100">
      <path d="M85,50c0,19.33-15.67,35-35,35S15,69.33,15,50S30.67,15,50,15S85,30.67,85,50z M60,30c2.76,0,5,2.24,5,5s-2.24,5-5,5
        s-5-2.24-5-5S57.24,30,60,30z M30,65c0,0,5-15,20-15s20,15,20,15s-10-5-20-5S30,65,30,65z"/>
    </svg>
    <h1>Blue Whale Competitions</h1>
    <p>The ultimate competition hub is being prepared. Our team is working on getting everything ready for you.</p>
    <div class="loading"></div>
    <p>Please check back soon or contact our support team for assistance.</p>
    <a href="/api/status" class="button">Check API Status</a>
  </div>

  <script>
    // Check if the API is available
    fetch('/api/status')
      .then(response => response.json())
      .then(data => {
        console.log('API Status:', data);
      })
      .catch(error => {
        console.error('API Check Error:', error);
      });
  </script>
</body>
</html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(landingPage);
});

// Export the Express API for serverless function
module.exports = app;