import React, { useState, useEffect } from 'react'
import { Box, Flex, Text, Button, Tabs, TabList, TabPanels, Tab, TabPanel, Spinner, Container, Alert, AlertIcon, Badge } from "@chakra-ui/react"
import axios from 'axios'
import TradingViewWidget from './TradingViewWidget'
import TechnicalAnalysis from './TechnicalAnalysis'
import NewsSentiment from './NewsSentiment'
import VolumeAnalysis from './VolumeAnalysis'

interface Crypto {
  id: string;
  name: string;
  symbol: string;
}

interface CoinDetailProps {
  crypto: Crypto;
  onClose: () => void;
}

const CoinDetail: React.FC<CoinDetailProps> = ({ crypto, onClose }) => {
  const [coinData, setCoinData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string>('');

  useEffect(() => {
    const fetchCoinData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching data for coin: ${crypto.id}`);
        const response = await axios.get(`http://localhost:3001/api/coin/${crypto.id}`);
        console.log('Response received:', response.data);
        
        if (!response.data.coinData || !response.data.historicalData) {
          throw new Error('Invalid data received from server');
        }
        
        setCoinData(response.data.coinData);
        setHistoricalData(response.data.historicalData);
        setRecommendation(response.data.recommendation || 'Hold');
        console.log('Data set successfully');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching coin data:', error);
        setError('Failed to fetch coin data. Please try again later.');
        setLoading(false);
      }
    };

    fetchCoinData();
  }, [crypto.id]);

  console.log('Rendering CoinDetail. Loading:', loading, 'Error:', error);

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'Strong Buy':
      case 'Buy':
        return 'green';
      case 'Strong Sell':
      case 'Sell':
        return 'red';
      default:
        return 'yellow';
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" centerContent>
        <Spinner size="xl" mt={20} />
        <Text mt={4}>Loading {crypto.name} data...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl">
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
        <Button mt={4} onClick={onClose}>Go Back</Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl">
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">{crypto.name} ({crypto.symbol.toUpperCase()})</Text>
          <Badge colorScheme={getRecommendationColor(recommendation)} fontSize="md">
            {recommendation}
          </Badge>
        </Box>
        <Button onClick={onClose}>Close</Button>
      </Flex>
      <Tabs>
        <TabList>
          <Tab>Chart</Tab>
          <Tab>Technical Analysis</Tab>
          <Tab>News & Sentiment</Tab>
          <Tab>Volume Analysis</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TradingViewWidget symbol={`BINANCE:${crypto.symbol.toUpperCase()}USDT`} />
          </TabPanel>
          <TabPanel>
            <TechnicalAnalysis data={historicalData} recommendation={recommendation} />
          </TabPanel>
          <TabPanel>
            <NewsSentiment coinId={crypto.id} />
          </TabPanel>
          <TabPanel>
            <VolumeAnalysis coinId={crypto.id} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default CoinDetail;