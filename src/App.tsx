
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import CreatePoll from "./pages/CreatePoll";
import NotFound from "./pages/NotFound";
import HelpPage from "./pages/HelpPage";
import PollPage from "./pages/PollPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSettings from "./pages/admin/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import { useDatabase } from "./lib/db";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const { initialize, initialized } = useDatabase();
  
  useEffect(() => {
    // Initialize database only once when app loads
    initialize();
  }, []);
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/create" element={<CreatePoll />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/poll/:id" element={<PollPage />} />
      
      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute>
            <AdminSettings />
          </ProtectedRoute>
        } 
      />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
