import { createContext, useState, useContext, ReactNode } from 'react';

interface MobileSidebarContextType {
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (isOpen: boolean) => void;
}

const MobileSidebarContext = createContext<MobileSidebarContextType | undefined>(undefined);

export function MobileSidebarProvider({ children }: { children: ReactNode }) {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <MobileSidebarContext.Provider value={{ isMobileSidebarOpen, setMobileSidebarOpen }}>
      {children}
    </MobileSidebarContext.Provider>
  );
}

export function useMobileSidebar() {
  const context = useContext(MobileSidebarContext);
  if (context === undefined) {
    throw new Error('useMobileSidebar must be used within a MobileSidebarProvider');
  }
  return context;
} 