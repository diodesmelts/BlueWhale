import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  iconColor: string;
  title: string;
  value: string | number;
}

export default function StatCard({ icon, iconColor, title, value }: StatCardProps) {
  const getBgColorClass = () => {
    switch (iconColor) {
      case "red": return "bg-[#DB1F1F] bg-opacity-10";
      case "green": return "bg-[#7ED957] bg-opacity-10";
      case "yellow": return "bg-[#FFF13A] bg-opacity-10";
      case "navy": return "bg-[#153B84] bg-opacity-10";
      default: return "bg-gray-100";
    }
  };

  const getTextColorClass = () => {
    switch (iconColor) {
      case "red": return "text-[#DB1F1F]";
      case "green": return "text-[#7ED957]";
      case "yellow": return "text-[#FFF13A]";
      case "navy": return "text-[#153B84]";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`rounded-full ${getBgColorClass()} p-3`}>
          <div className={getTextColorClass()}>{icon}</div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-semibold text-[#153B84]">{value}</h3>
        </div>
      </div>
    </div>
  );
}
