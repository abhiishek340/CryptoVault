import React, { useState } from 'react';
import { Box, Button, Input, Text, VStack } from '@chakra-ui/react';
import axios from 'axios';

const TradingSimulation: React.FC = () => {
  const [initialInvestment, setInitialInvestment] = useState<number>(1000);
  const [result, setResult] = useState<{ finalPortfolioValue: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/simulate-trading', { initialInvestment });
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
        <Button onClick={runSimulation} isLoading={isLoading}>
          Run Simulation
        </Button>
        {result && (
          <Box>
            <Text>Final Portfolio Value: ${result.finalPortfolioValue.toFixed(2)}</Text>
            <Text>Profit/Loss: ${(result.finalPortfolioValue - initialInvestment).toFixed(2)}</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default TradingSimulation;