import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Text } from '@chakra-ui/react';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface Analysis {
  id: string;
  macd: number;
  signal: number;
  histogram: number;
}

const CryptoTracker: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [analyses, setAnalyses] = useState<{ [key: string]: Analysis }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<Coin[]>('http://localhost:3001/api/coins');
        setCoins(response.data);

        const analysisPromises = response.data.map(coin =>
          axios.get<Analysis>(`http://localhost:3001/api/analysis/${coin.id}`)
        );
        const analysisResponses = await Promise.all(analysisPromises);
        const newAnalyses = analysisResponses.reduce((acc, response) => {
          acc[response.data.id] = response.data;
          return acc;
        }, {} as { [key: string]: Analysis });
        setAnalyses(newAnalyses);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <Box p={4}>
      <Heading mb={4}>Crypto Tracker</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Price (USD)</Th>
            <Th>24h Change</Th>
            <Th>MACD</Th>
            <Th>Signal</Th>
            <Th>Histogram</Th>
            <Th>Recommendation</Th>
          </Tr>
        </Thead>
        <Tbody>
          {coins.map(coin => (
            <Tr key={coin.id}>
              <Td>{coin.name}</Td>
              <Td>${coin.current_price.toFixed(2)}</Td>
              <Td>{coin.price_change_percentage_24h.toFixed(2)}%</Td>
              <Td>{analyses[coin.id]?.macd.toFixed(4)}</Td>
              <Td>{analyses[coin.id]?.signal.toFixed(4)}</Td>
              <Td>{analyses[coin.id]?.histogram.toFixed(4)}</Td>
              <Td>
                {analyses[coin.id]?.histogram > 0 ? (
                  <Text color="green.500">Buy</Text>
                ) : (
                  <Text color="red.500">Sell</Text>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default CryptoTracker;