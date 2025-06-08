
interface ExchangeRates {
  [currency: string]: number;
}

interface ExchangeRateResponse {
  success: boolean;
  base: string;
  date: string;
  rates: ExchangeRates;
}

const CACHE_KEY = 'exchange_rates_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 heure en millisecondes

class ExchangeRateService {
  private baseUrl = 'https://api.exchangerate-api.com/v4/latest';
  private baseCurrency = 'EUR';

  async getExchangeRates(): Promise<ExchangeRates> {
    // Vérifier le cache d'abord
    const cached = this.getCachedRates();
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${this.baseUrl}/${this.baseCurrency}`);
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data: ExchangeRateResponse = await response.json();
      
      if (!data.success) {
        throw new Error('Exchange rate API returned error');
      }

      // Inclure EUR = 1 dans les taux
      const rates = { EUR: 1, ...data.rates };
      
      // Mettre en cache
      this.setCacheRates(rates);
      
      return rates;
    } catch (error) {
      console.warn('Failed to fetch exchange rates, using fallback:', error);
      return this.getFallbackRates();
    }
  }

  convertAmount(amount: number, fromCurrency: string, toCurrency: string, rates: ExchangeRates): number {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    
    if (!fromRate || !toRate) {
      console.warn(`Missing exchange rate for ${fromCurrency} or ${toCurrency}`);
      return amount;
    }

    // Convertir vers EUR puis vers la devise cible
    const amountInEur = amount / fromRate;
    return amountInEur * toRate;
  }

  private getCachedRates(): ExchangeRates | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      if (now - timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  private setCacheRates(rates: ExchangeRates): void {
    try {
      const cacheData = {
        data: rates,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache exchange rates:', error);
    }
  }

  private getFallbackRates(): ExchangeRates {
    // Taux de change approximatifs comme fallback
    return {
      EUR: 1,
      USD: 1.1,
      GBP: 0.85,
      JPY: 160,
      CNY: 7.8,
      CAD: 1.5,
      AUD: 1.6,
      CHF: 0.95,
      RUB: 90
    };
  }
}

export const exchangeRateService = new ExchangeRateService();
