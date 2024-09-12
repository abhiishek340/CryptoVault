import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Text, Spinner } from '@chakra-ui/react';

interface CoinAnalysis {
  id: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  macd: number;
  signal: number;
  histogram: number;
  rsi: number;
  prediction: string;
}

const getPredictionColor = (prediction: string) => {
  switch (prediction) {
    case 'Strong Buy': return 'green.500';
    case 'Buy': return 'green.300';
    case 'Hold': return 'yellow.500';
    case 'Sell': return 'red.300';
    case 'Strong Sell': return 'red.500';
    default: return 'gray.500';
  }
};

const CryptoTracker: React.FC = () => {
  const [coins, setCoins] = useState<CoinAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get<{ coins: CoinAnalysis[] }>('http://localhost:3001/api/coins-with-analysis');
        setCoins(response.data.coins);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Heading mb={4}>Error</Heading>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading mb={4}>Crypto Tracker</Heading>
      {coins.length > 0 ? (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Price (USD)</Th>
              <Th>24h Change</Th>
              <Th>MACD</Th>
              <Th>Signal</Th>
              <Th>Histogram</Th>
              <Th>RSI</Th>
              <Th>Recommendation</Th>
            </Tr>
          </Thead>
          <Tbody>
            {coins.map(coin => (
              <Tr key={coin.id}>
                <Td>{coin.name}</Td>
                <Td>${coin.current_price.toFixed(2)}</Td>
                <Td>{coin.price_change_percentage_24h.toFixed(2)}%</Td>
                <Td>{coin.macd.toFixed(4)}</Td>
                <Td>{coin.signal.toFixed(4)}</Td>
                <Td>{coin.histogram.toFixed(4)}</Td>
                <Td>{coin.rsi.toFixed(2)}</Td>
                <Td>
                  <Text color={getPredictionColor(coin.prediction)}>
                    {coin.prediction}
                  </Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text>No data available</Text>
      )}
    </Box>
  );
};

export default CryptoTracker;