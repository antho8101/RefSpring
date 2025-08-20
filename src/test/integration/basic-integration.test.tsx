import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/CopyButton';

describe('Basic Integration Tests', () => {
  it('should render UI components together', () => {
    const mockSetCopiedItems = vi.fn();
    
    render(
      <div>
        <Button>Test Button</Button>
        <CopyButton
          text="test text"
          itemKey="test-key"
          label="Test Label"
          copiedItems={new Set()}
          setCopiedItems={mockSetCopiedItems}
        />
      </div>
    );
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
    expect(screen.getByText('Copier')).toBeInTheDocument();
  });

  it('should handle component interactions', () => {
    const mockSetCopiedItems = vi.fn();
    
    render(
      <CopyButton
        text="integration test"
        itemKey="integration-key"
        label="Integration Test"
        copiedItems={new Set()}
        setCopiedItems={mockSetCopiedItems}
      />
    );
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});