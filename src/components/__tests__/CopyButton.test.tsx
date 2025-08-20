import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { CopyButton } from '@/components/CopyButton';

// Mock navigator.clipboard
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('CopyButton Component', () => {
  const mockSetCopiedItems = vi.fn();
  const defaultProps = {
    text: 'https://refspring.com/track/abc123',
    itemKey: 'test-key',
    label: 'Lien de tracking',
    copiedItems: new Set<string>(),
    setCopiedItems: mockSetCopiedItems,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
  });

  it('should render copy button with correct text', () => {
    render(<CopyButton {...defaultProps} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Copier')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('border'); // outline variant
  });

  it('should copy text to clipboard on click', async () => {
    render(<CopyButton {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockWriteText).toHaveBeenCalledWith('https://refspring.com/track/abc123');
    expect(mockSetCopiedItems).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Copié !",
        description: "Lien de tracking copié dans le presse-papiers",
      });
    });
  });

  it('should show copied state when item is copied', () => {
    const copiedItems = new Set(['test-key']);
    render(<CopyButton {...defaultProps} copiedItems={copiedItems} />);
    
    expect(screen.getByText('Copié')).toBeInTheDocument();
    expect(screen.queryByText('Copier')).not.toBeInTheDocument();
  });

  it('should handle clipboard error gracefully', async () => {
    mockWriteText.mockRejectedValue(new Error('Clipboard not available'));
    
    render(<CopyButton {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Erreur",
        description: "Impossible de copier dans le presse-papiers",
        variant: "destructive",
      });
    });
  });

  it('should reset copied state after timeout', async () => {
    vi.useFakeTimers();
    
    render(<CopyButton {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    // Fast-forward time by 2 seconds
    vi.advanceTimersByTime(2000);
    
    await waitFor(() => {
      expect(mockSetCopiedItems).toHaveBeenCalledTimes(2); // Once to set, once to reset
    });
    
    vi.useRealTimers();
  });

  it('should be accessible with proper ARIA labels', () => {
    render(<CopyButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
    // Should have descriptive text content for screen readers
    expect(button).toHaveTextContent(/copier/i);
  });

  it('should handle different item keys correctly', () => {
    const { rerender } = render(<CopyButton {...defaultProps} itemKey="key1" />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockSetCopiedItems).toHaveBeenCalled();
    
    // Test with different key
    rerender(<CopyButton {...defaultProps} itemKey="key2" />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockSetCopiedItems).toHaveBeenCalledTimes(2);
  });
});