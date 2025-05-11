import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import { MobileSidebarProvider } from "./context/MobileSidebarContext";
import { ThemeProvider } from "./context/ThemeContext";
import RequireAuth from "./components/auth/RequireAuth";
import AppLayout from "./components/layout/AppLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Consults from "./pages/Consults";
import Patients from "./pages/Patients";
import Users from "./pages/Users";
import Vitals from "./pages/Vitals";
import AINotes from "./pages/AINotes";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

// Create a custom queryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (replaced cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus for better performance
      retry: 1, // Only retry failed queries once
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="holcim-theme">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="/docs/components/:component" element={<Documentation />} />
            
            {/* Entry point for role-based routing */}
            <Route path="/index" element={<Index />} />
            
            {/* Protected Routes with specific role restrictions */}
            <Route 
              element={
                <RequireAuth>
                    <SidebarProvider>
                      <MobileSidebarProvider>
                  <AppLayout />
                      </MobileSidebarProvider>
                    </SidebarProvider>
                </RequireAuth>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              
              <Route 
                path="/consults" 
                element={
                  <RequireAuth allowedRoles={['admin', 'doctor', 'nurse']}>
                    <Consults />
                  </RequireAuth>
                } 
              />
              
              <Route 
                path="/patients" 
                element={
                  <RequireAuth allowedRoles={['admin', 'doctor', 'nurse', 'staff']}>
                    <Patients />
                  </RequireAuth>
                }
              />
              
              <Route 
                path="/users" 
                element={
                  <RequireAuth allowedRoles={['admin']}>
                    <Users />
                  </RequireAuth>
                } 
              />
              
              <Route 
                path="/vitals" 
                element={
                  <RequireAuth allowedRoles={['admin', 'doctor', 'nurse']}>
                    <Vitals />
                  </RequireAuth>
                } 
              />
              
              <Route 
                path="/ai-notes" 
                element={
                  <RequireAuth allowedRoles={['admin', 'doctor', 'nurse']}>
                    <AINotes />
                  </RequireAuth>
                } 
              />
            </Route>
            
            {/* Redirect root to login page */}
            <Route path="" element={<Navigate to="/" replace />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
