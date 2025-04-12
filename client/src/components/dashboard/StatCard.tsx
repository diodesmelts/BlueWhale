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
  
  const getBorderClass = () => {
    switch (iconColor) {
      case "red": return "border-rose-500";
      case "green": return "border-emerald-500";
      case "yellow": return "border-amber-400";
      case "navy": return "border-indigo-500";
      case "purple": return "border-violet-500";
      default: return "border-rose-500";
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
    <div className={`bg-white rounded-xl shadow-md border-t-4 ${getBorderClass()} overflow-hidden`}>
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${getGradientClass()} text-white shadow-md`}>
            {icon}
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-600 font-medium">{title}</div>
          </div>
        </div>
        
        {/* Trend indicator */}
        <div className="mt-4 pt-2 border-t border-gray-100 flex items-center">
          <span className="text-xs font-medium bg-green-100 text-green-800 rounded-full py-1 px-2 flex items-center">
            <i className="fas fa-arrow-up mr-1"></i> 12% from last week
          </span>
        </div>
      </div>
    </div>
  );
}
