
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
