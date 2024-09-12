import axios from 'axios';
import { MACD } from 'technicalindicators';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface HistoricalData {
  prices: [number, number][];
}

interface MACDResult {
  MACD: number;
  signal: number;
  histogram: number;
}

class CryptoService {
  private readonly API_URL = 'https://api.coingecko.com/api/v3';

  async getTopCoins(limit: number = 30): Promise<CoinData[]> {
    try {
      const response = await axios.get(`${this.API_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: false,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching top coins:', error.message);
        console.error('Response:', error.response?.data);
      } else {
        console.error('Error fetching top coins:', error);
      }
      throw new Error('Failed to fetch top coins');
    }
  }

  async getHistoricalData(coinId: string, days: number): Promise<HistoricalData> {
    try {
      const response = await axios.get(`${this.API_URL}/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching historical data for ${coinId}:`, error);
      throw new Error(`Failed to fetch historical data for ${coinId}`);
    }
  }

  calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    if (prices.length < 26) {
      throw new Error('Not enough price data to calculate MACD');
    }

    const macdInput = {
      values: prices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    };

    const macdOutput = MACD.calculate(macdInput) as MACDResult[];
    const lastMACD = macdOutput[macdOutput.length - 1];

    if (!lastMACD) {
      throw new Error('Failed to calculate MACD');
    }

    return {
      macd: lastMACD.MACD || 0,
      signal: lastMACD.signal || 0,
      histogram: lastMACD.histogram || 0,
    };
  }

  async getAnalysis(coinId: string): Promise<{ id: string; macd: number; signal: number; histogram: number }> {
    try {
      const historicalData = await this.getHistoricalData(coinId, 30);
      const prices = historicalData.prices.map(price => price[1]);
      const macdData = this.calculateMACD(prices);
      return {
        id: coinId,
        ...macdData
      };
    } catch (error) {
      console.error(`Error getting analysis for ${coinId}:`, error);
      throw new Error(`Failed to get analysis for ${coinId}`);
    }
  }
}

export const cryptoService = new CryptoService();