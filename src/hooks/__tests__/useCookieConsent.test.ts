import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCookieConsent } from '@/hooks/useCookieConsent';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useCookieConsent Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('shows banner when no consent exists', () => {
    const { result } = renderHook(() => useCookieConsent());
    
    expect(result.current.showBanner).toBe(true);
    expect(result.current.hasConsented).toBe(null);
  });

  it('accepts all cookies correctly', () => {
    const { result } = renderHook(() => useCookieConsent());
    
    act(() => {
      result.current.acceptAll();
    });

    expect(result.current.hasConsented).toBe(true);
    expect(result.current.showBanner).toBe(false);
    expect(result.current.preferences).toEqual({
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    });
  });

  it('accepts only necessary cookies correctly', () => {
    const { result } = renderHook(() => useCookieConsent());
    
    act(() => {
      result.current.acceptNecessaryOnly();
    });

    expect(result.current.hasConsented).toBe(true);
    expect(result.current.showBanner).toBe(false);
    expect(result.current.preferences).toEqual({
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    });
  });

  it('resets consent correctly', () => {
    const { result } = renderHook(() => useCookieConsent());
    
    // First accept all
    act(() => {
      result.current.acceptAll();
    });

    // Then reset
    act(() => {
      result.current.resetConsent();
    });

    expect(result.current.hasConsented).toBe(null);
    expect(result.current.showBanner).toBe(true);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('refspring_cookie_consent');
  });

  it('updates preferences correctly', () => {
    const { result } = renderHook(() => useCookieConsent());
    
    const newPreferences = {
      necessary: true,
      analytics: true,
      marketing: false,
      personalization: true,
    };

    act(() => {
      result.current.updatePreferences(newPreferences);
    });

    expect(result.current.preferences).toEqual(newPreferences);
  });
});