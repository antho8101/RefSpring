import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCampaigns } from '@/hooks/useCampaigns';

// Mock Firebase
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockOnSnapshot = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  getDocs: mockGetDocs,
  onSnapshot: mockOnSnapshot,
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000 })),
}));

// Mock useAuth
const mockUser = { uid: 'test-user-123' };
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('useCampaigns Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty campaigns array', () => {
    const { result } = renderHook(() => useCampaigns());
    
    expect(result.current.campaigns).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should create a new campaign successfully', async () => {
    const mockCampaignId = 'campaign-123';
    mockAddDoc.mockResolvedValue({ id: mockCampaignId });
    
    const { result } = renderHook(() => useCampaigns());
    
    const campaignData = {
      name: 'Test Campaign',
      commission: 10,
      targetUrl: 'https://example.com',
      currency: 'EUR' as const,
    };
    
    await act(async () => {
      const createdCampaign = await result.current.createCampaign(campaignData);
      expect(createdCampaign.id).toBe(mockCampaignId);
      expect(createdCampaign.name).toBe('Test Campaign');
    });
    
    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...campaignData,
        userId: mockUser.uid,
        status: 'active',
        isActive: true,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      })
    );
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Campagne créée !",
      description: "Test Campaign a été créée avec succès",
    });
  });

  it('should handle campaign creation errors', async () => {
    const error = new Error('Firebase error');
    mockAddDoc.mockRejectedValue(error);
    
    const { result } = renderHook(() => useCampaigns());
    
    const campaignData = {
      name: 'Test Campaign',
      commission: 10,
      targetUrl: 'https://example.com',
      currency: 'EUR' as const,
    };
    
    await act(async () => {
      await expect(result.current.createCampaign(campaignData))
        .rejects.toThrow('Firebase error');
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Erreur",
      description: "Impossible de créer la campagne",
      variant: "destructive",
    });
  });

  it('should update campaign successfully', async () => {
    mockUpdateDoc.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useCampaigns());
    
    const campaignId = 'campaign-123';
    const updates = {
      name: 'Updated Campaign',
      commission: 15,
    };
    
    await act(async () => {
      await result.current.updateCampaign(campaignId, updates);
    });
    
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...updates,
        updatedAt: expect.anything(),
      })
    );
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Campagne mise à jour !",
      description: "Les modifications ont été sauvegardées",
    });
  });

  it('should delete campaign successfully', async () => {
    mockDeleteDoc.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useCampaigns());
    
    const campaignId = 'campaign-123';
    
    await act(async () => {
      await result.current.deleteCampaign(campaignId);
    });
    
    expect(mockDeleteDoc).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith({
      title: "Campagne supprimée",
      description: "La campagne a été supprimée définitivement",
    });
  });

  it('should toggle campaign status', async () => {
    mockUpdateDoc.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useCampaigns());
    
    const campaignId = 'campaign-123';
    const currentStatus = true;
    
    await act(async () => {
      await result.current.toggleCampaignStatus(campaignId, currentStatus);
    });
    
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        isActive: false,
        status: 'paused',
        updatedAt: expect.anything(),
      })
    );
  });

  it('should validate campaign data before creation', async () => {
    const { result } = renderHook(() => useCampaigns());
    
    const invalidCampaignData = {
      name: '', // Empty name should be invalid
      commission: -5, // Negative commission should be invalid
      targetUrl: 'invalid-url', // Invalid URL
      currency: 'EUR' as const,
    };
    
    await act(async () => {
      await expect(result.current.createCampaign(invalidCampaignData))
        .rejects.toThrow();
    });
    
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it('should handle real-time updates via onSnapshot', () => {
    const mockUnsubscribe = vi.fn();
    mockOnSnapshot.mockImplementation((query, callback) => {
      // Simulate real-time update
      setTimeout(() => {
        callback({
          docs: [
            {
              id: 'campaign-123',
              data: () => ({
                name: 'Live Campaign',
                commission: 10,
                status: 'active',
                createdAt: { seconds: Date.now() / 1000 },
              }),
            },
          ],
        });
      }, 100);
      
      return mockUnsubscribe;
    });
    
    const { result, unmount } = renderHook(() => useCampaigns());
    
    act(() => {
      // Wait for the snapshot callback
      setTimeout(() => {
        expect(result.current.campaigns).toHaveLength(1);
        expect(result.current.campaigns[0].name).toBe('Live Campaign');
      }, 150);
    });
    
    // Cleanup should call unsubscribe
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should filter campaigns by status', async () => {
    const { result } = renderHook(() => useCampaigns());
    
    // Mock campaigns data
    const mockCampaigns = [
      { id: '1', status: 'active', isActive: true },
      { id: '2', status: 'paused', isActive: false },
      { id: '3', status: 'active', isActive: true },
    ];
    
    await act(async () => {
      result.current.setCampaigns(mockCampaigns);
    });
    
    const activeCampaigns = result.current.getActiveCampaigns();
    expect(activeCampaigns).toHaveLength(2);
    expect(activeCampaigns.every(c => c.isActive)).toBe(true);
  });

  it('should calculate total revenue across campaigns', async () => {
    const { result } = renderHook(() => useCampaigns());
    
    // This would typically involve integration with campaign stats
    const totalRevenue = result.current.getTotalRevenue();
    expect(typeof totalRevenue).toBe('number');
    expect(totalRevenue).toBeGreaterThanOrEqual(0);
  });
});