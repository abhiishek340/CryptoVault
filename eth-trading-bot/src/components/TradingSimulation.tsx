import React, { useState } from 'react';
import { Box, Button, Input, Text, VStack, HStack, Select } from '@chakra-ui/react';
import axios from 'axios';

interface SimulationResult {
  finalPortfolioValue: number;
  trades: {
    type: 'buy' | 'sell';
    price: number;
    amount: number;
    timestamp: string;
  }[];
}

const TradingSimulation: React.FC = () => {
  const [initialInvestment, setInitialInvestment] = useState<number>(1000);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [strategy, setStrategy] = useState<string>('sma');
  const [timeframe, setTimeframe] = useState<string>('1d');

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/simulate-trading', { 
        initialInvestment,
        strategy,
        timeframe
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error running simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Input
          type="number"
          value={initialInvestment}
          onChange={(e) => setInitialInvestment(Number(e.target.value))}
          placeholder="Initial Investment"
        />
        <Select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
          <option value="sma">Simple Moving Average Crossover</option>
          <option value="macd">MACD</option>
          <option value="rsi">RSI</option>
        </Select>
        <Select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
          <option value="1h">1 Hour</option>
          <option value="4h">4 Hours</option>
          <option value="1d">1 Day</option>
        </Select>
        <Button onClick={runSimulation} isLoading={isLoading}>
          Run Simulation
        </Button>
        {result && (
          <Box>
            <Text>Final Portfolio Value: ${result.finalPortfolioValue.toFixed(2)}</Text>
            <Text>Profit/Loss: ${(result.finalPortfolioValue - initialInvestment).toFixed(2)}</Text>
            <Text>Number of Trades: {result.trades.length}</Text>
            {/* You can add more detailed trade information here */}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default TradingSimulation;