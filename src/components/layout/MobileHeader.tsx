import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { useMobileSidebar } from "@/context/MobileSidebarContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function MobileHeader() {
  const { setMobileSidebarOpen } = useMobileSidebar();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[60px] border-b bg-background flex items-center justify-between px-4 md:hidden">
      <button 
        data-slot="sidebar-trigger"
        data-sidebar="trigger"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-7 -ml-1.5"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <PanelLeft />
        <span className="sr-only">Toggle Sidebar</span>
      </button>
      
      <ThemeToggle className="h-8 w-8" />
    </div>
  );
} 