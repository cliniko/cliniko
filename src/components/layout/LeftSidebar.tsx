
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  FileText, 
  Activity,
} from 'lucide-react';

const LeftSidebar = () => {
  const location = useLocation();
  
  const mainNavItems = [
    {
      title: 'Dashboard',
      icon: Home,
      href: '/dashboard',
      roles: ['admin', 'doctor', 'nurse', 'staff']
    },
    {
      title: 'Patients',
      icon: Users,
      href: '/patients',
      roles: ['admin', 'doctor', 'nurse', 'staff']
    },
    {
      title: 'Consults',
      icon: FileText,
      href: '/consults',
      roles: ['admin', 'doctor', 'nurse']
    },
    {
      title: 'Vitals',
      icon: Activity,
      href: '/vitals',
      roles: ['admin', 'doctor', 'nurse']
    },
    {
      title: 'Users',
      icon: Users,
      href: '/users',
      roles: ['admin']
    }
  ];

  return (
    <div className="h-screen border-r bg-white w-64 flex flex-col overflow-y-auto">
      <div className="p-4 border-b flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-white">
          <span className="font-semibold">H</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">Holcim</span>
          <span className="text-xs text-muted-foreground">Enterprise</span>
        </div>
      </div>
      
      <div className="mt-6 px-3">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors",
                location.pathname === item.href 
                  ? "bg-sky-50 text-sky-700" 
                  : "text-gray-900 hover:bg-sky-50 hover:text-sky-700"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
            <span className="text-xs font-medium text-sky-700">MD</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">shadcn</span>
            <span className="text-xs text-muted-foreground">m@example.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
