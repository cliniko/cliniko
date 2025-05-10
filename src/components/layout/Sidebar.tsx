import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  UserCog,
  Activity,
  LogOut,
  Home,
  Menu,
  PanelLeft,
  X
} from 'lucide-react';

// shadcn components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/custom-sheet";
import { cn } from "@/lib/utils";
import { useAuth } from '@/context/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from '@/context/SidebarContext';
import { useMobileSidebar } from '@/context/MobileSidebarContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

export function Sidebar() {
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const { isMobileSidebarOpen, setMobileSidebarOpen } = useMobileSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize events
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      
      // Auto collapse sidebar on smaller screens
      if (window.innerWidth < 1024 && !isCollapsed) {
        toggleCollapsed();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed, toggleCollapsed]);

  const navItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: Home },
    { title: 'Consults', href: '/consults', icon: FileText },
    { title: 'Patient List', href: '/patients', icon: Users },
    { title: 'User Management', href: '/users', icon: UserCog },
    { title: 'Vital Signs Monitoring', href: '/vitals', icon: Activity },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Desktop sidebar
  const DesktopSidebar = (
    <aside 
      className={cn(
        "fixed top-0 left-0 z-40 h-full hidden md:flex flex-col border-r bg-background text-foreground transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-[250px] lg:w-[280px]"
      )}
    >
      {/* Organization header */}
      <div className="flex items-center justify-between p-3 lg:p-4 border-b h-[64px] lg:h-[72px] bg-card">
        <div className="flex items-center">
          <div className="size-8 lg:size-10 shrink-0 flex items-center justify-center bg-muted rounded-md">
            <img 
              src="https://cdn.brandfetch.io/idhyZpEVXV/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B" 
              alt="Holcim Logo" 
              className="w-full h-full object-contain p-1.5"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col ml-2 lg:ml-3">
              <h2 className="text-base lg:text-lg font-semibold truncate text-foreground">Holcim Inc</h2>
              <p className="text-xs lg:text-sm text-muted-foreground truncate">Enterprise</p>
            </div>
          )}
        </div>
        
        <button 
          className={cn(
            "inline-flex items-center justify-center text-sm transition-all outline-none hover:text-foreground text-muted-foreground",
            isCollapsed 
              ? "absolute top-[24px] right-[-10px] h-5 w-5 bg-background border border-border rounded-full shadow-sm" 
              : "h-6 w-6 lg:h-7 lg:w-7 rounded-md hover:bg-accent"
          )}
          onClick={toggleCollapsed}
          data-sidebar="trigger"
        >
          <PanelLeft className={cn("size-3 lg:size-3.5", isCollapsed && "rotate-180")} />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
      </div>

      {/* Main navigation */}
      <ScrollArea className="flex-1">
        <div className="p-2.5 lg:p-4">
          <nav className="space-y-1 lg:space-y-1.5">
            {navItems.map((item) => (
              <TooltipProvider key={item.href} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center gap-2 lg:gap-3 rounded-md px-2.5 lg:px-3 py-2 lg:py-2.5 text-xs lg:text-sm font-medium transition-all",
                        location.pathname === item.href
                          ? "bg-accent text-primary shadow-sm" 
                          : "text-foreground/80 hover:bg-accent/50 hover:text-foreground",
                        isCollapsed && "justify-center"
                      )}
                    >
                      <item.icon className={cn(
                        "size-4 lg:size-5 shrink-0",
                        location.pathname === item.href ? "text-primary" : "text-foreground/70"
                      )} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      {item.title}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </nav>
        </div>
      </ScrollArea>

      {/* User section */}
      <div className="border-t p-3 lg:p-4 bg-card">
        <div className="flex flex-col space-y-2 lg:space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-3">
              <Avatar className="size-7 lg:size-8 shrink-0 border-2 border-primary/20">
                <AvatarFallback className="bg-muted text-primary text-xs lg:text-sm">
                  {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <h3 className="text-xs lg:text-sm font-medium truncate text-foreground">{currentUser?.name || 'User'}</h3>
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-7 lg:size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="size-3.5 lg:size-4" />
            </Button>
          </div>
          
          {/* Theme and logout controls */}
          {!isCollapsed && (
            <div className="flex items-center justify-between mt-1 pt-2 border-t border-border/50">
              <span className="text-[10px] lg:text-xs text-muted-foreground">Theme</span>
              <ThemeToggle className={isMobile ? "h-7 w-7" : "h-8 w-8"} />
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  // Mobile sidebar
  const MobileSidebar = (
    <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50 md:hidden hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-[280px] p-0 bg-background text-foreground">
        <div className="flex h-full flex-col">
          {/* Organization header - simplified without buttons */}
          <div className="flex items-center p-4 border-b">
            <div className="size-9 shrink-0 flex items-center justify-center">
              <img 
                src="https://cdn.brandfetch.io/idhyZpEVXV/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B" 
                alt="Holcim Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col ml-3">
              <h2 className="text-base font-semibold">Holcim Inc</h2>
              <p className="text-xs text-muted-foreground">Enterprise</p>
            </div>
          </div>

          {/* Main navigation */}
          <ScrollArea className="flex-1">
            <div className="p-3">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-all",
                      location.pathname === item.href
                        ? "bg-accent text-primary shadow-sm" 
                        : "text-foreground/80 hover:bg-accent/50 hover:text-foreground"
                    )}
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <item.icon className={cn(
                      "size-4",
                      location.pathname === item.href ? "text-primary" : "text-foreground/70"
                    )} />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </ScrollArea>

          {/* User section */}
          <div className="border-t p-3">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-muted text-primary text-xs">
                      {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <h3 className="text-xs font-medium">{currentUser?.name || 'User'}</h3>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center gap-1"
                  onClick={() => {
                    handleLogout();
                    setMobileSidebarOpen(false);
                  }}
                >
                  <LogOut className="size-3.5" />
                  <span>Sign Out</span>
                </Button>
              </div>
              
              {/* Theme toggle for mobile */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Theme</span>
                <ThemeToggle className="h-7 w-7" />
              </div>
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