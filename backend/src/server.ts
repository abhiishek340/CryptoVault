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

app.get('/api/current-price', async (req: Request, res: Response) => {
  try {
    const coins = await cryptoService.getTopCoins(1);
    const price = parseFloat(coins[0].priceUsd);
    res.json({ price });
  } catch (error) {
    console.error('Error in /api/current-price:', error);
    res.status(500).json({ error: 'Failed to fetch current price', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/historical-data', async (req: Request, res: Response) => {
  try {
    const data = await cryptoService.getHistoricalDataBatch(['bitcoin']);
    if (!data['bitcoin'] || data['bitcoin'].length === 0) {
      res.status(404).json({ error: 'Historical data not available' });
    } else {
      res.json(data['bitcoin']);
    }
  } catch (error) {
    console.error('Error in /api/historical-data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/coins-with-analysis', async (req: Request, res: Response) => {
  try {
    const coins = await cryptoService.getTopCoins(10);
    console.log('Fetched coins:', coins);
    const analyses = await cryptoService.getAnalysisForAllCoins(coins);
    console.log('Analyses:', analyses);
    res.json({ coins: analyses }); // Send analyses as 'coins'
  } catch (error) {
    console.error('Error in /api/coins-with-analysis:', error);
    res.status(500).json({ error: 'Failed to fetch coins and analyses', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/top-recommendations', async (req: Request, res: Response) => {
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
    const historicalData = await cryptoService.getHistoricalDataBatch([coinId], 'm15', 1);
    res.json(historicalData[coinId]);
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