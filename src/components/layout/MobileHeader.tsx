import { Button } from "@/components/ui/button";
import { PanelLeft, User } from "lucide-react";
import { useMobileSidebar } from "@/context/MobileSidebarContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function MobileHeader() {
  const { setMobileSidebarOpen } = useMobileSidebar();
  const { currentUser } = useAuth();

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
    <div className="fixed top-0 left-0 right-0 z-50 h-[60px] border-b bg-background flex items-center justify-between px-4 md:hidden">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Open sidebar</span>
        </Button>
        
        <span className="font-medium text-lg overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[170px]">
          Cliniko
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle className="h-8 w-8" />
        
        {currentUser && (
          <Avatar className={cn(
            "h-8 w-8 transition-all border-2",
            currentUser.role === 'admin' ? "border-medical-admin" :
            currentUser.role === 'doctor' ? "border-medical-doctor" :
            currentUser.role === 'nurse' ? "border-medical-nurse" :
            "border-medical-staff"
          )}>
            <AvatarFallback className={cn(
              currentUser.role === 'admin' ? "bg-medical-admin text-white" :
              currentUser.role === 'doctor' ? "bg-medical-doctor text-white" :
              currentUser.role === 'nurse' ? "bg-medical-nurse text-white" :
              "bg-medical-staff text-white"
            )}>
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
} 