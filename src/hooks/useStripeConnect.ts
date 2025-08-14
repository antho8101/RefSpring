import { useState } from 'react';

export interface StripeConnectAccount {
  accountId: string;
  email: string;
  created: number;
  capabilities: any;
  charges_enabled: boolean;
  payouts_enabled: boolean;
}

export interface StripeConnectLink {
  onboardingUrl: string;
  accountId: string;
  expiresAt: number;
}

export interface StripeTransfer {
  transferId: string;
  amount: number;
  currency: string;
  destination: string;
  status: string;
  created: number;
  description: string;
}

export const useStripeConnect = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConnectAccount = async (
    affiliateEmail: string,
    affiliateName: string,
    country: string = 'FR'
  ): Promise<StripeConnectAccount> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 STRIPE CONNECT: Creating account for:', affiliateEmail);

      const response = await fetch('/api/stripe/create-connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          affiliateEmail,
          affiliateName,
          country,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du compte');
      }

      const accountData = await response.json();
      console.log('✅ STRIPE CONNECT: Account created:', accountData.accountId);
      
      return accountData;
    } catch (err: any) {
      console.error('❌ STRIPE CONNECT: Error creating account:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createAccountLink = async (
    accountId: string,
    affiliateId?: string,
    refreshUrl?: string,
    returnUrl?: string
  ): Promise<StripeConnectLink> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 STRIPE CONNECT: Creating account link for:', accountId);

      const response = await fetch('/api/stripe/create-account-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          affiliateId,
          refreshUrl,
          returnUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du lien');
      }

      const linkData = await response.json();
      console.log('✅ STRIPE CONNECT: Account link created');
      
      return linkData;
    } catch (err: any) {
      console.error('❌ STRIPE CONNECT: Error creating account link:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTransfer = async (
    accountId: string,
    amount: number,
    description?: string,
    metadata?: Record<string, string>
  ): Promise<StripeTransfer> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 STRIPE CONNECT: Creating transfer:', {
        accountId,
        amount: amount / 100,
      });

      const response = await fetch('/api/stripe/create-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          amount,
          description,
          metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du transfer');
      }

      const transferData = await response.json();
      console.log('✅ STRIPE CONNECT: Transfer created:', transferData.transferId);
      
      return transferData;
    } catch (err: any) {
      console.error('❌ STRIPE CONNECT: Error creating transfer:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createConnectAccount,
    createAccountLink,
    createTransfer,
    loading,
    error,
  };
};