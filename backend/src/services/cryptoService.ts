import axios from 'axios';
import { MACD, SMA } from 'technicalindicators';
import NodeCache from 'node-cache';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
}

interface HistoricalData {
  priceUsd: string;
  time: number;
}

interface Analysis {
  macd: number;
  signal: number;
  histogram: number;
}

type Prediction = 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';

interface CoinAnalysis extends Analysis {
  id: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  sma20: number;
  sma50: number;
  prediction: Prediction;
  rsi: number;
}

const cache = new NodeCache({ stdTTL: 60 });
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STABLE_COINS = ['tether', 'usd-coin', 'binance-usd', 'dai', 'trueusd', 'paxos-standard'];

class CryptoService {
  private readonly COINCAP_API_URL = 'https://api.coincap.io/v2';
  private readonly COINLORE_API_URL = 'https://api.coinlore.net/api';
  private lastRequestTime: number = 0;
  private useBackupApi: boolean = false;

  private async rateLimitedRequest(url: string, params?: any) {
    const now = Date.now();
    const timeElapsed = now - this.lastRequestTime;
    if (timeElapsed < 1000) {
      await sleep(1000 - timeElapsed);
    }
    this.lastRequestTime = Date.now();
    return axios.get(url, { params });
  }

  async getTopCoins(limit: number = 10): Promise<CoinData[]> {
    const cacheKey = `topCoins_${limit}`;
    const cachedData = cache.get<CoinData[]>(cacheKey);
    if (cachedData) return cachedData;

    try {
      let data;
      if (!this.useBackupApi) {
        const response = await this.rateLimitedRequest(`${this.COINCAP_API_URL}/assets`, { limit: limit + STABLE_COINS.length });
        data = response.data.data.filter((coin: CoinData) => !STABLE_COINS.includes(coin.id));
      } else {
        const response = await this.rateLimitedRequest(`${this.COINLORE_API_URL}/tickers`, { limit: limit + STABLE_COINS.length });
        data = response.data
          .filter((coin: any) => !STABLE_COINS.includes(coin.id.toLowerCase()))
          .map((coin: any) => ({
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            priceUsd: coin.price_usd,
            changePercent24Hr: coin.percent_change_24h
          }));
      }
      data = data.slice(0, limit);
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      if (!this.useBackupApi) {
        console.warn('CoinCap API failed, switching to CoinLore');
        this.useBackupApi = true;
        return this.getTopCoins(limit);
      }
      console.error('Error fetching top coins:', error);
      throw new Error('Failed to fetch top coins');
    }
  }

  async getHistoricalDataBatch(coinIds: string[], interval: string = 'd1', days: number = 30): Promise<{ [key: string]: HistoricalData[] }> {
    const end = Date.now();
    const start = end - days * 24 * 60 * 60 * 1000;
    const result: { [key: string]: HistoricalData[] } = {};

    for (const coinId of coinIds) {
      const cacheKey = `historicalData_${coinId}_${interval}_${days}`;
      const cachedData = cache.get<HistoricalData[]>(cacheKey);
      if (cachedData) {
        result[coinId] = cachedData;
        continue;
      }

      try {
        if (!this.useBackupApi) {
          const response = await this.rateLimitedRequest(`${this.COINCAP_API_URL}/assets/${coinId}/history`, { interval, start, end });
          result[coinId] = response.data.data;
        } else {
          // CoinLore doesn't provide historical data, so we'll return an empty array
          console.warn(`Historical data not available for ${coinId} when using backup API`);
          result[coinId] = [];
        }
        cache.set(cacheKey, result[coinId]);
      } catch (error) {
        console.error(`Error fetching historical data for ${coinId}:`, error);
        if (!this.useBackupApi) {
          console.warn('CoinCap API failed, switching to CoinLore');
          this.useBackupApi = true;
          // Retry with backup API
          return this.getHistoricalDataBatch(coinIds, interval, days);
        }
        result[coinId] = [];
      }
    }

    return result;
  }

  calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } | null {
    if (prices.length < 26) {
      console.warn('Not enough price data to calculate MACD');
      return null;
    }

    const macdInput = {
      values: prices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    };

    const macdOutput = MACD.calculate(macdInput);
    const lastMACD = macdOutput[macdOutput.length - 1];

    if (!lastMACD) {
      console.warn('Failed to calculate MACD');
      return null;
    }

    return {
      macd: lastMACD.MACD || 0,
      signal: lastMACD.signal || 0,
      histogram: lastMACD.histogram || 0,
    };
  }

  calculateSMA(prices: number[], period: number): number[] {
    return SMA.calculate({period, values: prices});
  }

  calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period) return 50; // Default to neutral if not enough data

    let gains = 0;
    let losses = 0;

    for (let i = 1; i < prices.length; i++) {
      const difference = prices[i] - prices[i - 1];
      if (difference >= 0) {
        gains += difference;
      } else {
        losses -= difference;
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const relativeStrength = avgGain / avgLoss;
    return 100 - (100 / (1 + relativeStrength));
  }

  async getAnalysisForAllCoins(coins: CoinData[]): Promise<CoinAnalysis[]> {
    const historicalData = await this.getHistoricalDataBatch(coins.map(coin => coin.id), 'm15', 1);
    
    return coins.map(coin => {
      const prices = historicalData[coin.id]?.map(data => parseFloat(data.priceUsd)) || [];
      const macdData = this.calculateMACD(prices);
      const sma20 = this.calculateSMA(prices, 20);
      const sma50 = this.calculateSMA(prices, 50);
      const rsi = this.calculateRSI(prices);
      const currentPrice = parseFloat(coin.priceUsd);
      const prediction = this.getPrediction(macdData, sma20[sma20.length - 1], sma50[sma50.length - 1], currentPrice, rsi);

      return {
        id: coin.id,
        name: coin.name,
        current_price: currentPrice,
        price_change_percentage_24h: parseFloat(coin.changePercent24Hr),
        ...(macdData || { macd: 0, signal: 0, histogram: 0 }),
        sma20: sma20[sma20.length - 1],
        sma50: sma50[sma50.length - 1],
        rsi,
        prediction
      };
    });
  }

  getPrediction(macdData: Analysis | null, sma20: number, sma50: number, currentPrice: number, rsi: number): Prediction {
    if (!macdData) return 'Hold';
    
    let score = 0;
    
    // MACD
    if (macdData.histogram > 0) {
      score += macdData.histogram > macdData.signal ? 2 : 1;
    } else {
      score -= macdData.histogram < macdData.signal ? 2 : 1;
    }
    
    // SMA
    if (currentPrice > sma20 && sma20 > sma50) {
      score += 2;
    } else if (currentPrice < sma20 && sma20 < sma50) {
      score -= 2;
    }
    
    // RSI
    if (rsi < 30) score += 2;
    else if (rsi < 45) score += 1;
    else if (rsi > 70) score -= 2;
    else if (rsi > 55) score -= 1;
    
    console.log('Prediction inputs:', { macdData, sma20, sma50, currentPrice, rsi, score });
    
    // Determine prediction based on score
    if (score >= 4) return 'Strong Buy';
    if (score >= 2) return 'Buy';
    if (score <= -4) return 'Strong Sell';
    if (score <= -2) return 'Sell';
    return 'Hold';
  }
}

export const cryptoService = new CryptoService();