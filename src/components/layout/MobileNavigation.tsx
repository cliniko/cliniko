
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, Home, Users, ClipboardList, UserCog, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Patients', href: '/patients', icon: Users },
  { label: 'Consults', href: '/consults', icon: ClipboardList, roles: ['admin', 'doctor', 'nurse'] },
  { label: 'Vitals', href: '/vitals', icon: Activity, roles: ['admin', 'doctor', 'nurse'] },
  { label: 'Users', href: '/users', icon: UserCog, roles: ['admin'] },
];

const MobileNavigation = () => {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();

  const canAccess = (item: NavItem) => {
    if (!item.roles || item.roles.length === 0) return true;
    return currentUser && item.roles.includes(currentUser.role);
  };

  const handleNavClick = () => {
    setOpen(false);
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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="z-50 hover:bg-gray-100 active:scale-95 transition-all dark:hover:bg-gray-800"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="h-[85vh] rounded-t-xl">
        <DrawerHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-bold text-medical-primary">
              Clinic Health Data
            </DrawerTitle>
            
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </DrawerClose>
          </div>
          
          {currentUser && (
            <div className="flex items-center space-x-2 mt-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800">
              <Avatar className="h-8 w-8 bg-medical-primary text-white">
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{currentUser.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</span>
              </div>
            </div>
          )}
        </DrawerHeader>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.filter(canAccess).map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                      isActive
                        ? "bg-medical-light text-medical-primary"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="mt-auto p-4 border-t">
          <Button 
            variant="destructive" 
            className="w-full justify-center" 
            onClick={() => {
              setOpen(false);
              if (currentUser) {
                // This assumes there's a logout function in the auth context
                // You would need to add this or handle it differently
                try {
                  // Handle logout
                } catch (error) {
                  console.error('Logout failed:', error);
                }
              }
            }}
          >
            Sign Out
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileNavigation;
