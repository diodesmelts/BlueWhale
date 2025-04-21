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
import { LogIn, User } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { LogoDisplay } from "@/components/ui/logo-display";
import MascotSelector, { getMascotById } from "@/components/profile/MascotSelector";
import { useState } from "react";
import { NotificationBell } from "@/components/notifications/NotificationBell";

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
  const [currentMascotId, setCurrentMascotId] = useState<string | null>("whale");

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
    { icon: "fas fa-gamepad", label: "How to Play", path: "/how-to-play" },
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
    <header className="sticky top-0 shadow-lg transition-all duration-300 text-white z-20 bg-gradient-to-b from-gray-900 to-black relative border-t-[3px] border-[#0abde3] w-full">
      
      {/* Background decorative elements to match How to Play section */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-800/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-800/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/6 w-40 h-40 bg-blue-800/15 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="flex justify-between items-center h-28 py-2 w-full">
          <div className="flex items-center space-x-4 md:space-x-16">
            {/* Logo - Image */}
            <Link href="/">
              <div className="flex items-center group">
                <div className="transform transition-all duration-300 group-hover:translate-x-1">
                  <LogoDisplay size="md" className="hover:scale-105 transition-transform duration-300" />
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                item.hasDropdown ? (
                  <DropdownMenu key={item.path}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`px-5 py-3 text-lg flex items-center transition-all duration-200 ${
                          location.startsWith(item.path)
                            ? 'text-cyan-300 font-medium border-b-2 border-cyan-400'
                            : 'text-gray-300 hover:text-gray-100'
                        }`}
                      >
                        <i className={`${item.icon} mr-2 text-lg`}></i>
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
                      className={`px-5 py-3 text-lg flex items-center transition-all duration-200 ${
                        isActive(item.path)
                          ? 'text-cyan-300 font-medium border-b-2 border-cyan-400'
                          : 'text-gray-300 hover:text-gray-100'
                      }`}
                    >
                      <i className={`${item.icon} mr-2 text-lg`}></i>
                      {item.label}
                    </button>
                  </Link>
                )
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4 md:space-x-8">

            {/* Notifications - only for logged in users */}
            {user && (
              <div className="relative p-2 rounded-full focus:outline-none transition-all hover:bg-gray-800 bg-cyan-900/50">
                <NotificationBell />
              </div>
            )}

            {/* Auth Button or Profile Dropdown */}
            {user ? (
              // User is logged in - show profile dropdown
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-3 cursor-pointer rounded-full pl-3 pr-5 py-2 transition-all bg-cyan-900 hover:bg-gray-800">
                    <Avatar className="h-12 w-12 shadow-md bg-black border-2 border-cyan-600 p-0 overflow-hidden">
                      <div className="h-full w-full flex items-center justify-center">
                        <MascotSelector 
                          currentMascotId={user.mascotId || currentMascotId} 
                          onSelect={setCurrentMascotId} 
                        />
                      </div>
                    </Avatar>
                    <span className="text-base font-medium hidden md:block text-cyan-300">
                      {user.username}
                    </span>
                    <i className="fas fa-chevron-down text-sm opacity-70 text-cyan-200 hidden md:block"></i>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-0 rounded-xl shadow-xl border border-gray-700 bg-gray-900">
                  {/* Dark header section with user info */}
                  <div className="p-4 bg-gray-900 rounded-t-xl border-b border-gray-800">
                    <div className="font-semibold text-cyan-400 text-xl">{user.username}</div>
                    <div className="text-xs text-gray-400 mt-1">{user.email}</div>
                    <div className="flex mt-2 items-center space-x-2">
                      {isAdmin && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-purple-800 text-purple-200">
                          <i className="fas fa-shield-alt mr-1.5"></i> Admin
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="py-2 bg-white bg-opacity-5">
                    {isAdmin && (
                      <>
                        <Link href="/admin">
                          <DropdownMenuItem className="py-3 px-4 cursor-pointer my-0.5 transition-colors hover:bg-white/5">
                            <div className="w-8 h-8 rounded-full bg-purple-200/20 flex items-center justify-center mr-3">
                              <i className="fas fa-shield-alt text-purple-300"></i>
                            </div>
                            <span className="text-white text-opacity-80">Admin Dashboard</span>
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/listings">
                          <DropdownMenuItem className="py-3 px-4 cursor-pointer my-0.5 transition-colors hover:bg-white/5">
                            <div className="w-8 h-8 rounded-full bg-blue-200/20 flex items-center justify-center mr-3">
                              <i className="fas fa-list-alt text-blue-300"></i>
                            </div>
                            <span className="text-white text-opacity-80">Listings Management</span>
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}
                    <Link href="/profile">
                      <DropdownMenuItem className="py-3 px-4 cursor-pointer my-0.5 transition-colors hover:bg-white/5">
                        <div className="w-8 h-8 rounded-full bg-cyan-200/20 flex items-center justify-center mr-3">
                          <i className="fas fa-user text-cyan-300"></i>
                        </div>
                        <span className="text-white text-opacity-80">My Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="py-3 px-4 cursor-pointer my-0.5 transition-colors hover:bg-white/5">
                      <div className="w-8 h-8 rounded-full bg-green-200/20 flex items-center justify-center mr-3">
                        <i className="fas fa-wallet text-green-300"></i>
                      </div>
                      <span className="text-white text-opacity-80">My Balance</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="py-3 px-4 cursor-pointer my-0.5 transition-colors hover:bg-white/5">
                      <div className="w-8 h-8 rounded-full bg-gray-400/20 flex items-center justify-center mr-3">
                        <i className="fas fa-cog text-gray-300"></i>
                      </div>
                      <span className="text-white text-opacity-80">Account Settings</span>
                    </DropdownMenuItem>
                  </div>
                  
                  <DropdownMenuSeparator className="m-0 border-t border-gray-800" />
                  
                  <DropdownMenuItem 
                    className="py-3 px-4 cursor-pointer transition-colors hover:bg-white/5 bg-white bg-opacity-5"
                    onClick={handleLogout}
                  >
                    <div className="w-8 h-8 rounded-full bg-red-200/20 flex items-center justify-center mr-3">
                      <i className="fas fa-sign-out-alt text-red-300"></i>
                    </div>
                    <span className="text-red-300">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // User is not logged in - show login and register buttons
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="outline" className="flex items-center bg-transparent border border-cyan-600 text-cyan-400 hover:bg-cyan-900/30 px-4 py-5 shadow-sm">
                    <LogIn className="h-5 w-5 mr-2" />
                    <span className="text-base font-medium">Login</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="flex items-center bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white border-0 shadow-md px-4 py-5">
                    <span className="text-base font-medium">Register</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}