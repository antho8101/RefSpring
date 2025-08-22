
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { CookieBanner } from '@/components/CookieBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/i18n';
import PrivacyPage from '@/pages/PrivacyPage';
import LegalPage from '@/pages/LegalPage';
import TermsPage from '@/pages/TermsPage';
import SecurityPage from '@/pages/SecurityPage';
import StatusPage from '@/pages/StatusPage';
import LandingPage from '@/pages/LandingPage';
import PricingPage from '@/pages/PricingPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import TestProductsPage from '@/pages/TestProductsPage';
import TestThankYouPage from '@/pages/TestThankYouPage';
import { Dashboard } from '@/components/Dashboard';
import { PaymentSuccessPage } from '@/pages/PaymentSuccessPage';
import TrackingPage from '@/pages/TrackingPage';
import ShortLinkPage from '@/pages/ShortLinkPage';
import TrackingJsRoute from '@/pages/TrackingJsRoute';
import { ShopifyCallbackPage } from '@/pages/ShopifyCallbackPage';
import { ShopifyCallbackSupabasePage } from '@/pages/ShopifyCallbackSupabasePage';
import { ShopifyTestPage } from '@/pages/ShopifyTestPage';
import AdminPage from '@/pages/AdminPage';
import AffiliateOnboardingPage from '@/pages/AffiliateOnboardingPage';
import CommissionInfoPage from '@/pages/CommissionInfoPage';
import MobileNotSupportedPage from '@/pages/MobileNotSupportedPage';
import PrivacyDashboardPage from '@/pages/PrivacyDashboardPage';

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
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/app" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/auth/shopify/callback" element={<ShopifyCallbackPage />} />
                    <Route path="/shopify/callback" element={<ShopifyCallbackSupabasePage />} />
                    <Route path="/shopify/test" element={<ShopifyTestPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/campaign/:campaignId" element={<AdvancedStatsPage />} />
                    <Route path="/affiliate/:affiliateId" element={<AffiliatePage />} />
                    <Route path="/r/:campaignId" element={<AffiliatePage />} />
                    <Route path="/track/:campaignId/:affiliateId" element={<TrackingPage />} />
                    <Route path="/s/:shortCode" element={<ShortLinkPage />} />
                    <Route path="/tracking.js" element={<TrackingJsRoute />} />
                    <Route path="/test-products" element={<TestProductsPage />} />
                    <Route path="/test-thankyou" element={<TestThankYouPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/security" element={<SecurityPage />} />
                    <Route path="/status" element={<StatusPage />} />
                    <Route path="/legal" element={<LegalPage />} />
                    <Route path="/payment-success" element={<PaymentSuccessPage />} />
                    <Route path="/affiliate-onboarding" element={<AffiliateOnboardingPage />} />
                    <Route path="/commission-info" element={<CommissionInfoPage />} />
                    <Route path="/mobile-not-supported" element={<MobileNotSupportedPage />} />
                    <Route path="/privacy-dashboard" element={<PrivacyDashboardPage />} />
                  </Routes>
                </Suspense>
                
                <CookieBanner />
              </div>
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
