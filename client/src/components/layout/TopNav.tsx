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
import { Bell, Crown, LogIn, User } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";

// Define TypeScript interfaces for navigation items
interface DropdownItem {
  label: string;
  path: string;
  color?: string;
}

interface NavItem {
  icon: string;
  label: string;
  path: string;
  hasDropdown?: boolean;
  dropdownItems?: DropdownItem[];
}

export default function TopNav() {
  const [location, setLocation] = useLocation();
  const { isAdmin } = useAdmin();
  const { user, logoutUser, isLoading } = useAuth();

  // Public navigation items available to all users
  const publicNavItems: NavItem[] = [
    { icon: "fas fa-home", label: "Dashboard", path: "/" },
    { 
      icon: "fas fa-trophy", 
      label: "Competitions", 
      path: "/competitions",
      hasDropdown: true,
      dropdownItems: [
        { label: "All Competitions", path: "/competitions" },
        { label: "Family", path: "/competitions/family", color: "text-amber-500" },
        { label: "Appliances", path: "/competitions/appliances", color: "text-pink-500" },
        { label: "Cash", path: "/competitions/cash", color: "text-green-500" },
      ] 
    },
    { icon: "fas fa-chart-line", label: "Leaderboard", path: "/leaderboard" },
  ];
  
  // User-specific navigation items available only when logged in
  const userNavItems: NavItem[] = user ? [
    { icon: "fas fa-clipboard-check", label: "My Entries", path: "/my-entries" },
    { icon: "fas fa-medal", label: "My Wins", path: "/my-wins" },
  ] : [];
  
  // Combine public and user items
  let navItems = [...publicNavItems, ...userNavItems];
  
  // We won't add admin to regular navItems since we'll create a special button for it

  const handleLogout = async () => {
    await logoutUser();
    setLocation('/');
  };

  const isActive = (path: string) => {
    // For competitions path, check if location starts with it
    if (path === '/competitions') {
      return location === path || location.startsWith(`${path}/`);
    }
    // For other paths, exact match
    return location === path;
  };

  return (
    <header className="sticky top-0 shadow-md transition-all duration-300 bg-gradient-to-r from-blue-500 to-cyan-600 text-white z-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-md">
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-8 h-8 text-blue-500"
                >
                  <path
                    d="M20 8C19.7434 7.06353 19.066 6.30821 18.1552 5.90911C17.2444 5.51002 16.1944 5.50169 15.277 5.88578C13.3814 3.05655 9.38141 3.05655 7.21676 5.39134C5.05211 7.72613 5.42816 11.4315 8.19748 13.3765C4.50803 13.7524 2 16.0872 2 19V21H22V8Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="10" r="1.5" fill="white" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Blue Whale
                </h1>
                <h2 className="text-sm font-medium tracking-wide text-blue-200">
                  Competitions
                </h2>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                item.hasDropdown ? (
                  <DropdownMenu key={item.path}>
                    <DropdownMenuTrigger asChild>
                      <span
                        className={`px-4 py-2 rounded-xl text-sm flex items-center transition-all duration-200 cursor-pointer ${
                          location.startsWith(item.path)
                            ? 'bg-white/25 text-white font-medium backdrop-blur-sm'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        <i className={`${item.icon} mr-2`}></i>
                        {item.label}
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 p-1">
                      {item.dropdownItems?.map((dropdownItem) => (
                        <Link key={dropdownItem.path} href={dropdownItem.path}>
                          <DropdownMenuItem className="py-2 cursor-pointer focus:bg-blue-50 rounded-md">
                            <span className={dropdownItem.color || ""}>{dropdownItem.label}</span>
                          </DropdownMenuItem>
                        </Link>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
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
                )
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
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-amber-300 ring-2 ring-cyan-600"></span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-1">
                <DropdownMenuLabel className="px-4 py-2 text-lg font-semibold text-blue-500">
                  Notifications
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-4 cursor-pointer focus:bg-blue-50 rounded-lg">
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <i className="fas fa-gift"></i>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">New competition available!</p>
                      <p className="text-xs text-gray-500">$500 Google Play gift card giveaway</p>
                      <p className="text-xs text-gray-400 flex items-center"><i className="fas fa-clock mr-1"></i> 2 minutes ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-4 cursor-pointer focus:bg-blue-50 rounded-lg">
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Your entry was approved</p>
                      <p className="text-xs text-gray-500">Dream Vacation Giveaway</p>
                      <p className="text-xs text-gray-400 flex items-center"><i className="fas fa-clock mr-1"></i> 1 hour ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-4 cursor-pointer focus:bg-blue-50 rounded-lg">
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
                  <Button variant="outline" className="w-full text-sm font-medium text-blue-500 border-blue-200 hover:bg-blue-50">
                    View all notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Button or Profile Dropdown */}
            {user ? (
              // User is logged in - show profile dropdown
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-2 cursor-pointer rounded-full pl-2 pr-3 py-1 transition-all hover:bg-white/10">
                    <Avatar className="h-8 w-8 shadow-md bg-white text-blue-800 border-2 border-cyan-300">
                      <span className="text-sm font-bold">
                        {user.username.substring(0, 2).toUpperCase()}
                      </span>
                    </Avatar>
                    <span className="text-sm font-medium hidden md:block text-white">
                      {user.username}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1">
                  <div className="px-2 py-2.5 mb-1">
                    <div className="font-medium">{user.username}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    {isAdmin && (
                      <div className="mt-1 flex items-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          <i className="fas fa-shield-alt mr-1"></i> Admin
                        </span>
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <Link href="/admin">
                      <DropdownMenuItem className="py-2 cursor-pointer focus:bg-blue-50 rounded-md">
                        <i className="fas fa-shield-alt mr-2 text-rose-600"></i> Admin Dashboard
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuItem className="py-2 cursor-pointer focus:bg-blue-50 rounded-md">
                    <i className="fas fa-user mr-2 text-blue-600"></i> View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2 cursor-pointer focus:bg-blue-50 rounded-md">
                    <i className="fas fa-cog mr-2 text-blue-600"></i> Settings
                  </DropdownMenuItem>
                  {!user.isPremium && (
                    <DropdownMenuItem className="py-2 cursor-pointer focus:bg-blue-50 rounded-md">
                      <i className="fas fa-crown mr-2 text-amber-500"></i> Upgrade to Premium
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="py-2 cursor-pointer focus:bg-blue-50 rounded-md text-blue-500"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // User is not logged in - show login button
              <Link href="/auth">
                <Button variant="outline" className="flex items-center transition-all text-white border-white/30 hover:bg-white/10">
                  <LogIn className="h-4 w-4 mr-1.5" />
                  <span className="text-sm font-medium">Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}