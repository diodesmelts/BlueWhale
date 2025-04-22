// API endpoint for leaderboard data
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  // Sample leaderboard data
  const leaderboard = [
    { id: 1, username: 'SDK', initials: 'S', score: 3500, mascotId: 1 },
    { id: 2, username: 'JaneDoe', initials: 'JD', score: 2200, mascotId: 3 },
    { id: 3, username: 'BlueFin', initials: 'BF', score: 1800, mascotId: 2 },
    { id: 4, username: 'Dolphin123', initials: 'D1', score: 1600, mascotId: 4 },
    { id: 5, username: 'OceanMaster', initials: 'OM', score: 1450, mascotId: 1 }
  ];
  
  res.status(200).json(leaderboard);
};