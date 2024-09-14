import axios, { AxiosResponse } from 'axios';
import { MACD, RSI, BollingerBands } from 'technicalindicators';
import { analyzeSentiment } from './sentimentAnalysis';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';

dotenv.config();

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
    try {
      console.log(`Fetching historical data for ${id}, timeframe: ${timeframe}, interval: ${interval}`);
      const days = timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 365;
      const data = await this.apiRequest<number[][]>(`${this.API_URL}/coins/${id}/ohlc`, {
        vs_currency: 'usd',
        days: days
      });
      console.log(`Historical data fetched successfully for ${id}`);
      return data.map((d: number[]) => ({
        time: d[0],
        open: d[1],
        high: d[2],
        low: d[3],
        close: d[4]
      }));
    } catch (error) {
      console.error(`Error fetching historical data for ${id}:`, error);
      throw error;
    }
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

  async getNews(symbol: string) {
    try {
      const response = await axios.get(`https://finance.yahoo.com/quote/${symbol}/news`);
      const html = response.data;
      
      // This is a very basic way to extract news titles. In a production environment,
      // you'd want to use a proper HTML parser like cheerio.
      const newsTitles = html.match(/<h3 class="Mb\(5px\)">(.+?)<\/h3>/g)
        ?.map((match: string) => match.replace(/<\/?h3[^>]*>/g, ''))
        ?.slice(0, 5) || [];

      const newsWithSentiment = newsTitles.map((title: string) => ({
        title,
        sentiment: analyzeSentiment(title)
      }));

      return newsWithSentiment;
    } catch (error) {
      console.error(`Error fetching news for ${symbol}:`, error);
      return [];
    }
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
    try {
      console.log(`Fetching coin data for ${id}`);
      const data = await this.apiRequest<any>(`${this.API_URL}/coins/${id}`);
      console.log(`Coin data fetched successfully for ${id}`);
      return data;
    } catch (error) {
      console.error(`Error fetching coin data for ${id}:`, error);
      throw error;
    }
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

  async getVolumeData(id: string, days: number = 30) {
    try {
      console.log(`Fetching volume data for ${id}, days: ${days}`);
      const data = await this.apiRequest<any>(`${this.API_URL}/coins/${id}/market_chart`, {
        vs_currency: 'usd',
        days: days
      });
      console.log('Raw volume data:', data.total_volumes.slice(0, 5));
      const volumeData = data.total_volumes.map((item: [number, number]) => {
        const totalVolume = item[1];
        const buyVolume = totalVolume * (0.4 + Math.random() * 0.2); // Simulating buy volume (40-60% of total)
        const sellVolume = totalVolume - buyVolume;
        return {
          date: new Date(item[0]).toISOString().split('T')[0],
          buyVolume: Math.round(buyVolume),
          sellVolume: Math.round(sellVolume)
        };
      });
      console.log('Processed volume data:', volumeData.slice(0, 5));
      return volumeData;
    } catch (error) {
      console.error(`Error fetching volume data for ${id}:`, error);
      throw error;
    }
  }

  async getNewsForCoin(coinId: string) {
    try {
      const response = await axios.get(`${this.API_URL}/coins/${coinId}/status_updates`);
      const updates = response.data.status_updates;
      return updates.slice(0, 5).map((update: any) => ({
        title: update.description,
        url: update.project.public_interest_stats.news_url,
        sentiment: analyzeSentiment(update.description)
      }));
    } catch (error) {
      console.error(`Error fetching news for ${coinId}:`, error);
      return [];
    }
  }
}

export const cryptoService = new CryptoService();