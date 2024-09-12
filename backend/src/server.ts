import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getCurrentPrice, getHistoricalData, simulateTrading } from './services/ethService';
import dns from 'dns';
import { cryptoService } from './services/cryptoService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000' // Allow requests from your React app
}));
app.use(express.json());

app.get('/api/current-price', async (req, res) => {
  try {
    const coins = await cryptoService.getTopCoins(1);
    const price = coins[0].current_price;
    res.json({ price });
  } catch (error) {
    console.error('Error in /api/current-price:', error);
    res.status(500).json({ error: 'Failed to fetch current price', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/historical-data', async (req, res) => {
  try {
    const data = await cryptoService.getHistoricalData('ethereum', 30);
    res.json(data);
  } catch (error) {
    console.error('Error in /api/historical-data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/simulate-trading', async (req, res) => {
  try {
    const { initialInvestment } = req.body;
    const result = await simulateTrading(initialInvestment);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/simulate-trading:', error);
    res.status(500).json({ error: 'Failed to run trading simulation', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/coins', async (req, res) => {
  try {
    const coins = await cryptoService.getTopCoins();
    res.json(coins);
  } catch (error) {
    console.error('Error in /api/coins:', error);
    res.status(500).json({ error: 'Failed to fetch coins', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/analysis/:coinId', async (req, res) => {
  try {
    const analysis = await cryptoService.getAnalysis(req.params.coinId);
    res.json(analysis);
  } catch (error) {
    console.error('Error in /api/analysis/:coinId:', error);
    res.status(500).json({ error: 'Failed to fetch analysis', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

const startServer = async () => {
  try {
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();