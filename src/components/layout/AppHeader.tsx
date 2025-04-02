
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User } from 'lucide-react';
import MobileNavigation from './MobileNavigation';

const AppHeader = () => {
  const { signOut, currentUser } = useAuth();
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <MobileNavigation />
          <Link to="/" className="flex items-center gap-1">
            <span className="font-bold text-xl text-medical-primary hidden md:block">Clinical Management</span>
            <span className="font-bold text-xl text-medical-primary md:hidden">CMS</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 text-sm">
            <User className="h-4 w-4" />
            <span className="font-medium">{currentUser?.name}</span>
            <span className="text-gray-500">({currentUser?.role})</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={signOut}
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
