import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, Home, Users, ClipboardList, UserCog, Activity, Brain, LogOut, CalendarPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  ariaLabel?: string; // For i18n and accessibility
}

const navItems: NavItem[] = [
  { 
    label: 'Dashboard', 
    href: '/dashboard', 
    icon: Home, 
    ariaLabel: 'Navigate to dashboard' 
  },
  { 
    label: 'Patients', 
    href: '/patients', 
    icon: Users, 
    ariaLabel: 'View and manage patients' 
  },
  { 
    label: 'Consults', 
    href: '/consults', 
    icon: ClipboardList, 
    roles: ['admin', 'doctor', 'nurse'],
    ariaLabel: 'Access consultations' 
  },
  { 
    label: 'Appointments', 
    href: '/appointments', 
    icon: CalendarPlus,
    ariaLabel: 'Manage appointments' 
  },
  { 
    label: 'AI Notes', 
    href: '/ai-notes', 
    icon: Brain, 
    roles: ['admin', 'doctor', 'nurse'],
    ariaLabel: 'Access AI-assisted clinical notes' 
  },
  { 
    label: 'Users', 
    href: '/users', 
    icon: UserCog, 
    roles: ['admin'],
    ariaLabel: 'Manage system users' 
  },
];

const MobileNavigation = () => {
  const [open, setOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();

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

  // Get color for user role
  const getRoleColor = () => {
    if (!currentUser) return 'medical-gray';
    switch (currentUser.role) {
      case 'admin': return 'medical-admin';
      case 'doctor': return 'medical-doctor';
      case 'nurse': return 'medical-nurse';
      default: return 'medical-staff';
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="z-50 h-10 w-10 hover:bg-gray-100 active:scale-95 transition-all dark:hover:bg-gray-800"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="h-[90vh] rounded-t-xl px-0">
        <DrawerHeader className="px-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-bold text-medical-doctor">
              Cliniko Health
            </DrawerTitle>
            
            <DrawerClose asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        
        {currentUser && (
          <div className="mx-4 px-4 py-3 rounded-lg bg-muted/40 flex items-center space-x-3">
            <Avatar className="h-10 w-10 border-2 border-current" style={{ borderColor: `var(--${getRoleColor()})` }}>
              <AvatarFallback style={{ backgroundColor: `var(--${getRoleColor()})` }} className="text-white">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{currentUser.name}</span>
              <span className="text-xs capitalize text-muted-foreground">{currentUser.role}</span>
            </div>
          </div>
        )}
        
        <Separator className="my-4" />
        
        <div className="px-2 overflow-y-auto flex-1">
          <nav aria-label="Main Navigation">
            <ul className="space-y-1 p-2">
              {navItems.filter(canAccess).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      onClick={handleNavClick}
                      aria-label={item.ariaLabel}
                      aria-current={isActive ? 'page' : undefined}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                          "min-h-[44px]", // Minimum touch target size
                          isActive
                            ? `bg-${getRoleColor()}/10 text-${getRoleColor()}`
                            : "hover:bg-muted"
                        )
                      }
                    >
                      <item.icon className={cn(
                        "h-5 w-5",
                        isActive ? `text-${getRoleColor()}` : "text-muted-foreground"
                      )} aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        
        <DrawerFooter className="px-4 pt-0">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 font-normal text-muted-foreground min-h-[44px]" 
            onClick={() => {
              setOpen(false);
              logout();
            }}
            aria-label="Sign out of your account"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Sign Out
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileNavigation;
