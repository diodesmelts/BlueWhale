import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import MascotSelector, { getMascotById } from "@/components/profile/MascotSelector";

interface NavItem {
  icon: string;
  label: string;
  path: string;
  hasSubmenu?: boolean;
  action?: () => void;
}

interface CategoryItem {
  label: string;
  path: string;
  color: string;
  id: string;
}

export default function MobileNav() {
  const [location] = useLocation();
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  const [isCompetitionsOpen, setIsCompetitionsOpen] = useState(false);
  const [currentMascotId, setCurrentMascotId] = useState<string | null>(user?.mascotId || "whale");
  
  // Competition categories
  const competitionCategories: CategoryItem[] = [
    { label: "Cash", path: "/competitions/cash", color: "bg-green-500", id: "cash" },
    { label: "All Competitions", path: "/competitions", color: "bg-blue-500", id: "all" },
    { label: "Family", path: "/competitions/family", color: "bg-amber-500", id: "family" },
    { label: "Appliances", path: "/competitions/appliances", color: "bg-pink-500", id: "appliances" },
    { label: "Featured Competitions", path: "/competitions", color: "bg-purple-500", id: "featured" },
  ];
  
  // Public navigation items available to all users
  const publicNavItems: NavItem[] = [
    { icon: "fas fa-home", label: "Home", path: "/" },
    { 
      icon: "fas fa-trophy", 
      label: "Competitions", 
      path: "/competitions",
      hasSubmenu: true,
      action: () => setIsCompetitionsOpen(true)
    },
    { icon: "fas fa-gamepad", label: "How to Play", path: "/how-to-play" },
  ];
  
  // User-specific navigation items only when logged in
  const userNavItems: NavItem[] = user ? [
    { icon: "fas fa-clipboard-check", label: "Entries", path: "/my-entries" },
    { icon: "fas fa-medal", label: "Wins", path: "/my-wins" },
  ] : [];
  
  // Authentication navigation items (login/register/profile)
  const authNavItems: NavItem[] = user
    ? [{ icon: "fas fa-user", label: "Profile", path: "/profile" }] // Profile when logged in
    : [
        { icon: "fas fa-sign-in-alt", label: "Login", path: "/login" },
        { icon: "fas fa-user-plus", label: "Register", path: "/register" }
      ];
  
  // Build navigation items
  let navItems: NavItem[] = [...publicNavItems, ...userNavItems];
  
  // Always add admin as its own icon if admin, otherwise add the auth item
  if (user && isAdmin) {
    navItems.push({ icon: "fas fa-shield-alt", label: "Admin", path: "/admin" } as NavItem);
  } 
  
  // Always add login/register/profile items
  navItems = [...navItems, ...authNavItems];

  const isActive = (path: string) => location === path;

  return (
    <>
      <Sheet open={isCompetitionsOpen} onOpenChange={setIsCompetitionsOpen}>
        <SheetContent side="bottom" className="bg-black border-t border-gray-800 rounded-t-xl px-0">
          <SheetHeader className="px-4 pb-2">
            <SheetTitle className="text-cyan-400 text-lg">Competition Categories</SheetTitle>
            <SheetDescription className="text-gray-400 text-sm">
              Browse competitions by category
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-1 p-4 pt-2">
            {competitionCategories.map((category) => (
              <Link key={category.id} href={category.path} onClick={() => setIsCompetitionsOpen(false)}>
                <div className="py-3 px-4 flex items-center space-x-3 bg-gray-900 hover:bg-gray-800 transition-colors rounded-lg cursor-pointer">
                  <span className={`w-2.5 h-2.5 rounded-full ${category.color} inline-block`}></span>
                  <span className="text-white">{category.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <div className="bg-black border-t border-gray-800 shadow-lg text-white w-full md:hidden fixed bottom-0 z-50 flex justify-around py-2 px-1">
        {navItems.map((item) => (
          <div key={item.path} className="cursor-pointer" onClick={item.hasSubmenu ? item.action : undefined}>
            {item.hasSubmenu ? (
              // For items with submenus
              <div className="flex flex-col items-center py-1 px-3 cursor-pointer hover:text-cyan-400 transition-colors">
                <i className={`${item.icon} text-gray-300 opacity-80 text-lg`}></i>
                <span className="text-xs mt-1 text-gray-300 opacity-80">{item.label}</span>
              </div>
            ) : (
              // For normal links
              <Link href={item.path}>
                {isActive(item.path) ? (
                  <div className="flex flex-col items-center">
                    <i className={`${item.icon} text-cyan-400 text-xl`}></i>
                    <span className="text-xs font-bold text-cyan-400 border-b-2 border-cyan-400 pb-1">{item.label}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-1 px-3 cursor-pointer hover:text-cyan-400 transition-colors">
                    <i className={`${item.icon} text-gray-300 opacity-80 text-lg`}></i>
                    <span className="text-xs mt-1 text-gray-300 opacity-80">{item.label}</span>
                  </div>
                )}
              </Link>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
