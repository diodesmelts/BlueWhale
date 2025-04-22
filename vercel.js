// This file is executed by Vercel during deployment
// It acts as a static file server for the client application

// Export a default function that Vercel can call
module.exports = (req, res) => {
  // This will never be executed as Vercel will serve static files directly
  // The vercel.json configuration handles all the routing
  res.status(404).send('Not found');
};