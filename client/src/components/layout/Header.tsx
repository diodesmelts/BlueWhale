import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-900 to-indigo-800 shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center md:hidden">
            <button type="button" className="text-white" onClick={onMenuClick}>
              <i className="fas fa-bars text-xl"></i>
            </button>
            <div className="ml-3 flex items-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6H16V4C16 2.89 15.11 2 14 2H10C8.89 2 8 2.89 8 4V6H6C4.89 6 4 6.89 4 8V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8C20 6.89 19.11 6 18 6ZM10 4H14V6H10V4ZM12 19L8 15L9.41 13.59L11 15.17L14.59 11.59L16 13L12 19Z" fill="white"/>
              </svg>
              <h1 className="text-white text-lg font-semibold ml-1">CompetePro</h1>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-white/70"></i>
                </div>
                <Input
                  className="block w-full pl-10 pr-3 py-2 border border-indigo-300/30 rounded-lg bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-300 sm:text-sm text-white placeholder-white/70"
                  placeholder="Search prize competitions..."
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <button className="flex-shrink-0 bg-white/10 backdrop-blur-sm p-1.5 rounded-full text-white hover:bg-white/20 focus:outline-none relative mr-4">
              <i className="fas fa-bell text-xl"></i>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#DB1F1F]"></span>
            </button>
            <div className="flex items-center">
              <Avatar className="h-8 w-8 bg-cyan-600 text-white border-2 border-white">
                <span className="text-sm">JS</span>
              </Avatar>
              <span className="ml-2 text-sm font-medium text-white hidden md:block">John Smith</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
