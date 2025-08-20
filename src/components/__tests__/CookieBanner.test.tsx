import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils/test-utils';
import { CookieBanner } from '@/components/CookieBanner';

// Mock the hook
vi.mock('@/hooks/useCookieConsent', () => ({
  useCookieConsent: vi.fn(() => ({
    showBanner: true,
    acceptAll: vi.fn(),
    acceptNecessaryOnly: vi.fn(),
  })),
}));

describe('CookieBanner Component', () => {
  it('renders when showBanner is true', () => {
    render(<CookieBanner />);
    
    expect(screen.getByText(/respect de votre vie privée/i)).toBeInTheDocument();
    expect(screen.getByText(/nous utilisons des cookies/i)).toBeInTheDocument();
  });

  it('shows all action buttons', () => {
    render(<CookieBanner />);
    
    expect(screen.getByText(/personnaliser/i)).toBeInTheDocument();
    expect(screen.getByText(/nécessaires uniquement/i)).toBeInTheDocument();
    expect(screen.getByText(/accepter tout/i)).toBeInTheDocument();
  });

  it('shows privacy and terms links', () => {
    render(<CookieBanner />);
    
    expect(screen.getByText(/politique de confidentialité/i)).toBeInTheDocument();
    expect(screen.getByText(/conditions d'utilisation/i)).toBeInTheDocument();
  });

  it('calls acceptAll when accept all button is clicked', () => {
    const mockAcceptAll = vi.fn();
    const { useCookieConsent } = require('@/hooks/useCookieConsent');
    useCookieConsent.mockReturnValue({
      showBanner: true,
      acceptAll: mockAcceptAll,
      acceptNecessaryOnly: vi.fn(),
    });

    render(<CookieBanner />);
    
    fireEvent.click(screen.getByText(/accepter tout/i));
    expect(mockAcceptAll).toHaveBeenCalledTimes(1);
  });
});