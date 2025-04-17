import { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

interface StaticPageLayoutProps {
  title: string;
  children: ReactNode;
  gradientColors?: string;
}

export default function StaticPageLayout({ 
  title, 
  children,
  gradientColors = "from-blue-600 to-cyan-500" 
}: StaticPageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className={`bg-gradient-to-r ${gradientColors} py-16`}>
        <div className="container mx-auto px-4">
          <Link href="/">
            <a className="inline-flex items-center text-white mb-6 hover:underline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Back to home</span>
            </a>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 md:p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}