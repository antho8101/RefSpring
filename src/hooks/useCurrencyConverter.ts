
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useExchangeRates } from '@/hooks/useExchangeRates';

export const useCurrencyConverter = () => {
  const { formatCurrency, formatCurrencyCompact, userCurrency } = useCurrencyFormatter();
  const { convertAmount, rates, loading } = useExchangeRates();

  const convertAndFormat = (amount: number, fromCurrency = 'EUR'): string => {
    if (loading || !rates || Object.keys(rates).length === 0) {
      return formatCurrency(amount, fromCurrency);
    }

    const convertedAmount = convertAmount(amount, fromCurrency, userCurrency);
    return formatCurrency(convertedAmount, userCurrency);
  };

  const convertAndFormatCompact = (amount: number, fromCurrency = 'EUR'): string => {
    if (loading || !rates || Object.keys(rates).length === 0) {
      return formatCurrencyCompact(amount, fromCurrency);
    }

    const convertedAmount = convertAmount(amount, fromCurrency, userCurrency);
    return formatCurrencyCompact(convertedAmount, userCurrency);
  };

  return {
    convertAndFormat,
    convertAndFormatCompact,
    formatCurrency,
    formatCurrencyCompact,
    userCurrency,
    loading,
    rates
  };
};
