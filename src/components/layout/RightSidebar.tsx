
import React from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarRail
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const RightSidebar = () => {
  const { logout } = useAuth();
  
  // Get current date
  const today = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = monthNames[today.getMonth()];
  const year = today.getFullYear();
  
  return (
    <Sidebar side="right" variant="sidebar" collapsible="icon">
      <SidebarRail />
      
      <SidebarHeader className="p-4 border-b">
        <h3 className="text-lg font-semibold text-sky-700">Medical Information</h3>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Calendar</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-2 bg-white rounded-md shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-sky-900">{month} {year}</h4>
              </div>
              
              {/* Simple calendar grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
                  <div key={i} className="text-sky-700 font-medium">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: 35 }).map((_, i) => {
                  const day = i - 4 + 1; // Adjust starting point assuming month starts on 5th cell
                  return (
                    <div 
                      key={i} 
                      className={`
                        p-1 rounded-full text-sm
                        ${day === today.getDate() ? 'bg-sky-500 text-white font-bold' : ''}
                        ${day < 1 || day > 30 ? 'text-sky-200' : 'text-sky-900'}
                        ${day === 15 || day === 22 ? 'border border-sky-400' : ''}
                      `}
                    >
                      {day > 0 && day <= 30 ? day : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Drug Formulary</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-2 bg-white rounded-md shadow-sm max-h-60 overflow-y-auto">
              <ul className="space-y-1">
                {['Abacavir', 'Acetazolamide', 'Aciclovir', 'Albendazole', 'Allopurinol', 'Amoxicillin', 'Azithromycin', 'Captopril', 'Cefuroxime', 'Doxycycline'].map((drug, i) => (
                  <li key={i} className="px-2 py-1 text-sm hover:bg-sky-50 rounded cursor-pointer text-sky-900">
                    {drug}
                  </li>
                ))}
              </ul>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default RightSidebar;
