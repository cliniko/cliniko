import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { useMobileSidebar } from "@/context/MobileSidebarContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/AuthContext";

export function MobileHeader() {
  const { setMobileSidebarOpen } = useMobileSidebar();
  const { currentUser } = useAuth();

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
      
      <div className="flex items-center">
        <ThemeToggle className="h-8 w-8" />
      </div>
    </div>
  );
} 