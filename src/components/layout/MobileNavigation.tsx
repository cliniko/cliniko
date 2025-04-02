
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/context/AuthContext';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  href: string;
  roles?: string[];
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Patients', href: '/patients' },
  { label: 'Consults', href: '/consults', roles: ['admin', 'doctor', 'nurse'] },
  { label: 'Vitals', href: '/vitals', roles: ['admin', 'doctor', 'nurse'] },
  { label: 'Users', href: '/users', roles: ['admin'] },
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="z-50">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="px-4 py-6 border-b">
          <SheetTitle className="text-xl text-medical-primary">Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col">
          {navItems.filter(canAccess).map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  "px-4 py-3 border-b text-base font-medium transition-colors",
                  isActive
                    ? "bg-medical-light text-medical-primary"
                    : "hover:bg-gray-50"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
