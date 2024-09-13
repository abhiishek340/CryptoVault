import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { cryptoService } from './services/cryptoService';
import NodeCache from 'node-cache';
import axios from 'axios';

dotenv.config();

const cache = new NodeCache({ stdTTL: 60 }); // Cache for 60 seconds

async function getCoinData(coinId: string) {
  const cacheKey = `coin_${coinId}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`);
    cache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching coin data:', error);
    throw error;
  }
}

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000' // Allow requests from your React app
}));
app.use(express.json());

app.get('/api/current-price', async (_req: Request, res: Response) => {
  try {
    const coins = await cryptoService.getTopCoins(1);
    const price = parseFloat(coins[0].current_price.toString());
    res.json({ price });
  } catch (error) {
    console.error('Error in /api/current-price:', error);
    res.status(500).json({ error: 'Failed to fetch current price', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/historical-data', async (_req: Request, res: Response) => {
  try {
    const data = await cryptoService.getHistoricalData('bitcoin', '1M', '1d');
    if (!data || data.length === 0) {
      res.status(404).json({ error: 'Historical data not available' });
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error('Error in /api/historical-data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/coins-with-analysis', async (_req: Request, res: Response) => {
  try {
    const coins = await cryptoService.getTopCoins(10);
    console.log('Fetched coins:', coins);
    
    // Send initial response with basic coin data
    res.write(JSON.stringify({ coins }) + '\n');

    // Perform analysis asynchronously
    const analyses = await cryptoService.getAnalysisForAllCoins(coins);
    
    // Send final response with analysis data
    res.write(JSON.stringify({ analyses }) + '\n');
    res.end();
  } catch (error) {
    console.error('Error in /api/coins-with-analysis:', error);
    res.status(500).json({ error: 'An error occurred while fetching data', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/historical-data/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { timeframe, interval } = req.query;
    const data = await cryptoService.getHistoricalData(id, timeframe as string, interval as string);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching historical data' });
  }
});

app.get('/api/news/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const news = await cryptoService.getNews(id);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching news' });
  }
});

app.post('/api/simulate-trading', async (req: Request, res: Response) => {
  try {
    const { initialInvestment } = req.body;
    const result = await cryptoService.simulateTrading(initialInvestment);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while simulating trading' });
  }
});

app.get('/api/top-recommendations', async (_req: Request, res: Response) => {
  try {
    const coins = await cryptoService.getTopCoins(20);
    console.log('Fetched coins:', coins);

    const analyses = await cryptoService.getAnalysisForAllCoins(coins);
    console.log('Analyses:', analyses);

    const buyRecommendations = analyses
      .filter(a => a.prediction === 'Buy')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const sellRecommendations = analyses
      .filter(a => a.prediction === 'Sell')
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    console.log('Buy recommendations:', buyRecommendations);
    console.log('Sell recommendations:', sellRecommendations);

    res.json({ buyRecommendations, sellRecommendations });
  } catch (error) {
    console.error('Error in /api/top-recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch top recommendations', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/coin/:id', async (req: Request, res: Response) => {
  try {
    const coinId = req.params.id;
    const { timeframe = '1M' } = req.query;
    console.log(`Fetching data for coin: ${coinId}, timeframe: ${timeframe}`);
    
    const coinData = await cryptoService.getCoinData(coinId);
    console.log('Coin data fetched successfully');
    
    const historicalData = await cryptoService.getHistoricalData(coinId, timeframe as string, '1d');
    console.log('Historical data fetched successfully');
    
    console.log('Coin data sample:', JSON.stringify(coinData).slice(0, 200) + '...');
    console.log('Historical data sample:', JSON.stringify(historicalData.slice(0, 5)) + '...');
    
    res.json({ coinData, historicalData });
  } catch (error) {
    console.error(`Error fetching data for coin ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch coin data', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

const startServer = () => {
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
};

startServer();