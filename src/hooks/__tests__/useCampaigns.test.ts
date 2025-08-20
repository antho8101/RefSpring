import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCampaigns } from '@/hooks/useCampaigns';

// Mock hooks
const mockUseAuth = vi.fn();
const mockUseCampaignData = vi.fn();
const mockUseCampaignOperations = vi.fn();
const mockUseAuthGuard = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('@/hooks/useCampaignData', () => ({
  useCampaignData: mockUseCampaignData,
}));

vi.mock('@/hooks/useCampaignOperations', () => ({
  useCampaignOperations: mockUseCampaignOperations,
}));

vi.mock('@/hooks/useAuthGuard', () => ({
  useAuthGuard: mockUseAuthGuard,
}));

describe('useCampaigns Hook', () => {
  const mockUser = { uid: 'test-user-123' };
  const mockCampaigns = [
    {
      id: 'campaign-1',
      name: 'Test Campaign 1',
      status: 'active',
      isActive: true,
    },
    {
      id: 'campaign-2', 
      name: 'Test Campaign 2',
      status: 'paused',
      isActive: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    });
    
    mockUseCampaignData.mockReturnValue({
      campaigns: mockCampaigns,
      loading: false,
    });
    
    mockUseCampaignOperations.mockReturnValue({
      createCampaign: vi.fn().mockResolvedValue('campaign-123'),
      updateCampaign: vi.fn().mockResolvedValue(undefined),
      finalizeCampaign: vi.fn().mockResolvedValue(undefined),
      deleteCampaign: vi.fn().mockResolvedValue(undefined),
    });
    
    mockUseAuthGuard.mockReturnValue({
      requireAuthentication: vi.fn().mockReturnValue(true),
    });
  });

  it('should initialize correctly with authenticated user', () => {
    const { result } = renderHook(() => useCampaigns());
    
    expect(result.current.campaigns).toEqual(mockCampaigns);
    expect(result.current.loading).toBe(false);
  });

  it('should handle loading state', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: true,
    });
    
    const { result } = renderHook(() => useCampaigns());
    
    expect(result.current.loading).toBe(true);
  });

  it('should create campaign successfully', async () => {
    const { result } = renderHook(() => useCampaigns());
    
    const campaignData = {
      name: 'New Campaign',
      commission: 10,
      targetUrl: 'https://example.com',
      currency: 'EUR',
    };
    
    await act(async () => {
      const campaignId = await result.current.createCampaign(campaignData);
      expect(campaignId).toBe('campaign-123');
    });
    
    expect(mockUseCampaignOperations().createCampaign).toHaveBeenCalledWith(campaignData);
  });

  it('should update campaign successfully', async () => {
    const { result } = renderHook(() => useCampaigns());
    
    const updates = {
      name: 'Updated Campaign',
      commission: 15,
    };
    
    await act(async () => {
      await result.current.updateCampaign('campaign-123', updates);
    });
    
    expect(mockUseCampaignOperations().updateCampaign).toHaveBeenCalledWith('campaign-123', updates);
  });

  it('should finalize campaign successfully', async () => {
    const { result } = renderHook(() => useCampaigns());
    
    const stripeData = {
      paymentMethodId: 'pm_123',
    };
    
    await act(async () => {
      await result.current.finalizeCampaign('campaign-123', stripeData);
    });
    
    expect(mockUseCampaignOperations().finalizeCampaign).toHaveBeenCalledWith('campaign-123', stripeData);
  });

  it('should delete campaign successfully', async () => {
    const { result } = renderHook(() => useCampaigns());
    
    await act(async () => {
      await result.current.deleteCampaign('campaign-123');
    });
    
    expect(mockUseCampaignOperations().deleteCampaign).toHaveBeenCalledWith('campaign-123');
  });

  it('should handle authentication errors', async () => {
    mockUseAuthGuard.mockReturnValue({
      requireAuthentication: vi.fn().mockReturnValue(false),
    });
    
    const { result } = renderHook(() => useCampaigns());
    
    await act(async () => {
      const result_val = await result.current.createCampaign({});
      expect(result_val).toBeUndefined();
    });
    
    expect(mockUseCampaignOperations().createCampaign).not.toHaveBeenCalled();
  });

  it('should handle loading authentication state', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });
    
    const { result } = renderHook(() => useCampaigns());
    
    await act(async () => {
      await expect(result.current.createCampaign({}))
        .rejects.toThrow('Authentification en cours');
    });
  });

  it('should return empty campaigns for unauthenticated user', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });
    
    mockUseCampaignData.mockReturnValue({
      campaigns: [],
      loading: false,
    });
    
    const { result } = renderHook(() => useCampaigns());
    
    expect(result.current.campaigns).toEqual([]);
  });

  it('should handle campaign operations errors', async () => {
    const error = new Error('Campaign creation failed');
    mockUseCampaignOperations.mockReturnValue({
      createCampaign: vi.fn().mockRejectedValue(error),
      updateCampaign: vi.fn(),
      finalizeCampaign: vi.fn(),
      deleteCampaign: vi.fn(),
    });
    
    const { result } = renderHook(() => useCampaigns());
    
    await act(async () => {
      await expect(result.current.createCampaign({}))
        .rejects.toThrow('Campaign creation failed');
    });
  });
});