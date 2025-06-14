
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { SuccessModalProvider } from '@/contexts/SuccessModalContext';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CookieBanner } from '@/components/CookieBanner';
import { TawkToWidget } from '@/components/TawkToWidget';
import { NetworkStatus } from '@/components/NetworkStatus';

// Pages
import Index from '@/pages/Index';
import LandingPage from '@/pages/LandingPage';
import PricingPage from '@/pages/PricingPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import LegalPage from '@/pages/LegalPage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import SecurityPage from '@/pages/SecurityPage';
import StatusPage from '@/pages/StatusPage';
import AdminPage from '@/pages/AdminPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import AffiliatePage from '@/pages/AffiliatePage';
import AdvancedStatsPage from '@/pages/AdvancedStatsPage';
import TrackingPage from '@/pages/TrackingPage';
import ShortLinkPage from '@/pages/ShortLinkPage';
import NotFound from '@/pages/NotFound';
import CleanupPage from '@/pages/CleanupPage';
import TestProductsPage from '@/pages/TestProductsPage';
import TestThankYouPage from '@/pages/TestThankYouPage';
import TrackingJsRoute from '@/pages/TrackingJsRoute';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SuccessModalProvider>
            <Router>
              <div className="App">
                <NetworkStatus />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/legal" element={<LegalPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/security" element={<SecurityPage />} />
                  <Route path="/status" element={<StatusPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/payment-success" element={<PaymentSuccessPage />} />
                  <Route path="/r/:campaignId" element={<AffiliatePage />} />
                  <Route path="/stats/:campaignId" element={<AdvancedStatsPage />} />
                  <Route path="/tracking/:campaignId" element={<TrackingPage />} />
                  <Route path="/s/:shortId" element={<ShortLinkPage />} />
                  <Route path="/cleanup" element={<CleanupPage />} />
                  <Route path="/test-products" element={<TestProductsPage />} />
                  <Route path="/test-thank-you" element={<TestThankYouPage />} />
                  <Route path="/tracking.js" element={<TrackingJsRoute />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
                <CookieBanner />
                <TawkToWidget />
              </div>
            </Router>
          </SuccessModalProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
