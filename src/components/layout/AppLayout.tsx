
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  ClipboardList, 
  UsersRound, 
  UserCog, 
  Activity, 
  LogOut, 
  Menu, 
  X,
  User,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const AppLayout = () => {
  const { logout, currentUser } = useAuth();
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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser?.name) return 'U';
    return currentUser.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
        } ${isMobile ? 'w-64' : 'w-64'} flex flex-col border-r shadow-md`}
      >
        <div className="p-4 border-b flex items-center space-x-2">
          <Avatar className="h-8 w-8 bg-medical-primary text-white">
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <Link to="/dashboard" className="text-medical-primary text-lg font-bold">
              Clinic Health Data
            </Link>
            {currentUser && (
              <span className="text-xs text-gray-500">{currentUser.role}</span>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link 
            to="/consults" 
            className={`flex items-center p-3 rounded-md transition-colors ${
              isActive('/consults') 
                ? 'bg-sidebar-accent text-medical-primary font-medium' 
                : 'hover:bg-sidebar-accent/50'
            }`}
            onClick={closeSidebarIfMobile}
          >
            <ClipboardList className="mr-3 h-5 w-5" />
            <span>Consults</span>
          </Link>
          
          <Link 
            to="/patients" 
            className={`flex items-center p-3 rounded-md transition-colors ${
              isActive('/patients') 
                ? 'bg-sidebar-accent text-medical-primary font-medium' 
                : 'hover:bg-sidebar-accent/50'
            }`}
            onClick={closeSidebarIfMobile}
          >
            <UsersRound className="mr-3 h-5 w-5" />
            <span>Patient List</span>
          </Link>
          
          <Link 
            to="/users" 
            className={`flex items-center p-3 rounded-md transition-colors ${
              isActive('/users') 
                ? 'bg-sidebar-accent text-medical-primary font-medium' 
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
                ? 'bg-sidebar-accent text-medical-primary font-medium' 
                : 'hover:bg-sidebar-accent/50'
            }`}
            onClick={closeSidebarIfMobile}
          >
            <Activity className="mr-3 h-5 w-5" />
            <span>Vital Signs Monitoring</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2 mb-3 p-2 rounded-md bg-gray-50">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700 truncate">{currentUser?.name}</span>
          </div>
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
      } bg-gray-50`}>
        <div className="container mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
