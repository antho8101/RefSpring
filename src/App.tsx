import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CookieBanner } from "@/components/CookieBanner";
import { NetworkStatus } from "@/components/NetworkStatus";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import StatusPage from "./pages/StatusPage";
import BrandIdentityPage from "./pages/BrandIdentityPage";
import { CampaignProvider } from "./contexts/CampaignContext";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Campaigns } from "./pages/app/Campaigns";
import { CampaignSettings } from "./pages/app/CampaignSettings";
import { Tracking } from "./pages/app/Tracking";
import { Billing } from "./pages/app/Billing";
import { Profile } from "./pages/app/Profile";
import { Appearance } from "./pages/app/Appearance";
import { Integrations } from "./pages/app/Integrations";
import { Users } from "./pages/app/Users";
import { Auth } from "./pages/Auth";
import NotFound from "./pages/NotFound";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('Network')) {
          return failureCount < 3;
        }
        return false;
      },
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <NetworkStatus />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/status" element={<StatusPage />} />
                  <Route path="/brand-identity" element={<BrandIdentityPage />} />
                  <Route path="/app" element={<Navigate to="/app/campaigns" />} />
                  <Route path="/app" element={<Auth />} />
                  <Route path="/app" element={<DashboardLayout />}>
                    <Route
                      path="/app/campaigns"
                      element={
                        <CampaignProvider>
                          <Campaigns />
                        </CampaignProvider>
                      }
                    />
                    <Route
                      path="/app/campaigns/:campaignId"
                      element={
                        <CampaignProvider>
                          <CampaignSettings />
                        </CampaignProvider>
                      }
                    />
                    <Route path="/app/tracking" element={<Tracking />} />
                    <Route path="/app/billing" element={<Billing />} />
                    <Route path="/app/profile" element={<Profile />} />
                    <Route path="/app/appearance" element={<Appearance />} />
                    <Route path="/app/integrations" element={<Integrations />} />
                    <Route path="/app/users" element={<Users />} />
                  </Route>
                  <Route path="/app/*" element={<Index />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <CookieBanner />
                <Toaster />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
