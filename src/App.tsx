
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/contexts/AuthContext';
import './i18n';

// Lazy loading des composants de page
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AffiliatePage = lazy(() => import("./pages/AffiliatePage"));
const TrackingPage = lazy(() => import("./pages/TrackingPage"));
const ShortLinkPage = lazy(() => import("./pages/ShortLinkPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const TrackingJsRoute = lazy(() => import("./pages/TrackingJsRoute"));
const TestProductsPage = lazy(() => import("./pages/TestProductsPage"));
const TestThankYouPage = lazy(() => import("./pages/TestThankYouPage"));
const AdvancedStatsPage = lazy(() => import("./pages/AdvancedStatsPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));

// QueryClient simplifié
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 secondes seulement
      retry: 1, // Moins de retry
      refetchOnWindowFocus: false,
    },
  },
});

// Composant de loading ultra-simple
const FastLoader = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const DomainRouter = () => {
  const hostname = window.location.hostname;
  const currentPath = window.location.pathname;

  useEffect(() => {
    if (hostname === 'dashboard.refspring.com' && currentPath === '/') {
      window.location.replace('/dashboard');
    }
  }, [hostname, currentPath]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<FastLoader />}>
        <Routes>
          <Route path="/" element={
            hostname === 'dashboard.refspring.com' 
              ? <Navigate to="/dashboard" replace />
              : <LandingPage />
          } />
          
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/advanced-stats" element={<AdvancedStatsPage />} />
          <Route path="/advanced-stats/:campaignId" element={<AdvancedStatsPage />} />
          
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          
          <Route path="/tracking.js" element={<TrackingJsRoute />} />
          
          <Route path="/test-products" element={<TestProductsPage />} />
          <Route path="/test-thankyou" element={<TestThankYouPage />} />
          
          <Route path="/r/:campaignId" element={<AffiliatePage />} />
          <Route path="/track/:campaignId/:affiliateId" element={<TrackingPage />} />
          <Route path="/s/:shortCode" element={<ShortLinkPage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <DomainRouter />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
