import { LeaderboardUser } from "@shared/types";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface LeaderboardTableProps {
  users: LeaderboardUser[];
  currentUserId: number;
}

export default function LeaderboardTable({ users, currentUserId }: LeaderboardTableProps) {
  const getBadgeColorClass = (rank: number) => {
    if (rank === 1) return "bg-amber-400 text-amber-800";
    if (rank === 2) return "bg-gray-300 text-gray-700";
    if (rank === 3) return "bg-amber-200 text-amber-700";
    return "bg-white border border-gray-300 text-gray-700";
  };

  const getStreakBadgeClass = (days: number) => {
    if (days >= 10) return "bg-rose-500 text-white";
    if (days >= 5) return "bg-emerald-500 text-white";
    if (days >= 3) return "bg-indigo-500 text-white";
    return "bg-gray-200 text-gray-700";
  };

  const getAvatarBgClass = (user: LeaderboardUser) => {
    if (user.rank === 1) return "bg-gradient-to-r from-amber-400 to-yellow-300";
    if (user.rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-200";
    if (user.rank === 3) return "bg-gradient-to-r from-amber-200 to-yellow-100";
    
    // Random colors for others
    const colors = [
      "bg-gradient-to-r from-rose-500 to-pink-500",
      "bg-gradient-to-r from-blue-500 to-indigo-500",
      "bg-gradient-to-r from-emerald-500 to-teal-500",
      "bg-gradient-to-r from-violet-500 to-purple-500",
      "bg-gradient-to-r from-orange-500 to-amber-500"
    ];
    
    return colors[user.id % colors.length];
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
            <TableRow>
              <TableHead className="text-white font-semibold">Rank</TableHead>
              <TableHead className="text-white font-semibold">User</TableHead>
              <TableHead className="text-white font-semibold">Entries</TableHead>
              <TableHead className="text-white font-semibold">Wins</TableHead>
              <TableHead className="text-white font-semibold">Win Rate</TableHead>
              <TableHead className="text-white font-semibold">Streak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  user.id === currentUserId ? 'bg-rose-50' : ''
                }`}
              >
                <TableCell className="py-3">
                  <span className={`flex items-center justify-center w-7 h-7 ${getBadgeColorClass(user.rank)} rounded-full font-bold text-sm shadow-sm`}>
                    {user.rank}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className={`h-10 w-10 text-white shadow-sm ${getAvatarBgClass(user)}`}>
                      <span className="text-sm font-bold">{user.initials}</span>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800 flex items-center">
                        {user.username} 
                        {user.id === currentUserId && (
                          <span className="ml-1.5 px-2 py-0.5 text-xs bg-rose-100 text-rose-600 rounded-full">You</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        {user.isPremium ? (
                          <>
                            <i className="fas fa-crown text-amber-400 mr-1"></i> Premium
                          </>
                        ) : "Free Member"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-gray-800 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {user.entries}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-gray-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {user.wins}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-sm ${
                    user.winRate >= 10 ? 'text-emerald-600' : 
                    user.winRate >= 5 ? 'text-amber-600' : 
                    'text-gray-600'
                  } font-medium`}>
                    {user.winRate.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStreakBadgeClass(user.streak)}`}>
                    <i className="fas fa-fire mr-1.5"></i> {user.streak} day{user.streak !== 1 ? 's' : ''}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
