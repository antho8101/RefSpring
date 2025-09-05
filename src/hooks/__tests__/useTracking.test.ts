import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTracking } from '@/hooks/useTracking';

// Mock Supabase
const mockSupabaseInsert = vi.fn();
const mockSupabaseSelect = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mockSupabaseInsert,
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: mockSupabaseSelect,
        })),
      })),
    })),
  },
}));

// Mock auth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123' },
  }),
}));

describe('useTracking Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSupabaseInsert.mockResolvedValue({ error: null });
    mockSupabaseSelect.mockResolvedValue({ 
      data: { id: 'campaign-456', name: 'Test Campaign' },
      error: null 
    });
  });

  it('should track click successfully', async () => {
    const { result } = renderHook(() => useTracking());
    
    await act(async () => {
      await result.current.trackClick({
        affiliateId: 'affiliate-123',
        campaignId: 'campaign-456'
      });
    });
    
    expect(mockSupabaseInsert).toHaveBeenCalledWith({
      affiliate_id: 'affiliate-123',
      campaign_id: 'campaign-456',
      user_agent: undefined,
      referrer: undefined
    });
  });

  it('should track conversion successfully', async () => {
    const { result } = renderHook(() => useTracking());
    
    await act(async () => {
      await result.current.trackConversion({
        affiliateId: 'affiliate-123',
        campaignId: 'campaign-456',
        amount: 100,
        commission: 15
      });
    });
    
    expect(mockSupabaseInsert).toHaveBeenCalledWith({
      affiliate_id: 'affiliate-123',
      campaign_id: 'campaign-456',
      amount: 100,
      commission: 15,
      status: 'pending',
      verified: false
    });
  });

  it('should get campaign by id successfully', async () => {
    const { result } = renderHook(() => useTracking());
    
    let campaign;
    await act(async () => {
      campaign = await result.current.getCampaignById('campaign-456');
    });
    
    expect(mockSupabaseSelect).toHaveBeenCalled();
    expect(campaign).toEqual({ id: 'campaign-456', name: 'Test Campaign' });
  });

  it('should handle track click errors', async () => {
    mockSupabaseInsert.mockResolvedValue({ error: new Error('Database error') });
    
    const { result } = renderHook(() => useTracking());
    
    await act(async () => {
      await expect(result.current.trackClick({
        affiliateId: 'affiliate-123',
        campaignId: 'campaign-456'
      })).rejects.toThrow();
    });
  });

  it('should handle track conversion errors', async () => {
    mockSupabaseInsert.mockResolvedValue({ error: new Error('Database error') });
    
    const { result } = renderHook(() => useTracking());
    
    await act(async () => {
      await expect(result.current.trackConversion({
        affiliateId: 'affiliate-123',
        campaignId: 'campaign-456',
        amount: 100,
        commission: 15
      })).rejects.toThrow();
    });
  });

  it('should handle get campaign errors', async () => {
    mockSupabaseSelect.mockResolvedValue({ 
      data: null,
      error: new Error('Campaign not found') 
    });
    
    const { result } = renderHook(() => useTracking());
    
    await act(async () => {
      await expect(result.current.getCampaignById('invalid-campaign')).rejects.toThrow();
    });
  });

  it('should include user agent and referrer when provided', async () => {
    const { result } = renderHook(() => useTracking());
    
    await act(async () => {
      await result.current.trackClick({
        affiliateId: 'affiliate-123',
        campaignId: 'campaign-456',
        userAgent: 'Mozilla/5.0 Test Browser',
        referrer: 'https://example.com'
      });
    });
    
    expect(mockSupabaseInsert).toHaveBeenCalledWith({
      affiliate_id: 'affiliate-123',
      campaign_id: 'campaign-456',
      user_agent: 'Mozilla/5.0 Test Browser',
      referrer: 'https://example.com'
    });
  });
});