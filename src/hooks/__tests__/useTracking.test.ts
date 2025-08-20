import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTracking } from '@/hooks/useTracking';

// Mock Firebase
const mockAddDoc = vi.fn();
const mockGetDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: mockAddDoc,
  doc: vi.fn(),
  getDoc: mockGetDoc,
}));

// Mock hooks
const mockUseAntifraud = vi.fn();
const mockUseConversionVerification = vi.fn();

vi.mock('@/hooks/useAntifraud', () => ({
  useAntifraud: mockUseAntifraud,
}));

vi.mock('@/hooks/useConversionVerification', () => ({
  useConversionVerification: mockUseConversionVerification,
}));

describe('useTracking Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAntifraud.mockReturnValue({
      validateClick: vi.fn().mockResolvedValue({
        valid: true,
        riskScore: 0.1,
        reasons: [],
      }),
    });
    
    mockUseConversionVerification.mockReturnValue({
      createConversion: vi.fn().mockResolvedValue({
        id: 'conversion-123',
        success: true,
      }),
    });
    
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  it('should record click successfully', async () => {
    mockAddDoc.mockResolvedValue({ id: 'click-123' });
    window.sessionStorage.getItem = vi.fn().mockReturnValue(null);
    
    const { result } = renderHook(() => useTracking());
    
    await act(async () => {
      const clickId = await result.current.recordClick(
        'affiliate-123',
        'campaign-456',
        'https://example.com'
      );
      expect(typeof clickId).toBe('string');
    });
    
    expect(mockAddDoc).toHaveBeenCalled();
    expect(window.sessionStorage.setItem).toHaveBeenCalled();
  });

  it('should prevent duplicate clicks in same session', async () => {
    window.sessionStorage.getItem = vi.fn().mockReturnValue('existing-click-id');
    
    const { result } = renderHook(() => useTracking());
    
    await act(async () => {
      const clickId = await result.current.recordClick(
        'affiliate-123',
        'campaign-456',
        'https://example.com'
      );
      expect(clickId).toBe('existing-click-id');
    });
    
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it('should record conversion successfully', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ 
        affiliateId: 'affiliate-123',
        campaignId: 'campaign-456',
        commissionRate: 15,
      }),
    });
    
    const { result } = renderHook(() => useTracking());
    
    await act(async () => {
      const conversion = await result.current.recordConversion(
        'affiliate-123',
        'campaign-456',
        100,
        15
      );
      expect(conversion).toBeDefined();
    });
    
    expect(mockUseConversionVerification().createConversion).toHaveBeenCalled();
  });

  it('should handle antifraud rejection', async () => {
    mockUseAntifraud.mockReturnValue({
      validateClick: vi.fn().mockResolvedValue({
        valid: false,
        riskScore: 0.9,
        reasons: ['Suspicious IP', 'Bot detected'],
      }),
    });
    
    window.sessionStorage.getItem = vi.fn().mockReturnValue(null);
    
    const { result } = renderHook(() => useTracking());
    
    await act(async () => {
      await expect(result.current.recordClick(
        'affiliate-123',
        'campaign-456',
        'https://example.com'
      )).rejects.toThrow('Clic rejeté');
    });
    
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it('should validate click data before recording', async () => {
    const { result } = renderHook(() => useTracking());
    
    await act(async () => {
      await expect(result.current.recordClick(
        '', // Empty affiliate ID
        'campaign-456',
        'https://example.com'
      )).rejects.toThrow();
    });
  });

  it('should handle network errors gracefully', async () => {
    mockAddDoc.mockRejectedValue(new Error('Network error'));
    window.sessionStorage.getItem = vi.fn().mockReturnValue(null);
    
    const { result } = renderHook(() => useTracking());
    
    await act(async () => {
      await expect(result.current.recordClick(
        'affiliate-123',
        'campaign-456',
        'https://example.com'
      )).rejects.toThrow('Network error');
    });
  });

  it('should calculate commission correctly', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ 
        affiliateId: 'affiliate-123',
        campaignId: 'campaign-456',
        commissionRate: 10,
      }),
    });
    
    const { result } = renderHook(() => useTracking());
    
    await act(async () => {
      await result.current.recordConversion(
        'affiliate-123',
        'campaign-456',
        100, // Revenue
        10   // Commission rate
      );
    });
    
    const createConversionCall = mockUseConversionVerification().createConversion.mock.calls[0];
    expect(createConversionCall[0]).toEqual(
      expect.objectContaining({
        revenue: 100,
        commissionAmount: 10, // 10% of 100
      })
    );
  });

  it('should handle invalid conversion data', async () => {
    const { result } = renderHook(() => useTracking());
    
    await act(async () => {
      await expect(result.current.recordConversion(
        '', // Empty affiliate ID
        'campaign-456',
        100,
        10
      )).rejects.toThrow();
    });
  });

  it('should detect bot traffic', async () => {
    // Mock bot user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (compatible; Googlebot/2.1)',
      writable: true,
    });
    
    mockUseAntifraud.mockReturnValue({
      validateClick: vi.fn().mockResolvedValue({
        valid: false,
        riskScore: 1.0,
        reasons: ['Bot detected'],
      }),
    });
    
    window.sessionStorage.getItem = vi.fn().mockReturnValue(null);
    
    const { result } = renderHook(() => useTracking());
    
    await act(async () => {
      await expect(result.current.recordClick(
        'affiliate-123',
        'campaign-456',
        'https://example.com'
      )).rejects.toThrow('Bot detected');
    });
  });
});