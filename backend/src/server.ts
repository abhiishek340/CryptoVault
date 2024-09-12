import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getCurrentPrice, getHistoricalData, simulateTrading } from './services/ethService';
import dns from 'dns';

dotenv.config();

dns.setServers(['8.8.8.8', '8.8.4.4']); // Google's public DNS servers

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/current-price', async (req, res) => {
  try {
    const price = await getCurrentPrice();
    res.json({ price });
  } catch (error) {
    console.error('Error in /api/current-price:', error);
    res.status(500).json({ error: 'Failed to fetch current price', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/historical-data', async (req, res) => {
  try {
    const data = await getHistoricalData();
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