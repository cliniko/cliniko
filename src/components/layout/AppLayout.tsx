
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider } from "@/components/ui/sidebar";
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileNavigation from './MobileNavigation';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

const AppLayout = () => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-gray-50">
        {/* Left Sidebar - hidden on mobile */}
        <div className={isMobile ? 'hidden' : 'block'}>
          <LeftSidebar />
        </div>

        <div className="flex flex-col w-full">
          {/* Top header - visible on desktop and mobile */}
          <div className="bg-white border-b shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {isMobile && <MobileNavigation />}
              <div className="flex items-center space-x-4">
                <a href="/dashboard" className="text-gray-900 hover:text-sky-600 text-sm font-medium">Home</a>
                <a href="/consults" className="text-gray-900 hover:text-sky-600 text-sm font-medium">Charts</a>
                <a href="/patients" className="text-gray-900 hover:text-sky-600 text-sm font-medium">Forms</a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative rounded-full w-8 h-8 bg-sky-100 flex items-center justify-center text-sky-600">
                <span className="text-xs font-medium">MD</span>
              </div>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 p-4 lg:p-8">
            <div className="container mx-auto">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Right Sidebar - hidden on mobile */}
        <div className={isMobile ? 'hidden' : 'block'}>
          <RightSidebar />
        </div>

        {/* Bottom navigation for mobile */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-md">
            {/* Mobile navigation is handled by MobileNavigation component */}
          </div>
        )}
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
