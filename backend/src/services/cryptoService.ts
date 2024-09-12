import axios from 'axios';
import { MACD, RSI, BollingerBands } from 'technicalindicators';

class CryptoService {
  private readonly API_URL = 'https://api.coingecko.com/api/v3';

  async getTopCoins(limit: number = 10) {
    const response = await axios.get(`${this.API_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: limit,
        page: 1,
        sparkline: true
      }
    });
    return response.data;
  }

  async getHistoricalData(id: string, timeframe: string, interval: string) {
    const days = timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 365;
    const response = await axios.get(`${this.API_URL}/coins/${id}/ohlc`, {
      params: {
        vs_currency: 'usd',
        days: days
      }
    });
    return response.data.map((d: number[]) => ({
      time: d[0],
      open: d[1],
      high: d[2],
      low: d[3],
      close: d[4]
    }));
  }

  async getAnalysisForAllCoins(coins: any[]) {
    return Promise.all(coins.map(async (coin) => {
      const prices = coin.sparkline_in_7d.price;
      const macd = MACD.calculate({
        values: prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false
      });
      const rsi = RSI.calculate({ values: prices, period: 14 });
      const bb = BollingerBands.calculate({
        values: prices,
        period: 20,
        stdDev: 2
      });

      // Simple recommendation logic (you may want to make this more sophisticated)
      let recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell' = 'Hold';
      const lastRSI = rsi[rsi.length - 1];
      const lastMACD = macd[macd.length - 1];

      if (lastMACD && lastRSI !== undefined && 
          typeof lastMACD.MACD === 'number' && 
          typeof lastMACD.signal === 'number') {
        if (lastRSI < 30 && lastMACD.MACD > lastMACD.signal) {
          recommendation = 'Strong Buy';
        } else if (lastRSI < 40 && lastMACD.MACD > lastMACD.signal) {
          recommendation = 'Buy';
        } else if (lastRSI > 70 && lastMACD.MACD < lastMACD.signal) {
          recommendation = 'Strong Sell';
        } else if (lastRSI > 60 && lastMACD.MACD < lastMACD.signal) {
          recommendation = 'Sell';
        }
      }

      return {
        ...coin,
        macd: lastMACD?.MACD ?? null,
        signal: lastMACD?.signal ?? null,
        histogram: lastMACD?.histogram ?? null,
        rsi: lastRSI ?? null,
        upperBB: bb[bb.length - 1]?.upper ?? null,
        middleBB: bb[bb.length - 1]?.middle ?? null,
        lowerBB: bb[bb.length - 1]?.lower ?? null,
        recommendation
      };
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
}

export const cryptoService = new CryptoService();