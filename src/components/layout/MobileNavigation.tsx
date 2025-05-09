
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Home, Users, ClipboardList, UserCog, Activity, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const MobileNavigation = () => {
  const { logout, currentUser } = useAuth();
  
  const getUserInitials = () => {
    if (!currentUser?.name) return 'U';
    return currentUser.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const navItems = [
    { 
      label: 'Dashboard', 
      href: '/dashboard', 
      icon: Home,
      roles: [] // Empty means available to all
    },
    { 
      label: 'Patients', 
      href: '/patients', 
      icon: Users,
      roles: [] // Empty means available to all
    },
    { 
      label: 'Consults', 
      href: '/consults', 
      icon: ClipboardList, 
      roles: ['admin', 'doctor', 'nurse'] 
    },
    { 
      label: 'Vitals', 
      href: '/vitals', 
      icon: Activity, 
      roles: ['admin', 'doctor', 'nurse'] 
    },
    { 
      label: 'Users', 
      href: '/users', 
      icon: UserCog, 
      roles: ['admin'] 
    },
  ];

  const canAccess = (item: typeof navItems[0]) => {
    if (!item.roles || item.roles.length === 0) return true;
    return currentUser && item.roles.includes(currentUser.role);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 bg-sky-500 text-white">
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sky-900 font-medium text-sm">Clinic Health</span>
            {currentUser && (
              <span className="text-xs text-sky-600">{currentUser.name}</span>
            )}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-sky-600" 
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Sign Out</span>
        </Button>
      </div>
      <div className="flex justify-around px-1 py-2 border-t">
        {navItems.filter(canAccess).map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center rounded-md py-2 px-3 text-xs font-medium",
                isActive
                  ? "bg-sky-100 text-sky-600"
                  : "text-sky-800 hover:bg-sky-50"
              )
            }
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
