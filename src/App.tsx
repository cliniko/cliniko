
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./components/auth/RequireAuth";
import AppLayout from "./components/layout/AppLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Consults from "./pages/Consults";
import Patients from "./pages/Patients";
import Users from "./pages/Users";
import Vitals from "./pages/Vitals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/index" element={<Navigate to="/" replace />} />
            
            {/* Protected Routes */}
            <Route 
              element={
                <RequireAuth>
                  <AppLayout />
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
              <Route path="/patients" element={<Patients />} />
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
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
