import React, { useState } from 'react';
import { Box, Button, Heading, Text, VStack, HStack, Input, FormControl, FormLabel } from '@chakra-ui/react';
import axios from 'axios';

const TradingSimulation: React.FC = () => {
  const [initialInvestment, setInitialInvestment] = useState<number>(1000);
  const [simulationResult, setSimulationResult] = useState<number | null>(null);

  const runSimulation = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/simulate-trading', { initialInvestment });
      setSimulationResult(response.data.finalPortfolioValue);
    } catch (error) {
      console.error('Error running simulation:', error);
    }
  };

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>Trading Simulation</Heading>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Initial Investment (USD)</FormLabel>
          <Input
            type="number"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(Number(e.target.value))}
          />
        </FormControl>
        <Button onClick={runSimulation} colorScheme="blue">Run Simulation</Button>
        {simulationResult !== null && (
          <HStack justify="space-between">
            <Text>Final Portfolio Value:</Text>
            <Text fontWeight="bold">${simulationResult.toFixed(2)}</Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

export default TradingSimulation;