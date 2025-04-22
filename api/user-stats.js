// API endpoint for user stats
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  // Return sample user stats
  res.status(200).json({
    activeEntries: 1,
    totalEntries: 1,
    totalWins: 0,
    favoriteCategory: 'Appliances'
  });
};