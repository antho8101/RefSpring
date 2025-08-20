import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';

// Mock all external services for E2E testing
vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('@/utils/productionOptimizer', () => ({
  initProductionOptimizations: vi.fn(),
}));

vi.mock('@/utils/securityHardening', () => ({
  initSecurityHardening: vi.fn(),
}));

vi.mock('@/utils/performanceMonitor', () => ({
  initPerformanceMonitoring: vi.fn(),
}));

// Mock successful auth flow
const mockAuthUser = {
  uid: 'test-user-123',
  email: 'test@refspring.com',
  displayName: 'Test User',
};

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockAuthUser,
    loading: false,
    error: null,
    signIn: vi.fn().mockResolvedValue({ user: mockAuthUser }),
    signUp: vi.fn().mockResolvedValue({ user: mockAuthUser }),
    signOut: vi.fn().mockResolvedValue(undefined),
    signInWithGoogle: vi.fn().mockResolvedValue({ user: mockAuthUser }),
  }),
}));

// Mock campaign operations
const mockCampaign = {
  id: 'campaign-123',
  name: 'E2E Test Campaign',
  commission: 15,
  targetUrl: 'https://e2e-test.example.com',
  currency: 'EUR' as const,
  status: 'active' as const,
  isActive: true,
  userId: mockAuthUser.uid,
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock('@/hooks/useCampaigns', () => ({
  useCampaigns: () => ({
    campaigns: [mockCampaign],
    isLoading: false,
    error: null,
    createCampaign: vi.fn().mockResolvedValue(mockCampaign),
    updateCampaign: vi.fn().mockResolvedValue(mockCampaign),
    deleteCampaign: vi.fn().mockResolvedValue(undefined),
  }),
}));

// Mock tracking functionality
vi.mock('@/hooks/useTracking', () => ({
  useTracking: () => ({
    generateTrackingLink: vi.fn().mockReturnValue('https://refspring.com/track/e2e123'),
    trackConversion: vi.fn().mockResolvedValue(undefined),
    getCampaignAnalytics: vi.fn().mockResolvedValue({
      totalClicks: 25,
      totalConversions: 3,
      totalRevenue: 75.00,
      conversionRate: 12,
    }),
  }),
}));

describe('Complete User Journey E2E', () => {
  beforeAll(() => {
    // Setup global mocks for E2E environment
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000/', pathname: '/' },
      writable: true,
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it('should complete the full user onboarding and campaign creation journey', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Step 1: User lands on homepage
    expect(screen.getByText(/refspring/i)).toBeInTheDocument();

    // Step 2: User clicks on sign up
    const signUpButton = screen.getByRole('button', { name: /commencer/i });
    fireEvent.click(signUpButton);

    // Step 3: User fills registration form
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /inscription/i })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@refspring.com' },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'securePassword123' },
    });

    // Step 4: Submit registration
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    // Step 5: User should be redirected to dashboard
    await waitFor(() => {
      expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Step 6: User sees welcome message and empty state
    expect(screen.getByText(/bienvenue/i)).toBeInTheDocument();
    expect(screen.getByText(/créer votre première campagne/i)).toBeInTheDocument();

    // Step 7: User clicks create campaign
    fireEvent.click(screen.getByRole('button', { name: /créer une campagne/i }));

    // Step 8: Campaign creation dialog opens
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/nouvelle campagne/i)).toBeInTheDocument();
    });

    // Step 9: User fills campaign details
    fireEvent.change(screen.getByLabelText(/nom de la campagne/i), {
      target: { value: 'E2E Test Campaign' },
    });
    fireEvent.change(screen.getByLabelText(/commission/i), {
      target: { value: '15' },
    });
    fireEvent.change(screen.getByLabelText(/url cible/i), {
      target: { value: 'https://e2e-test.example.com' },
    });

    // Step 10: Submit campaign creation
    fireEvent.click(screen.getByRole('button', { name: /créer la campagne/i }));

    // Step 11: Success message and campaign appears
    await waitFor(() => {
      expect(screen.getByText(/campagne créée avec succès/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('E2E Test Campaign')).toBeInTheDocument();
    });

    // Step 12: User views campaign details
    fireEvent.click(screen.getByText('E2E Test Campaign'));

    // Step 13: Campaign card shows correct information
    expect(screen.getByText('15% de commission')).toBeInTheDocument();
    expect(screen.getByText(/actif/i)).toBeInTheDocument();

    // Step 14: User generates tracking link
    fireEvent.click(screen.getByRole('button', { name: /générer lien/i }));

    await waitFor(() => {
      expect(screen.getByDisplayValue(/https:\/\/refspring\.com\/track/)).toBeInTheDocument();
    });

    // Step 15: User copies tracking link
    fireEvent.click(screen.getByRole('button', { name: /copier/i }));

    await waitFor(() => {
      expect(screen.getByText(/copié/i)).toBeInTheDocument();
    });

    // Step 16: User views statistics
    fireEvent.click(screen.getByRole('button', { name: /statistiques/i }));

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument(); // clicks
      expect(screen.getByText('3')).toBeInTheDocument(); // conversions
      expect(screen.getByText('75.00 €')).toBeInTheDocument(); // revenue
    });
  });

  it('should handle affiliate onboarding flow', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Navigate to affiliate page
    const affiliateLink = screen.getByText(/devenir affilié/i);
    fireEvent.click(affiliateLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /programme d'affiliation/i }))
        .toBeInTheDocument();
    });

    // Fill affiliate application
    fireEvent.change(screen.getByLabelText(/nom complet/i), {
      target: { value: 'Jean Dupont' },
    });
    fireEvent.change(screen.getByLabelText(/site web/i), {
      target: { value: 'https://affiliate-site.com' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Site spécialisé dans le marketing digital' },
    });

    // Submit application
    fireEvent.click(screen.getByRole('button', { name: /soumettre la candidature/i }));

    await waitFor(() => {
      expect(screen.getByText(/candidature soumise avec succès/i))
        .toBeInTheDocument();
    });
  });

  it('should handle conversion tracking simulation', async () => {
    // Simulate landing on tracking link
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://refspring.com/track/e2e123?campaign=campaign-123&affiliate=affiliate-456',
        search: '?campaign=campaign-123&affiliate=affiliate-456',
        pathname: '/track/e2e123',
      },
      writable: true,
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Should redirect to target URL with tracking
    await waitFor(() => {
      expect(window.location.href).toContain('e2e-test.example.com');
    });

    // Simulate conversion on target site
    const mockTracking = vi.mocked(require('@/hooks/useTracking').useTracking);
    
    // User completes purchase
    fireEvent.click(screen.getByRole('button', { name: /acheter maintenant/i }));

    await waitFor(() => {
      expect(mockTracking().trackConversion).toHaveBeenCalledWith({
        campaignId: 'campaign-123',
        affiliateId: 'affiliate-456',
        revenue: expect.any(Number),
        orderId: expect.any(String),
      });
    });
  });

  it('should handle error states gracefully throughout the journey', async () => {
    // Mock network error
    vi.mocked(require('@/hooks/useCampaigns').useCampaigns).mockReturnValue({
      campaigns: [],
      isLoading: false,
      error: 'Network error: Unable to load campaigns',
      createCampaign: vi.fn().mockRejectedValue(new Error('Network error')),
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Should display error state
    await waitFor(() => {
      expect(screen.getByText(/erreur de réseau/i)).toBeInTheDocument();
    });

    // Should show retry option
    expect(screen.getByRole('button', { name: /réessayer/i })).toBeInTheDocument();

    // User clicks retry
    fireEvent.click(screen.getByRole('button', { name: /réessayer/i }));

    // Should attempt to reload data
    await waitFor(() => {
      expect(screen.queryByText(/erreur de réseau/i)).not.toBeInTheDocument();
    });
  });

  it('should maintain user session across page refreshes', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // User should remain logged in
    expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
    expect(screen.getByText(mockAuthUser.displayName!)).toBeInTheDocument();

    // Simulate page refresh
    window.location.reload = vi.fn();
    
    // Should not lose authentication state
    expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
  });

  it('should handle responsive design across different screen sizes', async () => {
    // Simulate mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 });
    Object.defineProperty(window, 'innerHeight', { value: 667 });
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Mobile navigation should be visible
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();

    // Campaign cards should stack vertically
    const campaignCards = screen.getAllByRole('article');
    expect(campaignCards[0]).toHaveClass(/flex-col/); // Tailwind vertical flex

    // Simulate desktop viewport
    Object.defineProperty(window, 'innerWidth', { value: 1920 });
    Object.defineProperty(window, 'innerHeight', { value: 1080 });

    // Desktop layout should show
    expect(screen.queryByRole('button', { name: /menu/i })).not.toBeInTheDocument();
  });
});