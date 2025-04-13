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
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-6 h-6 text-white"
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
              <div className="ml-1 flex flex-col">
                <h1 className="text-white text-lg font-semibold leading-tight">Blue Whale</h1>
                <h2 className="text-blue-200 text-xs leading-tight">Competitions</h2>
              </div>
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
