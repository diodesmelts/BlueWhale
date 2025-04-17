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
import { Bell, LogIn, User } from "lucide-react";
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
    { icon: "fas fa-home", label: "Home", path: "/" },
    { 
      icon: "fas fa-trophy", 
      label: "Competitions", 
      path: "/competitions",
      hasDropdown: true,
      dropdownItems: [
        { label: "Cash", path: "/competitions/cash", color: "text-green-500" },
        { label: "All Competitions", path: "/competitions", color: "text-blue-500" },
        { label: "Family", path: "/competitions/family", color: "text-amber-500" },
        { label: "Appliances", path: "/competitions/appliances", color: "text-pink-500" },
        { label: "Featured Competitions", path: "/competitions", color: "text-purple-500" },
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
    <header className="sticky top-0 shadow-lg transition-all duration-300 bg-black text-white z-20">
      {/* Top stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 via-cyan-500 to-purple-500"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4 md:space-x-10">
            {/* Logo - Image */}
            <Link href="/">
              <div className="flex items-center group">
                <div className="transform transition-all duration-300 group-hover:translate-x-1">
                  <img 
                    src="/blue-whale.png" 
                    alt="Blue Whale Competitions" 
                    className="h-10 md:h-12 hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                item.hasDropdown ? (
                  <DropdownMenu key={item.path}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`px-4 py-2.5 rounded-full text-sm flex items-center transition-all duration-200 ${
                          location.startsWith(item.path)
                            ? 'bg-cyan-900 text-cyan-300 shadow-md font-medium'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <i className={`${item.icon} mr-2`}></i>
                        {item.label}
                        <i className="fas fa-chevron-down ml-2 text-xs opacity-70"></i>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 p-1 rounded-xl shadow-xl border-gray-800">
                      {item.dropdownItems?.map((dropdownItem) => (
                        <Link key={dropdownItem.path} href={dropdownItem.path}>
                          <DropdownMenuItem className="py-2.5 px-3 cursor-pointer focus:bg-gray-50 rounded-lg my-0.5 transition-colors">
                            <span className="flex items-center">
                              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${dropdownItem.color ? dropdownItem.color.replace("text-", "bg-") : ""}`}></span>
                              <span className={`${dropdownItem.color || ""} font-medium`}>{dropdownItem.label}</span>
                            </span>
                          </DropdownMenuItem>
                        </Link>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link key={item.path} href={item.path}>
                    <button
                      className={`px-4 py-2.5 rounded-full text-sm flex items-center transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-cyan-900 text-cyan-300 shadow-md font-medium'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <i className={`${item.icon} mr-2`}></i>
                      {item.label}
                    </button>
                  </Link>
                )
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-2 md:space-x-6">

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-full focus:outline-none transition-all text-white hover:bg-gray-800 bg-cyan-900">
                  <Bell className="h-5 w-5 text-cyan-300" />
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-purple-400 ring-2 ring-black"></span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-2 rounded-xl shadow-xl">
                <DropdownMenuLabel className="px-4 py-3 text-lg font-semibold text-cyan-600 flex items-center border-b border-gray-200 pb-3">
                  <i className="fas fa-bell mr-2 text-cyan-500"></i>
                  Notifications
                </DropdownMenuLabel>
                <div className="max-h-[320px] overflow-y-auto py-1">
                  <DropdownMenuItem className="p-4 cursor-pointer focus:bg-cyan-50 rounded-xl my-1 hover:bg-cyan-50 transition-colors">
                    <div className="flex space-x-3">
                      <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 shrink-0">
                        <i className="fas fa-gift"></i>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">New competition available!</p>
                        <p className="text-xs text-gray-500">£500 Google Play gift card giveaway</p>
                        <p className="text-xs text-gray-400 flex items-center"><i className="fas fa-clock mr-1"></i> 2 minutes ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-4 cursor-pointer focus:bg-cyan-50 rounded-xl my-1 hover:bg-cyan-50 transition-colors">
                    <div className="flex space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Your entry was approved</p>
                        <p className="text-xs text-gray-500">Dream Vacation Giveaway</p>
                        <p className="text-xs text-gray-400 flex items-center"><i className="fas fa-clock mr-1"></i> 1 hour ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-4 cursor-pointer focus:bg-purple-50 rounded-xl my-1 hover:bg-purple-50 transition-colors">
                    <div className="flex space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0">
                        <i className="fas fa-trophy"></i>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Congratulations! You won!</p>
                        <p className="text-xs text-gray-500">Apple Gift Card Giveaway</p>
                        <p className="text-xs text-gray-400 flex items-center"><i className="fas fa-clock mr-1"></i> 5 hours ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>
                <div className="p-2 mt-2 border-t border-gray-200 pt-3">
                  <Button className="w-full text-sm font-medium bg-cyan-100 hover:bg-cyan-200 text-cyan-700 border-0">
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
                  <div className="flex items-center space-x-2 cursor-pointer rounded-full pl-2 pr-4 py-1.5 transition-all bg-cyan-900 hover:bg-gray-800">
                    <Avatar className="h-9 w-9 shadow-md bg-black text-cyan-400 border-2 border-cyan-600">
                      <span className="text-sm font-bold">
                        {user.username.substring(0, 2).toUpperCase()}
                      </span>
                    </Avatar>
                    <span className="text-sm font-medium hidden md:block text-cyan-300">
                      {user.username}
                    </span>
                    <i className="fas fa-chevron-down text-xs opacity-70 text-cyan-200 hidden md:block"></i>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 p-2 rounded-xl shadow-xl">
                  <div className="p-3 mb-1 bg-black rounded-lg">
                    <div className="font-semibold text-cyan-400">{user.username}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
                    <div className="flex mt-2 items-center space-x-2">
                      {isAdmin && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-900 text-purple-300">
                          <i className="fas fa-shield-alt mr-1"></i> Admin
                        </span>
                      )}
                      {user.isPremium && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-900 text-cyan-300">
                          <i className="fas fa-crown mr-1"></i> Premium
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <Link href="/admin">
                      <DropdownMenuItem className="py-2.5 px-3 cursor-pointer focus:bg-purple-50 rounded-lg my-0.5 hover:bg-purple-50 transition-colors">
                        <i className="fas fa-shield-alt mr-2 text-purple-600"></i> Admin Dashboard
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuItem className="py-2.5 px-3 cursor-pointer focus:bg-cyan-50 rounded-lg my-0.5 hover:bg-cyan-50 transition-colors">
                    <i className="fas fa-user mr-2 text-cyan-600"></i> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2.5 px-3 cursor-pointer focus:bg-cyan-50 rounded-lg my-0.5 hover:bg-cyan-50 transition-colors">
                    <i className="fas fa-wallet mr-2 text-green-600"></i> My Balance
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2.5 px-3 cursor-pointer focus:bg-cyan-50 rounded-lg my-0.5 hover:bg-cyan-50 transition-colors">
                    <i className="fas fa-cog mr-2 text-gray-600"></i> Account Settings
                  </DropdownMenuItem>
                  {!user.isPremium && (
                    <DropdownMenuItem className="py-2.5 px-3 cursor-pointer focus:bg-purple-50 rounded-lg my-0.5 hover:bg-purple-50 transition-colors">
                      <i className="fas fa-crown mr-2 text-purple-500"></i> Upgrade to Premium
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem 
                    className="py-2.5 px-3 cursor-pointer focus:bg-red-50 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // User is not logged in - show login button
              <Link href="/auth">
                <Button className="flex items-center bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white border-0 shadow-md">
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