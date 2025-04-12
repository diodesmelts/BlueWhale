import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Crown } from "lucide-react";

export default function TopNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: "fas fa-home", label: "Dashboard", path: "/" },
    { icon: "fas fa-trophy", label: "Competitions", path: "/competitions" },
    { icon: "fas fa-clipboard-check", label: "My Entries", path: "/my-entries" },
    { icon: "fas fa-medal", label: "My Wins", path: "/my-wins" },
    { icon: "fas fa-chart-line", label: "Leaderboard", path: "/leaderboard" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 shadow-md transition-all duration-300 bg-gradient-to-r from-blue-900 to-indigo-800 text-white z-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md">
                <svg 
                  className="w-6 h-6 text-blue-800" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M18 6H16V4C16 2.89 15.11 2 14 2H10C8.89 2 8 2.89 8 4V6H6C4.89 6 4 6.89 4 8V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8C20 6.89 19.11 6 18 6ZM10 4H14V6H10V4ZM12 19L8 15L9.41 13.59L11 15.17L14.59 11.59L16 13L12 19Z" 
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                CompetePro
                <span className="text-white ml-1">+</span>
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <span
                    className={`px-4 py-2 rounded-xl text-sm flex items-center transition-all duration-200 cursor-pointer ${
                      isActive(item.path)
                        ? 'bg-white/25 text-white font-medium backdrop-blur-sm'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <i className={`${item.icon} mr-2`}></i>
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-5">
            {/* Premium Button */}
            <Button variant="outline" className="hidden md:flex items-center transition-all text-white border-white/30 hover:bg-white/10">
              <Crown className="h-4 w-4 mr-1.5" />
              <span className="text-sm font-medium">Go Premium</span>
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-1.5 rounded-full focus:outline-none transition-all text-white hover:bg-white/20">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-amber-300 ring-2 ring-blue-800"></span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-1">
                <DropdownMenuLabel className="px-4 py-2 text-lg font-semibold text-gray-800">
                  Notifications
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-4 cursor-pointer focus:bg-rose-50 rounded-lg">
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500">
                      <i className="fas fa-gift"></i>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">New competition available!</p>
                      <p className="text-xs text-gray-500">$500 Google Play gift card giveaway</p>
                      <p className="text-xs text-gray-400 flex items-center"><i className="fas fa-clock mr-1"></i> 2 minutes ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-4 cursor-pointer focus:bg-rose-50 rounded-lg">
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Your entry was approved</p>
                      <p className="text-xs text-gray-500">Dream Vacation Giveaway</p>
                      <p className="text-xs text-gray-400 flex items-center"><i className="fas fa-clock mr-1"></i> 1 hour ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-4 cursor-pointer focus:bg-rose-50 rounded-lg">
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
                      <i className="fas fa-trophy"></i>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Congratulations! You won!</p>
                      <p className="text-xs text-gray-500">Apple Gift Card Giveaway</p>
                      <p className="text-xs text-gray-400 flex items-center"><i className="fas fa-clock mr-1"></i> 5 hours ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button variant="outline" className="w-full text-sm font-medium text-rose-600 border-rose-200 hover:bg-rose-50">
                    View all notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-2 cursor-pointer rounded-full pl-2 pr-3 py-1 transition-all hover:bg-white/10">
                  <Avatar className="h-8 w-8 shadow-md bg-white text-rose-600">
                    <span className="text-sm font-bold">JS</span>
                  </Avatar>
                  <span className="text-sm font-medium hidden md:block text-white">
                    John Smith
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1">
                <div className="px-2 py-2.5 mb-1">
                  <div className="font-medium">John Smith</div>
                  <div className="text-xs text-gray-500">john.smith@example.com</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="py-2 cursor-pointer focus:bg-rose-50 rounded-md">
                  <i className="fas fa-user mr-2 text-gray-500"></i> View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2 cursor-pointer focus:bg-rose-50 rounded-md">
                  <i className="fas fa-cog mr-2 text-gray-500"></i> Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2 cursor-pointer focus:bg-rose-50 rounded-md">
                  <i className="fas fa-crown mr-2 text-amber-500"></i> Upgrade to Premium
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="py-2 cursor-pointer focus:bg-rose-50 rounded-md text-rose-600">
                  <i className="fas fa-sign-out-alt mr-2"></i> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}