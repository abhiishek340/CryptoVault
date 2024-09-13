import axios, { AxiosResponse } from 'axios';
import { MACD, RSI, BollingerBands } from 'technicalindicators';
import { analyzeSentiment } from './sentimentAnalysis';
import NodeCache from 'node-cache';

class CryptoService {
  private readonly API_URL = 'https://api.coingecko.com/api/v3';
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_INTERVAL = 10000; // 10 seconds between requests
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes
  }

  private async delayIfNeeded() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const delay = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    this.lastRequestTime = Date.now();
  }

  private async apiRequest<T>(url: string, params: any = {}): Promise<T> {
    const cacheKey = `${url}${JSON.stringify(params)}`;
    const cachedData = this.cache.get<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    await this.delayIfNeeded();
    try {
      const response: AxiosResponse<T> = await axios.get(url, { params });
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        console.log('Rate limit reached. Waiting before retrying...');
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 1 minute
        return this.apiRequest<T>(url, params); // Retry the request
      }
      throw error;
    }
  }

  async getTopCoins(limit: number = 10) {
    return this.apiRequest<any[]>(`${this.API_URL}/coins/markets`, {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: limit,
      page: 1,
      sparkline: true
    });
  }

  async getHistoricalData(id: string, timeframe: string, interval: string) {
    const days = timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 365;
    const data = await this.apiRequest<number[][]>(`${this.API_URL}/coins/${id}/ohlc`, {
      vs_currency: 'usd',
      days: days
    });
    return data.map((d: number[]) => ({
      time: d[0],
      open: d[1],
      high: d[2],
      low: d[3],
      close: d[4]
    }));
  }

  async getAnalysisForAllCoins(coins: any[]): Promise<any[]> {
    return Promise.all(coins.map(async (coin) => {
      try {
        const historicalData = await this.getHistoricalData(coin.id, '30d', '1d');
        const prices = historicalData.map((data: any) => data.close);
        
        // Calculate RSI
        const rsiPeriod = 14;
        const rsi = RSI.calculate({ values: prices, period: rsiPeriod });
        const latestRSI = rsi[rsi.length - 1];

        // Calculate MACD
        const macdInput = {
          values: prices,
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
          SimpleMAOscillator: false,
          SimpleMASignal: false
        };
        const macd = MACD.calculate(macdInput);
        const latestMACD = macd[macd.length - 1];

        // Determine prediction based on technical indicators
        let prediction = 'Hold';
        if (latestRSI < 40 && latestMACD && latestMACD.histogram && latestMACD.histogram > 0) {
          prediction = 'Buy';
        } else if (latestRSI > 60 && latestMACD && latestMACD.histogram && latestMACD.histogram < 0) {
          prediction = 'Sell';
        }

        // Calculate a simple score for sorting
        const score = (70 - latestRSI) + ((latestMACD && latestMACD.histogram ? latestMACD.histogram : 0) * 100);

        console.log(`Analysis for ${coin.id}:`, { rsi: latestRSI, macd: latestMACD, prediction, score });

        return {
          ...coin,
          rsi: latestRSI,
          macd: latestMACD ? latestMACD.MACD : null,
          signal: latestMACD ? latestMACD.signal : null,
          histogram: latestMACD ? latestMACD.histogram : null,
          prediction,
          score
        };
      } catch (error) {
        console.error(`Error analyzing coin ${coin.id}:`, error);
        return {
          ...coin,
          error: 'Failed to analyze'
        };
      }
    }));
  }

  async getNews(id: string) {
    // This is a mock implementation. In a real-world scenario, you'd integrate with a news API.
    return [
      { title: `${id} price surges`, url: 'https://example.com', sentiment: 'positive' },
      { title: `${id} faces regulatory challenges`, url: 'https://example.com', sentiment: 'negative' },
      { title: `New ${id} partnership announced`, url: 'https://example.com', sentiment: 'positive' },
    ];
  }

  async simulateTrading(initialInvestment: number) {
    // This is a mock implementation. In a real-world scenario, you'd implement a more sophisticated trading simulation.
    const finalValue = initialInvestment * (1 + (Math.random() - 0.5) * 0.2); // Random return between -10% and +10%
    return {
      finalPortfolioValue: finalValue,
      profit: finalValue - initialInvestment
    };
  }

  async getCoinData(id: string) {
    const coinData = await this.apiRequest<any>(`${this.API_URL}/coins/${id}`);
    const historicalData = await this.getHistoricalData(id, '30d', '1d');
    const recommendation = this.generateRecommendation(historicalData);
    return { coinData, historicalData, recommendation };
  }

  private generateRecommendation(historicalData: any[]): string {
    // Implement your recommendation logic here
    // This is a simplified example
    const prices = historicalData.map(d => d.close);
    const rsi = RSI.calculate({ values: prices, period: 14 });
    const latestRSI = rsi[rsi.length - 1];

    if (latestRSI < 30) return 'Strong Buy';
    if (latestRSI < 40) return 'Buy';
    if (latestRSI > 70) return 'Strong Sell';
    if (latestRSI > 60) return 'Sell';
    return 'Hold';
  }
}

export const cryptoService = new CryptoService();