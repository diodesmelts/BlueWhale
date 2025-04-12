import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  iconColor: string;
  title: string;
  value: string | number;
}

export default function StatCard({ icon, iconColor, title, value }: StatCardProps) {
  const getGradientClass = () => {
    switch (iconColor) {
      case "red": return "from-rose-500 to-pink-600";
      case "green": return "from-emerald-500 to-teal-600";
      case "yellow": return "from-amber-400 to-orange-500";
      case "navy": return "from-indigo-500 to-blue-600";
      case "purple": return "from-violet-500 to-purple-600";
      default: return "from-rose-500 to-pink-600";
    }
  };

  const getIconClasses = () => {
    switch (iconColor) {
      case "red": return "bg-white/20 text-white";
      case "green": return "bg-white/20 text-white";
      case "yellow": return "bg-white/20 text-white";
      case "navy": return "bg-white/20 text-white";
      case "purple": return "bg-white/20 text-white";
      default: return "bg-white/20 text-white";
    }
  };
  
  const getBackgroundPattern = () => {
    switch (iconColor) {
      case "red": return "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.13) 0%, transparent 20%)";
      case "green": return "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.13) 0%, transparent 20%)";
      case "yellow": return "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.13) 0%, transparent 20%)";
      case "navy": return "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.13) 0%, transparent 20%)";
      default: return "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.13) 0%, transparent 20%)";
    }
  };

  return (
    <div 
      className={`rounded-xl overflow-hidden shadow-md bg-gradient-to-br ${getGradientClass()} text-white relative`}
      style={{ 
        backgroundImage: getBackgroundPattern() 
      }}
    >
      {/* Decorative elements */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-3xl opacity-30"></div>
      
      <div className="p-5 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          <div className={`rounded-full ${getIconClasses()} p-3 flex items-center justify-center h-12 w-12 shadow-lg`}>
            {icon}
          </div>
        </div>
        
        {/* Trend indicator */}
        <div className="mt-4 pt-2 border-t border-white/10 flex items-center">
          <span className="text-xs font-medium bg-white/20 rounded-full py-1 px-2 flex items-center">
            <i className="fas fa-arrow-up mr-1"></i> 12% from last week
          </span>
        </div>
      </div>
    </div>
  );
}
