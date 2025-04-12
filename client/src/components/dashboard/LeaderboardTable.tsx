import { LeaderboardUser } from "@shared/types";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface LeaderboardTableProps {
  users: LeaderboardUser[];
  currentUserId: number;
}

export default function LeaderboardTable({ users, currentUserId }: LeaderboardTableProps) {
  const getBadgeColorClass = (rank: number) => {
    if (rank === 1) return "bg-[#FFF13A] text-[#153B84]";
    if (rank === 2) return "bg-gray-300 text-[#153B84]";
    if (rank === 3) return "bg-[#FFF13A] bg-opacity-50 text-[#153B84]";
    return "bg-white border border-[#153B84] text-[#153B84]";
  };

  const getStreakBadgeClass = (days: number) => {
    if (days >= 10) return "bg-[#DB1F1F] text-white";
    if (days >= 5) return "bg-[#7ED957] text-white";
    if (days >= 3) return "bg-[#153B84] text-white";
    return "bg-gray-300 text-gray-800";
  };

  const getAvatarBgClass = (user: LeaderboardUser) => {
    if (user.rank === 1) return "bg-[#DB1F1F]";
    if (user.rank === 2) return "bg-[#153B84]";
    if (user.rank === 3) return "bg-[#7ED957]";
    return "bg-[#153B84]";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#153B84] text-white">
            <TableRow>
              <TableHead className="text-white">Rank</TableHead>
              <TableHead className="text-white">User</TableHead>
              <TableHead className="text-white">Entries</TableHead>
              <TableHead className="text-white">Wins</TableHead>
              <TableHead className="text-white">Win Rate</TableHead>
              <TableHead className="text-white">Streak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id}
                className={`border-b border-gray ${user.id === currentUserId ? 'bg-[#153B84] bg-opacity-5' : ''}`}
              >
                <TableCell className="py-3">
                  <span className={`flex items-center justify-center w-6 h-6 ${getBadgeColorClass(user.rank)} rounded-full font-bold text-sm`}>
                    {user.rank}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className={`h-8 w-8 text-white ${getAvatarBgClass(user)}`}>
                      <span className="text-sm">{user.initials}</span>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-[#153B84]">
                        {user.username} {user.id === currentUserId && "(You)"}
                      </p>
                      <p className="text-xs text-gray-500">{user.isPremium ? "Premium Member" : "Free Member"}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{user.entries}</TableCell>
                <TableCell className="text-sm text-gray-600">{user.wins}</TableCell>
                <TableCell>
                  <span className={`text-sm ${user.winRate >= 10 ? 'text-[#7ED957]' : 'text-gray-600'} font-medium`}>
                    {user.winRate.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStreakBadgeClass(user.streak)}`}>
                    <i className="fas fa-fire mr-1"></i> {user.streak} day{user.streak !== 1 ? 's' : ''}
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
