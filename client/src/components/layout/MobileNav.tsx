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
    ? { icon: "fas fa-user", label: "Profile", path: "/profile" }
    : { icon: "fas fa-sign-in-alt", label: "Login", path: "/auth" };
  
  // Build navigation items
  let navItems = [...publicNavItems, ...userNavItems];
  
  // Add admin or profile as the last icon
  if (user && isAdmin) {
    navItems.push({ icon: "fas fa-shield-alt", label: "Admin", path: "/admin" });
  } else {
    navItems.push(authNavItem);
  }

  const isActive = (path: string) => location === path;

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg text-gray-700 w-full md:hidden fixed bottom-0 z-50 flex justify-around py-2 px-1">
      {navItems.map((item) => (
        <Link key={item.path} href={item.path}>
          {isActive(item.path) ? (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md -mt-5 mb-1 border-2 border-white">
                <i className={`${item.icon}`}></i>
              </div>
              <span className="text-xs font-bold text-rose-600">{item.label}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center py-1 px-3 cursor-pointer hover:text-rose-500 transition-colors">
              <i className={`${item.icon} text-gray-500`}></i>
              <span className="text-xs mt-1 text-gray-500">{item.label}</span>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
