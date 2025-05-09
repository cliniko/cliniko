import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider } from "@/components/ui/sidebar";
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileNavigation from './MobileNavigation';

const AppLayout = () => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-gray-50">
        {/* Only show mobile navigation on mobile */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm p-2">
            <MobileNavigation />
          </div>
        )}

        {/* Left Sidebar - hidden on mobile */}
        <div className={isMobile ? 'hidden' : 'block'}>
          <LeftSidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 px-4 pt-4 pb-20">
          <div className={`container mx-auto ${isMobile ? 'mt-16' : ''}`}>
            <Outlet />
          </div>
        </main>

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
