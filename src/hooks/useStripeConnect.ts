import { useState } from 'react';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

export interface StripeConnectAccount {
  accountId: string;
  email: string;
  name: string;
  country: string;
  created: number;
}

export interface StripeConnectLink {
  url: string;
  expires_at: number;
}

export interface StripeTransfer {
  transferId: string;
  amount: number;
  currency: string;
  destination: string;
  created: number;
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
      console.log('🔄 FIREBASE STRIPE CONNECT: Creating account for:', affiliateEmail);

      const createAccount = httpsCallable(functions, 'stripeCreateConnectAccount');
      const result = await createAccount({
        affiliateEmail,
        affiliateName,
        country,
      });

      const data = result.data as StripeConnectAccount;
      console.log('✅ FIREBASE: Connect account created:', data.accountId);
      return data;
    } catch (err: any) {
      console.error('❌ FIREBASE: Error creating Connect account:', err);
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
      console.log('🔄 FIREBASE STRIPE CONNECT: Creating account link for:', accountId);

      const createLink = httpsCallable(functions, 'stripeCreateAccountLink');
      const result = await createLink({
        accountId,
        affiliateId,
        refreshUrl,
        returnUrl,
      });

      const data = result.data as StripeConnectLink;
      console.log('✅ FIREBASE: Account link created');
      return data;
    } catch (err: any) {
      console.error('❌ FIREBASE: Error creating account link:', err);
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
      console.log('🔄 FIREBASE STRIPE CONNECT: Creating transfer:', {
        accountId,
        amount: amount / 100,
      });

      const createTransferFn = httpsCallable(functions, 'stripeCreateTransfer');
      const result = await createTransferFn({
        accountId,
        amount,
        description,
        metadata,
      });

      const data = result.data as StripeTransfer;
      console.log('✅ FIREBASE: Transfer created:', data.transferId);
      return data;
    } catch (err: any) {
      console.error('❌ FIREBASE: Error creating transfer:', err);
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