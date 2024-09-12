import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { cryptoService } from './services/cryptoService';

dotenv.config();

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
    const analyses = await cryptoService.getAnalysisForAllCoins(coins);
    res.json({ coins: analyses });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching data' });
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
    const coins = await cryptoService.getTopCoins(10);
    console.log('Fetched coins:', coins); // Debug log

    const analyses = await cryptoService.getAnalysisForAllCoins(coins);
    console.log('Analyses:', analyses); // Debug log

    const buyRecommendations = analyses
      .filter(a => a.prediction === 'Buy')
      .sort((a, b) => b.histogram - a.histogram)
      .slice(0, 3);

    const sellRecommendations = analyses
      .filter(a => a.prediction === 'Sell')
      .sort((a, b) => a.histogram - b.histogram)
      .slice(0, 3);

    console.log('Buy recommendations:', buyRecommendations); // Debug log
    console.log('Sell recommendations:', sellRecommendations); // Debug log

    res.json({ buyRecommendations, sellRecommendations });
  } catch (error) {
    console.error('Error in /api/top-recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch top recommendations', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/coin/:id', async (req: Request, res: Response) => {
  try {
    const coinId = req.params.id;
    const historicalData = await cryptoService.getHistoricalData(coinId, '1M', '15m');
    res.json(historicalData);
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