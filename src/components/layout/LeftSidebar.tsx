
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  ClipboardList, 
  UsersRound, 
  UserCog, 
  Activity,
  Home,
  Search
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarRail
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const LeftSidebar = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
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
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarRail />
      
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 bg-sky-600 text-white">
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sky-950">Clinical Management</span>
            <span className="text-xs text-sky-700">{currentUser?.role}</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-sky-500" />
            <Input className="w-full pl-8 bg-white" placeholder="Search..." />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard" isActive={isActive('/dashboard')}>
                  <Link to="/dashboard">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Patients" isActive={isActive('/patients')}>
                  <Link to="/patients">
                    <UsersRound className="h-5 w-5" />
                    <span>Patient List</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {currentUser && ['admin', 'doctor', 'nurse'].includes(currentUser.role) && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Consults" isActive={isActive('/consults')}>
                      <Link to="/consults">
                        <ClipboardList className="h-5 w-5" />
                        <span>Consults</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Vitals" isActive={isActive('/vitals')}>
                      <Link to="/vitals">
                        <Activity className="h-5 w-5" />
                        <span>Vitals</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              {currentUser && currentUser.role === 'admin' && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Users" isActive={isActive('/users')}>
                    <Link to="/users">
                      <UserCog className="h-5 w-5" />
                      <span>Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-sky-600 text-white">
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{currentUser?.name}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default LeftSidebar;
