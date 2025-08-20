import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { CreateCampaignDialog } from '@/components/CreateCampaignDialog';
import { CampaignCard } from '@/components/CampaignCard';
import { TrackingLinkGenerator } from '@/components/TrackingLinkGenerator';

// Mock services
const mockCampaignService = {
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getById: vi.fn(),
};

const mockStripeService = {
  createPaymentMethod: vi.fn(),
  attachPaymentMethod: vi.fn(),
  createSetupIntent: vi.fn(),
};

const mockTrackingService = {
  generateLink: vi.fn(),
  trackConversion: vi.fn(),
};

vi.mock('@/services/campaignService', () => ({
  campaignService: mockCampaignService,
}));

vi.mock('@/services/stripeBackendService', () => ({
  stripeBackendService: mockStripeService,
}));

vi.mock('@/services/trackingService', () => ({
  trackingService: mockTrackingService,
}));

describe('Campaign Creation Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full campaign creation flow', async () => {
    // Mock successful campaign creation
    const mockCampaign = {
      id: 'campaign-123',
      name: 'Test Campaign',
      commission: 10,
      targetUrl: 'https://example.com',
      currency: 'EUR',
      status: 'active',
      userId: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCampaignService.create.mockResolvedValue(mockCampaign);
    mockStripeService.createSetupIntent.mockResolvedValue({
      client_secret: 'si_test_123',
    });

    render(<CreateCampaignDialog open={true} onOpenChange={() => {}} />);

    // Step 1: Fill in campaign details
    fireEvent.change(screen.getByLabelText(/nom de la campagne/i), {
      target: { value: 'Test Campaign' },
    });
    
    fireEvent.change(screen.getByLabelText(/commission/i), {
      target: { value: '10' },
    });
    
    fireEvent.change(screen.getByLabelText(/url cible/i), {
      target: { value: 'https://example.com' },
    });

    // Step 2: Submit campaign creation
    fireEvent.click(screen.getByRole('button', { name: /créer la campagne/i }));

    // Step 3: Verify campaign was created
    await waitFor(() => {
      expect(mockCampaignService.create).toHaveBeenCalledWith({
        name: 'Test Campaign',
        commission: 10,
        targetUrl: 'https://example.com',
        currency: 'EUR',
        userId: 'user-123',
      });
    });

    // Step 4: Verify success message
    await waitFor(() => {
      expect(screen.getByText(/campagne créée avec succès/i)).toBeInTheDocument();
    });
  });

  it('should handle campaign creation with payment method setup', async () => {
    const mockCampaign = {
      id: 'campaign-123',
      name: 'Premium Campaign',
      commission: 15,
      targetUrl: 'https://premium.example.com',
      currency: 'EUR',
      status: 'active',
      userId: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCampaignService.create.mockResolvedValue(mockCampaign);
    mockStripeService.createSetupIntent.mockResolvedValue({
      client_secret: 'si_test_123',
    });
    mockStripeService.createPaymentMethod.mockResolvedValue({
      id: 'pm_test_123',
      card: { last4: '4242', brand: 'visa' },
    });

    render(<CreateCampaignDialog open={true} onOpenChange={() => {}} />);

    // Fill campaign details
    fireEvent.change(screen.getByLabelText(/nom de la campagne/i), {
      target: { value: 'Premium Campaign' },
    });
    
    fireEvent.change(screen.getByLabelText(/commission/i), {
      target: { value: '15' },
    });

    // Select "Add new payment method"
    fireEvent.click(screen.getByText(/ajouter une nouvelle carte/i));

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /créer la campagne/i }));

    await waitFor(() => {
      expect(mockStripeService.createSetupIntent).toHaveBeenCalled();
      expect(mockCampaignService.create).toHaveBeenCalled();
    });
  });

  it('should display created campaign with correct data', async () => {
    const mockCampaign = {
      id: 'campaign-123',
      name: 'Display Test Campaign',
      commission: 12,
      targetUrl: 'https://display.example.com',
      currency: 'EUR' as const,
      status: 'active' as const,
      isActive: true,
      userId: 'user-123',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    const mockStats = {
      totalClicks: 50,
      totalConversions: 5,
      totalRevenue: 150.00,
      conversionRate: 10,
      isLoading: false,
      error: null,
    };

    vi.mocked(require('@/hooks/useCampaignStats').useCampaignStats)
      .mockReturnValue(mockStats);

    render(<CampaignCard campaign={mockCampaign} />);

    expect(screen.getByText('Display Test Campaign')).toBeInTheDocument();
    expect(screen.getByText('12% de commission')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument(); // clicks
    expect(screen.getByText('5')).toBeInTheDocument(); // conversions
    expect(screen.getByText('150.00 €')).toBeInTheDocument(); // revenue
  });

  it('should generate tracking link after campaign creation', async () => {
    const mockCampaign = {
      id: 'campaign-123',
      name: 'Tracking Test Campaign',
      targetUrl: 'https://tracking.example.com',
    };

    const mockTrackingLink = 'https://refspring.com/track/abc123def456';
    mockTrackingService.generateLink.mockReturnValue(mockTrackingLink);

    render(
      <TrackingLinkGenerator 
        campaign={mockCampaign}
        affiliate={{ id: 'affiliate-123', name: 'Test Affiliate' }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /générer le lien/i }));

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockTrackingLink)).toBeInTheDocument();
    });

    expect(mockTrackingService.generateLink).toHaveBeenCalledWith(
      'campaign-123',
      'affiliate-123'
    );
  });

  it('should handle campaign creation errors gracefully', async () => {
    mockCampaignService.create.mockRejectedValue(
      new Error('Campaign name already exists')
    );

    render(<CreateCampaignDialog open={true} onOpenChange={() => {}} />);

    fireEvent.change(screen.getByLabelText(/nom de la campagne/i), {
      target: { value: 'Duplicate Campaign' },
    });

    fireEvent.click(screen.getByRole('button', { name: /créer la campagne/i }));

    await waitFor(() => {
      expect(screen.getByText(/nom de campagne déjà utilisé/i)).toBeInTheDocument();
    });
  });

  it('should validate campaign data before submission', async () => {
    render(<CreateCampaignDialog open={true} onOpenChange={() => {}} />);

    // Try to submit with empty fields
    fireEvent.click(screen.getByRole('button', { name: /créer la campagne/i }));

    await waitFor(() => {
      expect(screen.getByText(/nom requis/i)).toBeInTheDocument();
      expect(screen.getByText(/commission requise/i)).toBeInTheDocument();
      expect(screen.getByText(/url cible requise/i)).toBeInTheDocument();
    });

    expect(mockCampaignService.create).not.toHaveBeenCalled();
  });

  it('should handle payment method selection during campaign creation', async () => {
    const mockPaymentMethods = [
      {
        id: 'pm_existing_123',
        card: { last4: '4242', brand: 'visa' },
        billing_details: { name: 'John Doe' },
      },
    ];

    vi.mocked(require('@/hooks/usePaymentMethods').usePaymentMethods)
      .mockReturnValue({
        paymentMethods: mockPaymentMethods,
        isLoading: false,
        error: null,
      });

    render(<CreateCampaignDialog open={true} onOpenChange={() => {}} />);

    // Should show existing payment method
    expect(screen.getByText(/•••• 4242/i)).toBeInTheDocument();
    
    // Should allow selection
    fireEvent.click(screen.getByText(/•••• 4242/i));
    
    expect(screen.getByRole('radio', { checked: true })).toBeInTheDocument();
  });

  it('should update campaign status and reflect changes', async () => {
    const mockCampaign = {
      id: 'campaign-123',
      name: 'Status Test Campaign',
      commission: 10,
      status: 'active' as const,
      isActive: true,
      userId: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCampaignService.update.mockResolvedValue({
      ...mockCampaign,
      status: 'paused',
      isActive: false,
    });

    const { rerender } = render(<CampaignCard campaign={mockCampaign} />);

    // Initially active
    expect(screen.getByText(/actif/i)).toBeInTheDocument();

    // Simulate status update
    fireEvent.click(screen.getByRole('button', { name: /suspendre/i }));

    await waitFor(() => {
      expect(mockCampaignService.update).toHaveBeenCalledWith(
        'campaign-123',
        { status: 'paused', isActive: false }
      );
    });

    // Re-render with updated status
    rerender(<CampaignCard campaign={{
      ...mockCampaign,
      status: 'paused',
      isActive: false,
    }} />);

    expect(screen.getByText(/suspendu/i)).toBeInTheDocument();
  });
});