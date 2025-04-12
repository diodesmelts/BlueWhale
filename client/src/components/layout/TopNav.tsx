import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search } from "lucide-react";

export default function TopNav() {
  const [location] = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Competitions", path: "/competitions" },
    { label: "My Entries", path: "/my-entries" },
    { label: "My Wins", path: "/my-wins" },
    { label: "Leaderboard", path: "/leaderboard" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6H16V4C16 2.89 15.11 2 14 2H10C8.89 2 8 2.89 8 4V6H6C4.89 6 4 6.89 4 8V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8C20 6.89 19.11 6 18 6ZM10 4H14V6H10V4ZM12 19L8 15L9.41 13.59L11 15.17L14.59 11.59L16 13L12 19Z" fill="#FFF"/>
              </svg>
              <h1 className="text-xl font-bold tracking-tight">CompetePro</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <span
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      isActive(item.path)
                        ? "bg-white text-rose-600"
                        : "text-white hover:bg-rose-400 hover:bg-opacity-40"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-5">
            {/* Search */}
            <div className="relative hidden md:block w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-300" />
              </div>
              <Input
                className="block w-full pl-10 pr-3 py-1.5 border-0 text-white placeholder-gray-300 bg-rose-600 bg-opacity-40 focus:bg-opacity-60 focus:ring-2 focus:ring-white sm:text-sm rounded-full"
                placeholder="Search competitions..."
              />
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-1 rounded-full text-white hover:bg-rose-600 hover:bg-opacity-40 focus:outline-none">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0.5 block h-2 w-2 rounded-full bg-yellow-300 ring-2 ring-rose-500"></span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-3 cursor-pointer">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">New competition available</p>
                    <p className="text-xs text-gray-500">$500 Google Play gift card giveaway</p>
                    <p className="text-xs text-gray-400">2 minutes ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3 cursor-pointer">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Your entry was approved</p>
                    <p className="text-xs text-gray-500">Dream Vacation Giveaway</p>
                    <p className="text-xs text-gray-400">1 hour ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm font-medium text-rose-600 cursor-pointer">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-2 cursor-pointer hover:bg-rose-600 hover:bg-opacity-40 rounded-full pl-2 pr-3 py-1">
                  <Avatar className="h-8 w-8 bg-white text-rose-600">
                    <span className="text-sm font-bold">JS</span>
                  </Avatar>
                  <span className="text-sm font-medium hidden md:block">John Smith</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Upgrade to Pro</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}