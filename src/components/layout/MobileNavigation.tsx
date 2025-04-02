
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface NavLink {
  href: string;
  label: string;
  roles?: string[];
}

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [open, setOpen] = React.useState(false);
  
  const navLinks: NavLink[] = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/patients', label: 'Patients', roles: ['admin', 'doctor', 'nurse', 'staff'] },
    { href: '/consults', label: 'Consultations', roles: ['admin', 'doctor', 'nurse'] },
    { href: '/vitals', label: 'Vital Signs', roles: ['admin', 'doctor', 'nurse'] },
    { href: '/users', label: 'Users', roles: ['admin'] },
  ];

  const handleNavigation = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  const isLinkVisible = (link: NavLink) => {
    if (!link.roles) return true;
    return currentUser && link.roles.includes(currentUser.role);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon" className="h-9 w-9 mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-lg">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <nav className="flex-1 overflow-auto">
            <ul className="py-2">
              {navLinks.filter(isLinkVisible).map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNavigation(link.href)}
                    className={cn(
                      "flex items-center w-full px-4 py-3 text-left hover:bg-gray-100",
                      location.pathname === link.href && "bg-gray-100 font-medium"
                    )}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
