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
  X,
  Brain,
  Upload,
  ImageIcon,
  Camera,
  CalendarPlus
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from '@/context/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from '@/context/SidebarContext';
import { useMobileSidebar } from '@/context/MobileSidebarContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { logout, currentUser } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [organizationLogo, setOrganizationLogo] = useState("https://cdn.brandfetch.io/idhyZpEVXV/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B");
  const { toast } = useToast();
  
  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin';
  
  // Fetch organization logo on component mount
  useEffect(() => {
    const fetchOrganizationLogo = async () => {
      try {
        // This is a placeholder - replace with actual API call to get org settings
        // const { data, error } = await supabase
        //   .from('organization_settings')
        //   .select('logo_url')
        //   .single();
        
        // if (error) throw error;
        // if (data?.logo_url) {
        //   setOrganizationLogo(data.logo_url);
        // }
        
        // For now, we'll use the default logo
      } catch (error) {
        console.error('Error fetching organization logo:', error);
      }
    };
    
    fetchOrganizationLogo();
  }, []);
  
  // Reset file input and preview when dialog closes
  useEffect(() => {
    if (!isLogoDialogOpen) {
      setLogoFile(null);
      setLogoPreview(null);
    }
  }, [isLogoDialogOpen]);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Preview the selected image
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setLogoFile(file);
  };
  
  // Upload logo to storage
  const handleUploadLogo = async () => {
    if (!logoFile || !isAdmin) return;
    
    try {
      setIsUploading(true);
      
      // Create a unique filename using current timestamp
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `org-logo-${Date.now()}.${fileExt}`;
      const filePath = `organization/logos/${fileName}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, logoFile);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);
        
      // Update organization logo in settings table or similar
      // This is a placeholder - implement based on your database schema
      // const { error: updateError } = await supabase
      //   .from('organization_settings')
      //   .update({ logo_url: data.publicUrl })
      //   .eq('id', 1);
      
      // if (updateError) throw updateError;
      
      // Update local state with new logo
      setOrganizationLogo(data.publicUrl);
      
      toast({
        title: "Logo updated",
        description: "Organization logo has been updated successfully.",
      });
      
      setIsLogoDialogOpen(false);
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload organization logo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

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
    { title: 'Patient List', href: '/patients', icon: Users },
    { title: 'Consults', href: '/consults', icon: FileText },
    { title: 'Appointments', href: '/appointments', icon: CalendarPlus },
    { title: 'User Management', href: '/users', icon: UserCog },
    { title: 'AI Notes (Beta)', href: '/ai-notes', icon: Brain },
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
      <div className="p-3 lg:p-4 flex items-center border-b relative">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="size-8 lg:size-10 shrink-0 flex items-center justify-center bg-muted rounded-md relative group">
            <img 
              src={organizationLogo} 
              alt="Organization Logo" 
              className="w-full h-full object-contain p-1.5"
            />
            {isAdmin && (
              <button 
                className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md"
                onClick={() => setIsLogoDialogOpen(true)}
                title="Change logo"
              >
                <Camera className="text-white h-5 w-5" />
              </button>
            )}
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
              ? "absolute top-[24px] right-[-12px] h-5 w-5 bg-background border border-border rounded-full shadow-sm" 
              : "ml-auto h-6 w-6 lg:h-7 lg:w-7 rounded-md hover:bg-accent"
          )}
          onClick={toggleCollapsed}
          data-sidebar="trigger"
        >
          <PanelLeft className={cn("size-3 lg:size-3.5", isCollapsed && "rotate-180")} />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
      </div>

      {/* Logo Upload Dialog */}
      <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Organization Logo</DialogTitle>
            <DialogDescription>
              Upload a new logo for your organization. The logo will be displayed in the sidebar and other areas of the application.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-32 h-32 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="logo" className="text-sm font-medium">Logo Image</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended size: 512x512px. Max file size: 2MB.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUploadLogo} disabled={!logoFile || isUploading}>
              {isUploading ? (
                <>
                  <span className="mr-2">Uploading...</span>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <div className="size-9 shrink-0 flex items-center justify-center relative group">
              <img 
                src={organizationLogo} 
                alt="Organization Logo" 
                className="w-full h-full object-contain"
              />
              {isAdmin && (
                <button 
                  className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md"
                  onClick={() => setIsLogoDialogOpen(true)}
                  title="Change logo"
                >
                  <Camera className="text-white h-5 w-5" />
                </button>
              )}
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