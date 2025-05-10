import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const AppLayout = () => {
  const { isCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Handle window resize events
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - rendered outside main content flow */}
      <Sidebar />
      
      {/* Mobile-only header */}
      <MobileHeader />
      
      {/* Main content */}
      <main 
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          isMobile 
            ? "mt-[60px] ml-0" // Top margin for mobile header, no left margin
            : (isCollapsed ? "ml-[70px] lg:ml-[70px]" : "ml-[250px] lg:ml-[280px]")
        )}
      >
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
