
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Clipboard, Users, UserCog, ActivitySquare, LogOut, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';

const AppLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebarIfMobile = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="fixed top-4 left-4 z-50"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      )}

      {/* Sidebar */}
      <div 
        className={`bg-sidebar fixed inset-y-0 left-0 z-40 transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isMobile ? 'w-64' : 'w-64'} flex flex-col border-r`}
      >
        <div className="p-4 border-b">
          <Link to="/dashboard" className="text-medical-primary text-xl font-bold">
            Clinic Health Data
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link 
            to="/consults" 
            className={`flex items-center p-3 rounded-md transition-colors ${
              isActive('/consults') 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                : 'hover:bg-sidebar-accent/50'
            }`}
            onClick={closeSidebarIfMobile}
          >
            <Clipboard className="mr-3 h-5 w-5" />
            <span>Consults</span>
          </Link>
          
          <Link 
            to="/patients" 
            className={`flex items-center p-3 rounded-md transition-colors ${
              isActive('/patients') 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                : 'hover:bg-sidebar-accent/50'
            }`}
            onClick={closeSidebarIfMobile}
          >
            <Users className="mr-3 h-5 w-5" />
            <span>Patient List</span>
          </Link>
          
          <Link 
            to="/users" 
            className={`flex items-center p-3 rounded-md transition-colors ${
              isActive('/users') 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                : 'hover:bg-sidebar-accent/50'
            }`}
            onClick={closeSidebarIfMobile}
          >
            <UserCog className="mr-3 h-5 w-5" />
            <span>User Management</span>
          </Link>
          
          <Link 
            to="/vitals" 
            className={`flex items-center p-3 rounded-md transition-colors ${
              isActive('/vitals') 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                : 'hover:bg-sidebar-accent/50'
            }`}
            onClick={closeSidebarIfMobile}
          >
            <ActivitySquare className="mr-3 h-5 w-5" />
            <span>Vital Signs Monitoring</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-medical-danger" 
            onClick={() => logout()}
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${
        sidebarOpen && !isMobile ? 'ml-64' : 'ml-0'
      }`}>
        <div className="container mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
