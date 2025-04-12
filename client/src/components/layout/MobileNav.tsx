import { Link, useLocation } from "wouter";

export default function MobileNav() {
  const [location] = useLocation();
  
  const navItems = [
    { icon: "fas fa-home", label: "Home", path: "/" },
    { icon: "fas fa-trophy", label: "Competitions", path: "/competitions" },
    { icon: "fas fa-clipboard-check", label: "Entries", path: "/my-entries" },
    { icon: "fas fa-medal", label: "Wins", path: "/my-wins" },
    { icon: "fas fa-user", label: "Profile", path: "/profile" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <div className="bg-[#153B84] text-white w-full md:hidden fixed bottom-0 z-50 flex justify-around py-3">
      {navItems.map((item) => (
        <Link key={item.path} href={item.path}>
          <a className="flex flex-col items-center">
            <i className={`${item.icon} ${isActive(item.path) ? "text-[#FFF13A]" : ""}`}></i>
            <span className="text-xs mt-1">{item.label}</span>
          </a>
        </Link>
      ))}
    </div>
  );
}
