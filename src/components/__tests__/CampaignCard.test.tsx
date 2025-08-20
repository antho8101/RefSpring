import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { CampaignCard } from '@/components/CampaignCard';

// Mock hooks
const mockUseCampaignStats = vi.fn();
const mockUseCurrencyFormatter = vi.fn();

vi.mock('@/hooks/useCampaignStats', () => ({
  useCampaignStats: mockUseCampaignStats,
}));

vi.mock('@/hooks/useCurrencyFormatter', () => ({
  useCurrencyFormatter: mockUseCurrencyFormatter,
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

  const mockStats = {
    totalClicks: 125,
    totalConversions: 8,
    totalRevenue: 240.00,
    conversionRate: 6.4,
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCampaignStats.mockReturnValue(mockStats);
    mockUseCurrencyFormatter.mockReturnValue({
      formatCurrency: (amount: number) => `${amount.toFixed(2)} €`,
    });
  });

  it('should render campaign information correctly', () => {
    render(<CampaignCard campaign={mockCampaign} />);
    
    expect(screen.getByText('Ma Super Campagne')).toBeInTheDocument();
    expect(screen.getByText('15% de commission')).toBeInTheDocument();
    expect(screen.getByText(/actif/i)).toBeInTheDocument();
  });

  it('should display campaign statistics', () => {
    render(<CampaignCard campaign={mockCampaign} />);
    
    expect(screen.getByText('125')).toBeInTheDocument(); // clicks
    expect(screen.getByText('8')).toBeInTheDocument(); // conversions  
    expect(screen.getByText('240.00 €')).toBeInTheDocument(); // revenue
    expect(screen.getByText('6.4%')).toBeInTheDocument(); // conversion rate
  });

  it('should show loading state for statistics', () => {
    mockUseCampaignStats.mockReturnValue({
      ...mockStats,
      isLoading: true,
    });
    
    render(<CampaignCard campaign={mockCampaign} />);
    
    expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(4);
  });

  it('should handle error state for statistics', () => {
    mockUseCampaignStats.mockReturnValue({
      ...mockStats,
      error: 'Erreur de chargement des statistiques',
      isLoading: false,
    });
    
    render(<CampaignCard campaign={mockCampaign} />);
    
    expect(screen.getByText(/erreur de chargement/i)).toBeInTheDocument();
  });

  it('should show inactive status for paused campaigns', () => {
    const inactiveCampaign = { ...mockCampaign, status: 'paused' as const, isActive: false };
    
    render(<CampaignCard campaign={inactiveCampaign} />);
    
    expect(screen.getByText(/suspendu/i)).toBeInTheDocument();
  });

  it('should display formatted creation date', () => {
    render(<CampaignCard campaign={mockCampaign} />);
    
    expect(screen.getByText(/créé le/i)).toBeInTheDocument();
    expect(screen.getByText(/01\/01\/2024/i)).toBeInTheDocument();
  });

  it('should handle click to view details', () => {
    const mockOnClick = vi.fn();
    
    render(<CampaignCard campaign={mockCampaign} onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByRole('article')); // Card container
    
    expect(mockOnClick).toHaveBeenCalledWith(mockCampaign);
  });

  it('should show action buttons for campaign management', () => {
    render(<CampaignCard campaign={mockCampaign} />);
    
    expect(screen.getByRole('button', { name: /modifier/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /statistiques/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /partager/i })).toBeInTheDocument();
  });

  it('should handle campaign edit action', () => {
    const mockOnEdit = vi.fn();
    
    render(<CampaignCard campaign={mockCampaign} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /modifier/i }));
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockCampaign);
  });

  it('should show commission percentage prominently', () => {
    render(<CampaignCard campaign={mockCampaign} />);
    
    const commissionElement = screen.getByText('15%');
    expect(commissionElement).toHaveClass('text-lg', 'font-bold'); // Should be prominent
  });

  it('should be accessible with proper ARIA labels', () => {
    render(<CampaignCard campaign={mockCampaign} />);
    
    expect(screen.getByRole('article')).toHaveAttribute('aria-labelledby');
    expect(screen.getByRole('heading')).toHaveAttribute('id');
  });

  it('should handle different currencies correctly', () => {
    const usdCampaign = { ...mockCampaign, currency: 'USD' as const };
    mockUseCurrencyFormatter.mockReturnValue({
      formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
    });
    
    render(<CampaignCard campaign={usdCampaign} />);
    
    expect(screen.getByText('$240.00')).toBeInTheDocument();
  });

  it('should display zero states gracefully', () => {
    mockUseCampaignStats.mockReturnValue({
      totalClicks: 0,
      totalConversions: 0, 
      totalRevenue: 0,
      conversionRate: 0,
      isLoading: false,
      error: null,
    });
    
    render(<CampaignCard campaign={mockCampaign} />);
    
    expect(screen.getByText('0')).toBeInTheDocument(); // clicks
    expect(screen.getByText('0.00 €')).toBeInTheDocument(); // revenue
    expect(screen.getByText('0%')).toBeInTheDocument(); // conversion rate
  });
});