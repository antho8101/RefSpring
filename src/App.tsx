import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HelmetProvider } from 'react-helmet-async';
import './i18n';

// Lazy loading des composants de page
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AffiliatePage = lazy(() => import("./pages/AffiliatePage"));
const TrackingPage = lazy(() => import("./pages/TrackingPage"));
const ShortLinkPage = lazy(() => import("./pages/ShortLinkPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const TrackingJsRoute = lazy(() => import("./pages/TrackingJsRoute"));
const TestProductsPage = lazy(() => import("./pages/TestProductsPage"));
const TestThankYouPage = lazy(() => import("./pages/TestThankYouPage"));
const AdvancedStatsPage = lazy(() => import("./pages/AdvancedStatsPage"));

// Optimisation du QueryClient avec cache persistant
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
      retry: (failureCount, error) => {
        // Ne pas retry sur les erreurs 4xx
        if (error && typeof error === 'object' && 'status' in error) {
          return (error.status as number) >= 500 && failureCount < 3;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

// Composant de loading amélioré
const PageSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <div className="text-slate-600 text-sm">Chargement...</div>
    </div>
  </div>
);

const DomainRouter = () => {
  const hostname = window.location.hostname;
  const currentPath = window.location.pathname;

  // Redirection uniquement pour dashboard.refspring.com
  useEffect(() => {
    if (hostname === 'dashboard.refspring.com' && currentPath === '/') {
      window.location.replace('/dashboard');
    }
  }, [hostname, currentPath]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          {/* Route principale */}
          <Route path="/" element={
            hostname === 'dashboard.refspring.com' 
              ? <Navigate to="/dashboard" replace />
              : <LandingPage />
          } />
          
          {/* Dashboard accessible uniquement via /dashboard */}
          <Route path="/dashboard" element={<Index />} />
          <Route path="/advanced-stats" element={<AdvancedStatsPage />} />
          <Route path="/advanced-stats/:campaignId" element={<AdvancedStatsPage />} />
          
          {/* Route pour servir le fichier tracking.js */}
          <Route path="/tracking.js" element={<TrackingJsRoute />} />
          
          {/* Pages de test */}
          <Route path="/test-products" element={<TestProductsPage />} />
          <Route path="/test-thankyou" element={<TestThankYouPage />} />
          
          {/* Pages fonctionnelles - disponibles sur tous les domaines */}
          <Route path="/r/:campaignId" element={<AffiliatePage />} />
          <Route path="/track/:campaignId/:affiliateId" element={<TrackingPage />} />
          <Route path="/s/:shortCode" element={<ShortLinkPage />} />
          
          {/* 404 - doit être en dernier */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <DomainRouter />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
