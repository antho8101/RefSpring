import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTracking } from '@/hooks/useTracking';

// Mock crypto
vi.mock('crypto-js', () => ({
  AES: {
    encrypt: vi.fn(() => ({ toString: () => 'encrypted-data' })),
    decrypt: vi.fn(() => ({ toString: () => 'decrypted-data' })),
  },
  enc: {
    Utf8: {
      stringify: vi.fn(() => 'decoded-string'),
    },
  },
}));

// Mock Firebase
const mockAddDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: mockAddDoc,
  getDocs: mockGetDocs,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  serverTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000 })),
}));

describe('useTracking Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset URL
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://example.com',
        search: '',
        pathname: '/',
      },
      writable: true,
    });
  });

  it('should generate tracking link correctly', () => {
    const { result } = renderHook(() => useTracking());
    
    const campaignId = 'campaign-123';
    const affiliateId = 'affiliate-456';
    
    const trackingLink = result.current.generateTrackingLink(campaignId, affiliateId);
    
    expect(trackingLink).toContain(campaignId);
    expect(trackingLink).toContain(affiliateId);
    expect(trackingLink).toMatch(/^https?:\/\//); // Should be a valid URL
  });

  it('should detect affiliate from URL parameters', () => {
    // Mock URL with affiliate parameter
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://example.com?ref=affiliate-123&campaign=campaign-456',
        search: '?ref=affiliate-123&campaign=campaign-456',
        pathname: '/',
      },
      writable: true,
    });
    
    const { result } = renderHook(() => useTracking());
    
    const affiliateData = result.current.detectAffiliateFromUrl();
    
    expect(affiliateData).toEqual({
      affiliateId: 'affiliate-123',
      campaignId: 'campaign-456',
    });
  });

  it('should track page view correctly', async () => {
    mockAddDoc.mockResolvedValue({ id: 'tracking-123' });
    
    const { result } = renderHook(() => useTracking());
    
    const trackingData = {
      campaignId: 'campaign-123',
      affiliateId: 'affiliate-456',
      action: 'page_view' as const,
      url: 'https://example.com/product',
    };
    
    await act(async () => {
      await result.current.trackEvent(trackingData);
    });
    
    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...trackingData,
        timestamp: expect.anything(),
        userAgent: expect.any(String),
        ipAddress: expect.any(String),
        sessionId: expect.any(String),
      })
    );
  });

  it('should track conversion with revenue', async () => {
    mockAddDoc.mockResolvedValue({ id: 'conversion-123' });
    
    const { result } = renderHook(() => useTracking());
    
    const conversionData = {
      campaignId: 'campaign-123',
      affiliateId: 'affiliate-456',
      action: 'conversion' as const,
      revenue: 99.99,
      orderId: 'order-789',
    };
    
    await act(async () => {
      await result.current.trackConversion(conversionData);
    });
    
    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...conversionData,
        timestamp: expect.anything(),
        commissionAmount: expect.any(Number), // Should calculate commission
      })
    );
  });

  it('should calculate commission correctly', () => {
    const { result } = renderHook(() => useTracking());
    
    const revenue = 100;
    const commissionRate = 15; // 15%
    
    const commission = result.current.calculateCommission(revenue, commissionRate);
    
    expect(commission).toBe(15);
  });

  it('should validate tracking data before submission', async () => {
    const { result } = renderHook(() => useTracking());
    
    const invalidData = {
      campaignId: '', // Empty campaign ID
      affiliateId: 'affiliate-456',
      action: 'page_view' as const,
    };
    
    await act(async () => {
      await expect(result.current.trackEvent(invalidData))
        .rejects.toThrow();
    });
    
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it('should generate unique session ID', () => {
    const { result } = renderHook(() => useTracking());
    
    const sessionId1 = result.current.generateSessionId();
    const sessionId2 = result.current.generateSessionId();
    
    expect(sessionId1).not.toBe(sessionId2);
    expect(sessionId1).toMatch(/^[a-f0-9-]+$/); // Should be UUID-like
  });

  it('should detect bot traffic', () => {
    const { result } = renderHook(() => useTracking());
    
    // Mock bot user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      writable: true,
    });
    
    const isBot = result.current.detectBot();
    expect(isBot).toBe(true);
    
    // Mock human user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      writable: true,
    });
    
    const isHuman = result.current.detectBot();
    expect(isHuman).toBe(false);
  });

  it('should encrypt sensitive tracking data', () => {
    const { result } = renderHook(() => useTracking());
    
    const sensitiveData = 'user-email@example.com';
    const encrypted = result.current.encryptData(sensitiveData);
    
    expect(encrypted).toBe('encrypted-data');
    expect(require('crypto-js').AES.encrypt).toHaveBeenCalledWith(
      sensitiveData,
      expect.any(String)
    );
  });

  it('should get tracking analytics for campaign', async () => {
    const mockTrackingData = [
      {
        id: '1',
        data: () => ({
          action: 'page_view',
          timestamp: { seconds: Date.now() / 1000 },
          revenue: 0,
        }),
      },
      {
        id: '2',
        data: () => ({
          action: 'conversion',
          timestamp: { seconds: Date.now() / 1000 },
          revenue: 50,
        }),
      },
    ];
    
    mockGetDocs.mockResolvedValue({ docs: mockTrackingData });
    
    const { result } = renderHook(() => useTracking());
    
    const analytics = await result.current.getCampaignAnalytics('campaign-123');
    
    expect(analytics).toEqual({
      totalClicks: 1,
      totalConversions: 1,
      totalRevenue: 50,
      conversionRate: 100, // 1 conversion out of 1 click
    });
  });

  it('should handle rate limiting for tracking requests', async () => {
    const { result } = renderHook(() => useTracking());
    
    // Simulate rapid tracking requests
    const promises = Array.from({ length: 10 }, () =>
      result.current.trackEvent({
        campaignId: 'campaign-123',
        affiliateId: 'affiliate-456',
        action: 'page_view' as const,
      })
    );
    
    await act(async () => {
      await Promise.allSettled(promises);
    });
    
    // Should not exceed rate limit (e.g., max 5 requests per second)
    expect(mockAddDoc).toHaveBeenCalledTimes(5);
  });

  it('should clean up tracking data older than retention period', async () => {
    const { result } = renderHook(() => useTracking());
    
    await act(async () => {
      await result.current.cleanupOldTrackingData(30); // 30 days retention
    });
    
    // Should query for old data and delete it
    expect(mockQuery).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalledWith(
      'timestamp',
      '<',
      expect.any(Object)
    );
  });
});