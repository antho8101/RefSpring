
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'fr-FR' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' }
};

export const useCurrencyFormatter = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();

  // Récupérer la devise préférée de l'utilisateur (ou EUR par défaut)
  const userCurrency = (user as any)?.currency || 'EUR';
  const currencyInfo = SUPPORTED_CURRENCIES[userCurrency];

  const formatCurrency = (amount: number, currency?: string): string => {
    const targetCurrency = currency || userCurrency;
    const targetInfo = SUPPORTED_CURRENCIES[targetCurrency];
    
    if (!targetInfo) {
      console.warn(`Unsupported currency: ${targetCurrency}, falling back to EUR`);
      return formatCurrency(amount, 'EUR');
    }

    // Utiliser la locale de la langue actuelle si possible
    let locale = targetInfo.locale;
    if (i18n.language === 'fr') locale = 'fr-FR';
    else if (i18n.language === 'en') locale = 'en-US';
    else if (i18n.language === 'es') locale = 'es-ES';
    else if (i18n.language === 'zh') locale = 'zh-CN';
    else if (i18n.language === 'ru') locale = 'ru-RU';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: targetCurrency === 'JPY' ? 0 : 2,
      maximumFractionDigits: targetCurrency === 'JPY' ? 0 : 2,
    }).format(amount);
  };

  const formatCurrencyCompact = (amount: number, currency?: string): string => {
    const targetCurrency = currency || userCurrency;
    const targetInfo = SUPPORTED_CURRENCIES[targetCurrency];
    
    if (!targetInfo) {
      return formatCurrencyCompact(amount, 'EUR');
    }

    if (amount >= 1000000) {
      return formatCurrency(amount / 1000000, targetCurrency) + 'M';
    } else if (amount >= 1000) {
      return formatCurrency(amount / 1000, targetCurrency) + 'K';
    }
    
    return formatCurrency(amount, targetCurrency);
  };

  return {
    formatCurrency,
    formatCurrencyCompact,
    userCurrency,
    currencyInfo,
    supportedCurrencies: SUPPORTED_CURRENCIES
  };
};
