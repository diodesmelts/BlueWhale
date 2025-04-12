import { Link, useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { icon: "fas fa-home", label: "Dashboard", path: "/" },
    { icon: "fas fa-trophy", label: "Competitions", path: "/competitions" },
    { icon: "fas fa-clipboard-check", label: "My Entries", path: "/my-entries" },
    { icon: "fas fa-medal", label: "My Wins", path: "/my-wins" },
    { icon: "fas fa-crown", label: "Leaderboard", path: "/leaderboard" },
    { icon: "fas fa-bell", label: "Notifications", path: "/notifications", badge: 3 },
    { icon: "fas fa-cog", label: "Settings", path: "/settings" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        className={`bg-[#153B84] text-white w-64 flex-shrink-0 fixed md:static inset-y-0 left-0 z-50 transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } transition-transform duration-200 ease-in-out flex flex-col h-screen`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6H16V4C16 2.89 15.11 2 14 2H10C8.89 2 8 2.89 8 4V6H6C4.89 6 4 6.89 4 8V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8C20 6.89 19.11 6 18 6ZM10 4H14V6H10V4ZM12 19L8 15L9.41 13.59L11 15.17L14.59 11.59L16 13L12 19Z" fill="#FFF13A"/>
            </svg>
            <h1 className="text-xl font-semibold">CompetePro</h1>
          </div>
        </div>
        
        <nav className="mt-6 flex-1">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={onClose}
            >
              <a 
                className={`px-6 py-3 flex items-center space-x-3 cursor-pointer transition-colors duration-200 
                  ${isActive(item.path) 
                    ? "bg-[#0D2456]" 
                    : "hover:bg-[rgba(21,59,132,0.1)]"}`}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-[#DB1F1F] text-white text-xs font-bold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </a>
            </Link>
          ))}
        </nav>
        
        <div className="p-4">
          <div className="bg-[#0D2456] rounded-lg p-4">
            <h3 className="font-medium text-sm mb-2">Upgrade to Pro</h3>
            <p className="text-xs text-gray-300 mb-3">Unlock auto-entry and premium features</p>
            <button className="w-full bg-[#DB1F1F] hover:bg-red-700 text-white py-2 rounded-md text-sm font-medium transition duration-300">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
