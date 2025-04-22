// API User Stats Endpoint
export default function handler(req, res) {
  // This would be connected to a database in production
  const userStats = {
    activeEntries: 3,
    totalEntries: 27,
    totalWins: 2,
    totalWinValue: 650, // in USD
    lastWinDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    completionRate: 92, // percentage
    favoriteCategory: "appliances",
    walletBalance: 1500 // in cents ($15.00)
  };

  res.status(200).json(userStats);
}