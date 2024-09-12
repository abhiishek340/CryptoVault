import axios from 'axios';
import WebSocket from 'ws';
import dns from 'dns';

let currentPrice: number = 0;
let ws: WebSocket | null = null;
let wsRetryCount = 0;
const MAX_WS_RETRY = 3;

const checkDNS = (hostname: string) => {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, (err, address) => {
      if (err) {
        console.error(`DNS lookup failed for ${hostname}:`, err);
        reject(err);
      } else {
        console.log(`DNS lookup successful for ${hostname}: ${address}`);
        resolve(address);
      }
    });
  });
};

// Add this before connectWebSocket() call
(async () => {
  try {
    await checkDNS('api.binance.com');
    await checkDNS('stream.binance.com');
  } catch (error) {
    console.error('DNS check failed:', error);
  }
})();

const fetchPriceFromAPI = async (): Promise<number> => {
  try {
    const binanceResponse = await axios.get('https://api.binance.com/api/v3/ticker/price', { params: { symbol: 'ETHUSDT' } });
    console.log('Binance response:', binanceResponse.data);
    return parseFloat(binanceResponse.data.price);
  } catch (binanceError) {
    console.error('Error fetching from Binance:', binanceError);
    try {
      // Fallback to CoinGecko API
      const geckoResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      console.log('CoinGecko response:', geckoResponse.data);
      return geckoResponse.data.ethereum.usd;
    } catch (geckoError) {
      console.error('Error fetching from CoinGecko:', geckoError);
      throw new Error('Failed to fetch price from all sources');
    }
  }
};

const startPolling = () => {
  setInterval(async () => {
    try {
      currentPrice = await fetchPriceFromAPI();
      console.log('Updated price:', currentPrice);
    } catch (error) {
      console.error('Error polling price:', error);
    }
  }, 60000); // Poll every 60 seconds (1 minute)
};

const connectWebSocket = () => {
  if (wsRetryCount >= MAX_WS_RETRY) {
    console.log('Max WebSocket retry attempts reached. Falling back to polling.');
    startPolling();
    return;
  }

  ws = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');

  ws.on('open', () => {
    console.log('WebSocket connected');
  });

  ws.on('message', (data: string) => {
    const trade = JSON.parse(data);
    currentPrice = parseFloat(trade.p);
  });

  ws.on('close', () => {
    console.log('WebSocket disconnected. Reconnecting...');
    setTimeout(connectWebSocket, 5000);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    wsRetryCount++;
    ws?.close();
  });
};

connectWebSocket();

// Mock data for testing
const mockCurrentPrice = 2000 + Math.random() * 100;
const mockHistoricalData = Array.from({ length: 30 }, (_, i) => ({
  timestamp: Date.now() - i * 24 * 60 * 60 * 1000,
  price: 2000 + Math.random() * 200,
}));

export const getCurrentPrice = async (): Promise<number> => {
  if (currentPrice === 0) {
    return await fetchPriceFromAPI();
  }
  return currentPrice;
};

export const getHistoricalData = async (): Promise<any[]> => {
  // return mockHistoricalData; // Uncomment this line to use mock data
  try {
    const response = await axios.get('https://api.binance.com/api/v3/klines', {
      params: {
        symbol: 'ETHUSDT',
        interval: '1d',
        limit: 30
      }
    });
    console.log('Binance historical data response:', response.data);
    return response.data.map((item: any[]) => ({
      timestamp: item[0],
      price: parseFloat(item[4]),
    }));
  } catch (binanceError) {
    console.error('Error fetching historical data from Binance:', binanceError);
    if (axios.isAxiosError(binanceError)) {
      console.error('Binance error details:', binanceError.response?.data);
    }
    try {
      // Fallback to CoinGecko API
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=30&interval=daily');
      console.log('CoinGecko historical data response:', response.data);
      return response.data.prices.map((item: [number, number]) => ({
        timestamp: item[0],
        price: item[1],
      }));
    } catch (geckoError) {
      console.error('Error fetching historical data from CoinGecko:', geckoError);
      if (axios.isAxiosError(geckoError)) {
        console.error('CoinGecko error details:', geckoError.response?.data);
      }
      throw new Error('Failed to fetch historical data from all sources');
    }
  }
};

export const simulateTrading = async (initialInvestment: number): Promise<{ finalPortfolioValue: number }> => {
  const historicalData = await getHistoricalData();
  let portfolio = initialInvestment;
  let ethHoldings = 0;

  for (let i = 1; i < historicalData.length; i++) {
    const prevPrice = historicalData[i - 1].price;
    const currentPrice = historicalData[i].price;
    const priceChange = (currentPrice - prevPrice) / prevPrice;

    if (priceChange >= 0.05) {
      // Sell ETH
      if (ethHoldings > 0) {
        portfolio += ethHoldings * currentPrice;
        ethHoldings = 0;
      }
    } else if (priceChange <= -0.05) {
      // Buy ETH
      if (portfolio > 0) {
        const ethToBuy = portfolio / currentPrice;
        ethHoldings += ethToBuy;
        portfolio = 0;
      }
    }
  }

  // Convert remaining ETH to USD
  if (ethHoldings > 0) {
    portfolio += ethHoldings * historicalData[historicalData.length - 1].price;
  }

  return { finalPortfolioValue: portfolio };
};

// Initialize price fetching
const initializePriceFetching = async () => {
  try {
    currentPrice = await fetchPriceFromAPI();
    console.log('Initial price:', currentPrice);
    startPolling(); // Start polling for price updates
    connectWebSocket(); // Attempt to connect WebSocket as well
  } catch (error) {
    console.error('Error initializing price fetching:', error);
    startPolling(); // Fall back to polling if initial fetch fails
  }
};

initializePriceFetching();