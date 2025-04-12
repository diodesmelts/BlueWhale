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
      case "red": return "from-rose-500 to-rose-400";
      case "green": return "from-emerald-500 to-teal-400";
      case "yellow": return "from-amber-400 to-yellow-300";
      case "navy": 
      case "purple": return "from-indigo-500 to-violet-400";
      default: return "from-rose-500 to-pink-400";
    }
  };

  const getIconBgClass = () => {
    switch (iconColor) {
      case "red": return "bg-rose-100 text-rose-600";
      case "green": return "bg-emerald-100 text-emerald-600";
      case "yellow": return "bg-amber-100 text-amber-600";
      case "navy": return "bg-indigo-100 text-indigo-600";
      case "purple": return "bg-violet-100 text-violet-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className={`rounded-xl overflow-hidden shadow-md bg-gradient-to-br ${getGradientClass()} text-white`}>
      <div className="p-4">
        <div className="flex items-center">
          <div className={`rounded-full ${getIconBgClass()} p-3 flex items-center justify-center h-12 w-12`}>
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium opacity-90">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
