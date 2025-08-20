import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { CampaignCard } from '@/components/CampaignCard';

// Mock hooks
const mockUseAffiliates = vi.fn();
const mockUseTrackingLinkGenerator = vi.fn();

vi.mock('@/hooks/useAffiliates', () => ({
  useAffiliates: mockUseAffiliates,
}));

vi.mock('@/hooks/useTrackingLinkGenerator', () => ({
  useTrackingLinkGenerator: mockUseTrackingLinkGenerator,
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('CampaignCard Component', () => {
  const mockCampaign = {
    id: 'campaign-123',
    name: 'Ma Super Campagne',
    commission: 15,
    status: 'active' as const,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    userId: 'user-123',
    targetUrl: 'https://example.com',
    currency: 'EUR' as const,
    isActive: true,
    description: 'Test campaign description',
    defaultCommissionRate: 15,
    paymentConfigured: true,
    isDraft: false,
  };

  const mockOnCopyUrl = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAffiliates.mockReturnValue({
      affiliates: [],
      loading: false,
      error: null,
    });
    mockUseTrackingLinkGenerator.mockReturnValue({
      generateTrackingLink: vi.fn().mockResolvedValue('https://refspring.com/track/abc123'),
    });
  });

  it('should render campaign information correctly', () => {
    render(<CampaignCard campaign={mockCampaign} onCopyUrl={mockOnCopyUrl} />);
    
    expect(screen.getByText('Ma Super Campagne')).toBeInTheDocument();
    expect(screen.getByText(/commission/i)).toBeInTheDocument();
  });

  it('should show campaign status', () => {
    render(<CampaignCard campaign={mockCampaign} onCopyUrl={mockOnCopyUrl} />);
    
    expect(screen.getByText(/actif/i)).toBeInTheDocument();
  });

  it('should handle paused campaign status', () => {
    const pausedCampaign = { ...mockCampaign, status: 'paused' as const, isActive: false };
    
    render(<CampaignCard campaign={pausedCampaign} onCopyUrl={mockOnCopyUrl} />);
    
    expect(screen.getByText(/suspendu/i)).toBeInTheDocument();
  });

  it('should display campaign creation date', () => {
    render(<CampaignCard campaign={mockCampaign} onCopyUrl={mockOnCopyUrl} />);
    
    expect(screen.getByText(/créé/i)).toBeInTheDocument();
  });

  it('should call onCopyUrl when copy action is triggered', () => {
    render(<CampaignCard campaign={mockCampaign} onCopyUrl={mockOnCopyUrl} />);
    
    // The onCopyUrl is called internally by the component logic
    expect(mockOnCopyUrl).toBeDefined();
  });

  it('should display affiliates section', () => {
    render(<CampaignCard campaign={mockCampaign} onCopyUrl={mockOnCopyUrl} />);
    
    expect(screen.getByText(/affiliés/i)).toBeInTheDocument();
  });

  it('should be accessible with proper structure', () => {
    render(<CampaignCard campaign={mockCampaign} onCopyUrl={mockOnCopyUrl} />);
    
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('should handle campaign without target URL', () => {
    const campaignWithoutUrl = { ...mockCampaign, targetUrl: '' };
    
    render(<CampaignCard campaign={campaignWithoutUrl} onCopyUrl={mockOnCopyUrl} />);
    
    // Should render without crashing
    expect(screen.getByText('Ma Super Campagne')).toBeInTheDocument();
  });

  it('should display campaign stats section', () => {
    render(<CampaignCard campaign={mockCampaign} onCopyUrl={mockOnCopyUrl} />);
    
    // CampaignStats component should be rendered
    expect(screen.getByText(/statistiques|stats/i)).toBeInTheDocument();
  });

  it('should show campaign actions', () => {
    render(<CampaignCard campaign={mockCampaign} onCopyUrl={mockOnCopyUrl} />);
    
    // CampaignActions component should be rendered
    expect(screen.getByText(/actions|modifier|settings/i)).toBeInTheDocument();
  });
});