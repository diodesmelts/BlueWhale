// API Leaderboard Endpoint
export default function handler(req, res) {
  // This is a simplified mock data version
  const leaderboard = [
    {
      id: 1,
      username: "CompetitionPro",
      initials: "CP",
      rank: 1,
      entries: 156,
      wins: 12,
      winRate: 77, // 7.7%
      streak: 3
    },
    {
      id: 2,
      username: "LuckyDraw",
      initials: "LD",
      rank: 2,
      entries: 203,
      wins: 8,
      winRate: 39, // 3.9%
      streak: 0
    },
    {
      id: 3,
      username: "PrizeFinder",
      initials: "PF",
      rank: 3,
      entries: 127,
      wins: 6,
      winRate: 47, // 4.7%
      streak: 1
    },
    {
      id: 4,
      username: "ContestKing",
      initials: "CK",
      rank: 4,
      entries: 89,
      wins: 5,
      winRate: 56, // 5.6%
      streak: 2
    },
    {
      id: 5,
      username: "WinMaster",
      initials: "WM",
      rank: 5,
      entries: 146,
      wins: 4,
      winRate: 27, // 2.7%
      streak: 0
    }
  ];

  res.status(200).json(leaderboard);
}