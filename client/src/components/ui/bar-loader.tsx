import { cn } from "@/lib/utils";

interface BarLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BarLoader({ className, size = "md", ...props }: BarLoaderProps) {
  const sizeClasses = {
    sm: "h-1 w-10",
    md: "h-1.5 w-16",
    lg: "h-2 w-20"
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700", 
        sizeClasses[size],
        className
      )} 
      {...props}
    >
      <div 
        className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 animate-bar-loading"
      />
    </div>
  );
}