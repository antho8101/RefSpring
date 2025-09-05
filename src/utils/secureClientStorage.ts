/**
 * 🔒 Secure Client-Side Storage - Enhanced encryption and data protection
 * Replaces insecure localStorage/sessionStorage usage with encrypted alternatives
 */

import { useEncryption } from '@/hooks/crypto/useEncryption';
import { useSignature } from '@/hooks/crypto/useSignature';

// Secure storage interface
interface SecureStorageData {
  data: string;
  signature: string;
  timestamp: number;
  expiresAt?: number;
}

class SecureClientStorage {
  private encryption: ReturnType<typeof useEncryption>;
  private signature: ReturnType<typeof useSignature>;

  constructor() {
    // Initialize crypto hooks
    this.encryption = useEncryption();
    this.signature = useSignature();
  }

  /**
   * Securely store data with encryption and expiration
   */
  setSecure(key: string, data: any, expirationHours: number = 24): void {
    try {
      const timestamp = Date.now();
      const expiresAt = timestamp + (expirationHours * 60 * 60 * 1000);
      
      // Encrypt the data
      const encryptedData = this.encryption.encrypt(data);
      
      // Sign the encrypted data for integrity
      const signature = this.signature.signData({
        data: encryptedData,
        timestamp,
        expiresAt
      });

      const secureData: SecureStorageData = {
        data: encryptedData,
        signature,
        timestamp,
        expiresAt
      };

      localStorage.setItem(`secure_${key}`, JSON.stringify(secureData));
      console.log(`🔒 SECURE STORAGE: Data stored securely for key: ${key}`);
      
    } catch (error) {
      console.error('🔒 SECURE STORAGE ERROR: Failed to store data:', error);
    }
  }

  /**
   * Retrieve and decrypt data with validation
   */
  getSecure<T = any>(key: string): T | null {
    try {
      const storedData = localStorage.getItem(`secure_${key}`);
      if (!storedData) return null;

      const secureData: SecureStorageData = JSON.parse(storedData);
      
      // Check expiration
      if (secureData.expiresAt && Date.now() > secureData.expiresAt) {
        this.removeSecure(key);
        console.log(`🔒 SECURE STORAGE: Data expired and removed for key: ${key}`);
        return null;
      }

      // Verify signature
      const isValid = this.signature.verifySignature({
        data: secureData.data,
        timestamp: secureData.timestamp,
        expiresAt: secureData.expiresAt
      }, secureData.signature);

      if (!isValid) {
        console.warn('🔒 SECURE STORAGE: Invalid signature detected, removing data');
        this.removeSecure(key);
        return null;
      }

      // Decrypt data
      const decryptedData = this.encryption.decrypt(secureData.data);
      return decryptedData as T;
      
    } catch (error) {
      console.error('🔒 SECURE STORAGE ERROR: Failed to retrieve data:', error);
      this.removeSecure(key);
      return null;
    }
  }

  /**
   * Remove data securely
   */
  removeSecure(key: string): void {
    localStorage.removeItem(`secure_${key}`);
  }

  /**
   * Clean expired data
   */
  cleanExpiredData(): void {
    const keys = Object.keys(localStorage);
    let cleaned = 0;

    keys.forEach(key => {
      if (key.startsWith('secure_')) {
        try {
          const storedData = localStorage.getItem(key);
          if (storedData) {
            const secureData: SecureStorageData = JSON.parse(storedData);
            if (secureData.expiresAt && Date.now() > secureData.expiresAt) {
              localStorage.removeItem(key);
              cleaned++;
            }
          }
        } catch (error) {
          // Remove corrupted data
          localStorage.removeItem(key);
          cleaned++;
        }
      }
    });

    if (cleaned > 0) {
      console.log(`🔒 SECURE STORAGE: Cleaned ${cleaned} expired/corrupted entries`);
    }
  }

  /**
   * Store sensitive authentication data temporarily
   */
  setAuthData(key: string, data: any, expirationMinutes: number = 60): void {
    this.setSecure(`auth_${key}`, data, expirationMinutes / 60);
  }

  /**
   * Get sensitive authentication data
   */
  getAuthData<T = any>(key: string): T | null {
    return this.getSecure<T>(`auth_${key}`);
  }

  /**
   * Store campaign data securely
   */
  setCampaignData(key: string, data: any, expirationHours: number = 48): void {
    this.setSecure(`campaign_${key}`, data, expirationHours);
  }

  /**
   * Get campaign data
   */
  getCampaignData<T = any>(key: string): T | null {
    return this.getSecure<T>(`campaign_${key}`);
  }
}

// Create and export singleton instance
export const secureStorage = new SecureClientStorage();

// Auto-cleanup on initialization
if (typeof window !== 'undefined') {
  // Clean expired data on startup
  secureStorage.cleanExpiredData();
  
  // Set up periodic cleanup (every 30 minutes)
  setInterval(() => {
    secureStorage.cleanExpiredData();
  }, 30 * 60 * 1000);
}