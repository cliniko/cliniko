import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ChevronDown, 
  FileText, 
  Users, 
  UserCog,
  Activity,
  LogOut,
  ChevronsUpDown,
  Menu
} from 'lucide-react';

// shadcn components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href?: string;
  icon?: React.ElementType;
  isActive?: boolean;
}

interface ClinicSidebarProps {
  clinic: {
    name: string;
    role: string;
    avatar?: string;
  };
  user: {
    name: string;
    email?: string;
    avatar?: string;
  };
}

export function DocsSidebar({ clinic, user }: ClinicSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const mainNavItems: NavItem[] = [
    { title: 'Consults', href: '/consults', icon: FileText, isActive: true },
    { title: 'Patient List', href: '/patients', icon: Users },
    { title: 'User Management', href: '/users', icon: UserCog },
    { title: 'Vital Signs Monitoring', href: '/vitals', icon: Activity },
  ];

  const filteredNavItems = searchQuery
    ? mainNavItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mainNavItems;

  // Desktop sidebar
  const DesktopSidebar = (
    <aside className="hidden md:flex h-svh w-[280px] flex-col border-r bg-background">
      {/* Clinic header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Avatar className="size-10 rounded-full bg-primary/10">
          {clinic.avatar ? (
            <AvatarImage src={clinic.avatar} alt={clinic.name} />
          ) : (
            <AvatarFallback className="text-primary">
              {clinic.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-primary">{clinic.name}</h2>
          <p className="text-sm text-muted-foreground">{clinic.role}</p>
        </div>
        <Button size="icon" variant="ghost" className="ml-auto">
          <ChevronsUpDown className="size-4" />
        </Button>
      </div>
      
      {/* Search box - optional for the clinic sidebar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Main navigation */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <nav className="space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.title}
                to={item.href || '#'}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  item.isActive 
                    ? "bg-primary-foreground text-primary" 
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.icon && <item.icon className="size-5" />}
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </ScrollArea>

      {/* User section */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : (
              <AvatarFallback>
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <h3 className="text-sm font-medium">{user.name}</h3>
            {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );

  // Mobile sidebar
  const MobileSidebar = (
    <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="flex h-full flex-col">
          {/* Clinic header */}
          <div className="flex items-center gap-3 p-4 border-b">
            <Avatar className="size-10 rounded-full bg-primary/10">
              {clinic.avatar ? (
                <AvatarImage src={clinic.avatar} alt={clinic.name} />
              ) : (
                <AvatarFallback className="text-primary">
                  {clinic.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-primary">{clinic.name}</h2>
              <p className="text-sm text-muted-foreground">{clinic.role}</p>
            </div>
          </div>
          
          {/* Search box - optional */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Main navigation */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              <nav className="space-y-1">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.href || '#'}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      item.isActive 
                        ? "bg-primary-foreground text-primary" 
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    {item.icon && <item.icon className="size-5" />}
                    <span>{item.title}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </ScrollArea>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback>
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col">
                  <h3 className="text-sm font-medium">{user.name}</h3>
                  {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <LogOut className="size-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      {DesktopSidebar}
      {MobileSidebar}
    </>
  );
} 