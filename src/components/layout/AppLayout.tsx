import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';
import { useEffect, useState, lazy, Suspense } from 'react';
import { SkipToContent } from '@/components/ui/skip-to-content';

// Create a loading fallback for the main content
const ContentLoader = () => (
  <div className="flex items-center justify-center h-[200px] w-full">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const AppLayout = () => {
  const { isCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  // Handle window resize events and check user preferences
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    
    // Handle resizing
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    mediaQuery.addEventListener('change', handleReducedMotionChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to content link for keyboard users */}
      <SkipToContent />

      {/* Sidebar - rendered outside main content flow */}
      <Sidebar />
      
      {/* Mobile-only header */}
      <MobileHeader />

      {/* Main content */}
      <main 
        id="main-content"
        className={cn(
          "min-h-screen",
          isReducedMotion ? "" : "transition-all duration-300 ease-in-out",
          isMobile 
            ? "mt-[60px] ml-0 pb-16" // Added bottom padding for mobile navigation
            : (isCollapsed ? "ml-[70px] lg:ml-[70px]" : "ml-[250px] lg:ml-[280px]")
        )}
      >
        <div 
          className={cn(
            "p-3 sm:p-4 md:p-6 lg:p-8",
            "max-w-7xl mx-auto" // Constrain maximum width for better readability on large screens
          )}
        >
          <Suspense fallback={<ContentLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
