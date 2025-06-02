
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AffiliatePage from "./pages/AffiliatePage";
import TrackingPage from "./pages/TrackingPage";
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

const DomainRouter = () => {
  useEffect(() => {
    const hostname = window.location.hostname;
    const currentPath = window.location.pathname;
    
    // Redirection basée sur le domaine
    if (hostname === 'refspring.com' && currentPath === '/') {
      window.location.replace('/landing');
    } else if (hostname === 'dashboard.refspring.com' && currentPath === '/') {
      window.location.replace('/dashboard');
    } else if (hostname === 'refspring.com' && currentPath === '/dashboard') {
      window.location.replace('/landing');
    }
  }, []);

  return (
    <Routes>
      {/* Route principale - comportement par défaut selon le domaine */}
      <Route path="/" element={
        window.location.hostname === 'dashboard.refspring.com' 
          ? <Navigate to="/dashboard" replace />
          : <Navigate to="/landing" replace />
      } />
      
      {/* Pages principales */}
      <Route path="/dashboard" element={<Index />} />
      <Route path="/landing" element={<LandingPage />} />
      
      {/* Pages fonctionnelles */}
      <Route path="/r/:campaignId" element={<AffiliatePage />} />
      <Route path="/track/:campaignId/:affiliateId" element={<TrackingPage />} />
      
      {/* 404 - doit être en dernier */}
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
        <DomainRouter />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
