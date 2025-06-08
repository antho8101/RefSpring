
import { useState, useEffect } from 'react';
import { exchangeRateService } from '@/services/exchangeRateService';

interface ExchangeRates {
  [currency: string]: number;
}

export const useExchangeRates = () => {
  const [rates, setRates] = useState<ExchangeRates>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const newRates = await exchangeRateService.getExchangeRates();
      setRates(newRates);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    
    // Actualiser toutes les heures
    const interval = setInterval(fetchRates, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string): number => {
    return exchangeRateService.convertAmount(amount, fromCurrency, toCurrency, rates);
  };

  return {
    rates,
    loading,
    lastUpdated,
    convertAmount,
    refreshRates: fetchRates
  };
};
