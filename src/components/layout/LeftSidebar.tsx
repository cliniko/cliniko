
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  FileText, 
  Activity, 
  Settings, 
  Search,
  Layers,
  Inbox,
  Calendar,
  CheckSquare
} from 'lucide-react';
import { Input } from "@/components/ui/input";

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
          <span className="font-semibold">A</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">Acme Inc</span>
          <span className="text-xs text-muted-foreground">Enterprise</span>
        </div>
      </div>
      
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search the docs..."
            className="w-full bg-background pl-8 text-sm"
          />
        </div>
      </div>
      
      <div className="mt-2">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
            Platform
          </h2>
          <div className="space-y-1">
            <Link
              to="#"
              className="group flex items-center justify-between rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4" />
                <span>Playground</span>
              </div>
            </Link>
            <Link
              to="#"
              className="group flex items-center justify-between rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="h-4 w-4" />
                <span>Models</span>
              </div>
            </Link>
            <Link
              to="#"
              className="group flex items-center justify-between rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4" />
                <span>Documentation</span>
              </div>
            </Link>
            <Link
              to="#"
              className="group flex items-center justify-between rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
            Components
          </h2>
          <div className="space-y-1">
            {/* Map through our main navigation items */}
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  location.pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
              </Link>
            ))}
          </div>
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
