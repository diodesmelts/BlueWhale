import { Link, useLocation } from "wouter";
import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";

export default function MobileNav() {
  const [location] = useLocation();
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  
  // Public navigation items available to all users
  const publicNavItems = [
    { icon: "fas fa-home", label: "Home", path: "/" },
    { icon: "fas fa-trophy", label: "Competitions", path: "/competitions" },
    { icon: "fas fa-chart-line", label: "Leaderboard", path: "/leaderboard" },
  ];
  
  // User-specific navigation items only when logged in
  const userNavItems = user ? [
    { icon: "fas fa-clipboard-check", label: "Entries", path: "/my-entries" },
    { icon: "fas fa-medal", label: "Wins", path: "/my-wins" },
  ] : [];
  
  // Authentication navigation item (login/profile)
  const authNavItem = user
    ? { icon: "fas fa-user", label: "Profile", path: "/profile" } // This will be handled in the dropdown
    : { icon: "fas fa-sign-in-alt", label: "Login", path: "/auth" };
  
  // Build navigation items
  let navItems = [...publicNavItems, ...userNavItems];
  
  // Always add admin as its own icon if admin, otherwise add the auth item
  if (user && isAdmin) {
    navItems.push({ icon: "fas fa-shield-alt", label: "Admin", path: "/admin" });
  } 
  
  // Always add login/profile item
  navItems.push(authNavItem);

  const isActive = (path: string) => location === path;

  return (
    <div className="bg-black border-t border-gray-800 shadow-lg text-white w-full md:hidden fixed bottom-0 z-50 flex justify-around py-2 px-1">
      {navItems.map((item) => (
        <Link key={item.path} href={item.path}>
          {isActive(item.path) ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-md -mt-6 mb-1 border-2 border-black">
                <i className={`${item.icon} text-lg`}></i>
              </div>
              <span className="text-xs font-bold text-cyan-400">{item.label}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center py-1 px-3 cursor-pointer hover:text-cyan-400 transition-colors">
              <i className={`${item.icon} text-gray-300 opacity-80 text-lg`}></i>
              <span className="text-xs mt-1 text-gray-300 opacity-80">{item.label}</span>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
