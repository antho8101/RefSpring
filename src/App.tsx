
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { CookieBanner } from '@/components/CookieBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/i18n';
import PrivacyPage from '@/pages/PrivacyPage';
import LegalPage from '@/pages/LegalPage';
import LandingPage from '@/pages/LandingPage';
import PricingPage from '@/pages/PricingPage';
import { Dashboard } from '@/components/Dashboard';

const Index = lazy(() => import('@/pages/Index'));
const AdvancedStatsPage = lazy(() => import('@/pages/AdvancedStatsPage'));
const AffiliatePage = lazy(() => import('@/pages/AffiliatePage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <Helmet>
                <title>RefSpring - Plateforme d'affiliation</title>
                <meta name="description" content="Gérez vos programmes d'affiliation avec RefSpring" />
              </Helmet>
              
              <div className="App">
                <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                </div>}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/app" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/campaign/:campaignId" element={<AdvancedStatsPage />} />
                    <Route path="/affiliate/:affiliateId" element={<AffiliatePage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/legal" element={<LegalPage />} />
                  </Routes>
                </Suspense>
                
                <CookieBanner />
                <Toaster />
              </div>
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
