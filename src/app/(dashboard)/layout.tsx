import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-[80px] lg:w-[280px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg min-h-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <Image 
              src="/logo.png" 
              alt="BIU School Management System Logo" 
              width={40} 
              height={40}
              className="transition-transform group-hover:scale-105" 
            />
            <span className="hidden lg:block text-xl font-bold text-gray-800 dark:text-gray-100">BIU</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <Menu />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-h-0">
          <div className="max-w-7xl mx-auto min-h-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
