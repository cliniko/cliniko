import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Routes, Route, Navigate } from "react-router-dom";
import { MobileSidebarProvider } from "./context/MobileSidebarContext";
import { ThemeProvider } from "./context/ThemeContext";
import RequireAuth from "./components/auth/RequireAuth";
import AppLayout from "./components/layout/AppLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Consults from "./pages/Consults";
import NewConsultation from "./pages/NewConsultation";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import Users from "./pages/Users";
import Vitals from "./pages/Vitals";
import AINotes from "./pages/AINotes";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import ResetPassword from '@/pages/ResetPassword';
import Appointments from './pages/Appointments';
import NewAppointment from './pages/NewAppointment';

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="holcim-theme">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/docs" element={<Documentation />} />
      <Route path="/docs/components/:component" element={<Documentation />} />
            
            {/* Entry point for role-based routing */}
            <Route path="/index" element={<Index />} />
            
            {/* Protected Routes with specific role restrictions */}
            <Route 
              element={
                <RequireAuth>
            <MobileSidebarProvider>
                  <AppLayout />
            </MobileSidebarProvider>
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
          path="/consults/new" 
          element={
            <RequireAuth allowedRoles={['admin', 'doctor', 'nurse']}>
              <NewConsultation />
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
          path="/patients/:id" 
          element={
            <RequireAuth allowedRoles={['admin', 'doctor', 'nurse', 'staff']}>
              <PatientDetail />
            </RequireAuth>
          }
        />
        
        <Route 
          path="/appointments" 
          element={
            <RequireAuth allowedRoles={['admin', 'doctor', 'nurse']}>
              <Appointments />
            </RequireAuth>
          }
        />
        
        <Route 
          path="/appointments/new" 
          element={
            <RequireAuth allowedRoles={['admin', 'nurse']}>
              <NewAppointment />
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
      <Toaster />
      <Sonner />
  </ThemeProvider>
);

export default App;
