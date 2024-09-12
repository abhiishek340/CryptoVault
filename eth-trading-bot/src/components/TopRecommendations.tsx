import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Heading, SimpleGrid, Card, CardHeader, CardBody, Text, Spinner, Button, Badge, Switch, Tooltip } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Legend);

interface CoinAnalysis {
  id: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  macd: number;
  signal: number;
  histogram: number;
  sma20: number;
  sma50: number;
  prediction: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  rsi: number;
}

interface HistoricalData {
  priceUsd: string;
  time: number;
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

const RecommendationCard: React.FC<{ coin: CoinAnalysis; onClick: () => void }> = ({ coin, onClick }) => (
  <Card onClick={onClick} cursor="pointer" _hover={{ boxShadow: 'xl' }} transition="all 0.2s">
    <CardHeader>
      <Heading size="md">{coin.name} ({coin.id})</Heading>
    </CardHeader>
    <CardBody>
      <Text fontSize="2xl" fontWeight="bold">${coin.current_price.toFixed(2)}</Text>
      <Badge colorScheme={coin.price_change_percentage_24h >= 0 ? 'green' : 'red'}>
        {coin.price_change_percentage_24h.toFixed(2)}%
      </Badge>
      <Text mt={2}>MACD: {coin.macd.toFixed(4)}</Text>
      <Text>Signal: {coin.signal.toFixed(4)}</Text>
      <Text>RSI: {coin.rsi.toFixed(2)}</Text>
      <Text fontWeight="bold" color={getPredictionColor(coin.prediction)} mt={2}>
        {coin.prediction}
      </Text>
    </CardBody>
  </Card>
);

const TopRecommendations: React.FC = () => {
  const [buyRecommendations, setBuyRecommendations] = useState<CoinAnalysis[]>([]);
  const [sellRecommendations, setSellRecommendations] = useState<CoinAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [showBuyRecommendations, setShowBuyRecommendations] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get<{ coins: CoinAnalysis[] }>('http://localhost:3001/api/coins-with-analysis');
        const allCoins = response.data.coins;
        console.log('All coins:', allCoins); // Debug log

        const buyRecommendations = allCoins
          .filter(coin => ['Buy', 'Strong Buy'].includes(coin.prediction))
          .sort((a, b) => b.histogram - a.histogram)
          .slice(0, 3);

        const sellRecommendations = allCoins
          .filter(coin => ['Sell', 'Strong Sell'].includes(coin.prediction))
          .sort((a, b) => a.histogram - b.histogram)
          .slice(0, 3);

        console.log('Buy recommendations:', buyRecommendations); // Debug log
        console.log('Sell recommendations:', sellRecommendations); // Debug log

        setBuyRecommendations(buyRecommendations);
        setSellRecommendations(sellRecommendations);

        if (buyRecommendations.length === 0 && sellRecommendations.length === 0) {
          console.log('No recommendations found. Showing top and bottom 3 coins based on histogram.');
          const topCoins = allCoins.sort((a, b) => b.histogram - a.histogram).slice(0, 3);
          const bottomCoins = allCoins.sort((a, b) => a.histogram - b.histogram).slice(0, 3);
          setBuyRecommendations(topCoins);
          setSellRecommendations(bottomCoins);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError('Failed to fetch recommendations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
    const interval = setInterval(fetchRecommendations, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchCoinData = async (coinId: string) => {
    try {
      setIsChartLoading(true);
      const response = await axios.get<HistoricalData[]>(`http://localhost:3001/api/coin/${coinId}`);
      const data = response.data;

      const labels = data.map((item: HistoricalData) => new Date(item.time).toLocaleTimeString());
      const prices = data.map((item: HistoricalData) => parseFloat(item.priceUsd));

      setChartData({
        labels,
        datasets: [
          {
            label: 'Price (USD)',
            data: prices,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      });
      setSelectedCoin(coinId);
    } catch (error) {
      console.error('Error fetching coin data:', error);
      setError('Failed to fetch coin data. Please try again later.');
    } finally {
      setIsChartLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner size="xl" />;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  const displayedRecommendations = showBuyRecommendations ? buyRecommendations : sellRecommendations;

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>Top Recommendations</Heading>
      <Box mb={4}>
        <Switch 
          isChecked={showBuyRecommendations} 
          onChange={() => setShowBuyRecommendations(!showBuyRecommendations)}
          mr={2}
        />
        <Text as="span">{showBuyRecommendations ? 'Buy' : 'Sell'} Recommendations</Text>
      </Box>
      <SimpleGrid columns={[1, 2, 3]} spacing={4} mb={8}>
        {displayedRecommendations.length > 0 ? (
          displayedRecommendations.map(coin => (
            <RecommendationCard key={coin.id} coin={coin} onClick={() => fetchCoinData(coin.id)} />
          ))
        ) : (
          <Text>No {showBuyRecommendations ? 'buy' : 'sell'} recommendations available</Text>
        )}
      </SimpleGrid>

      {selectedCoin && (
        <Box mt={8} p={4} borderWidth={1} borderRadius="lg">
          <Heading as="h3" size="md" mb={4}>Price Chart for {selectedCoin}</Heading>
          {isChartLoading ? (
            <Spinner size="xl" />
          ) : chartData ? (
            <Line 
              data={chartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: `${selectedCoin} Price History`,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                        }
                        return label;
                      }
                    }
                  }
                },
              }} 
            />
          ) : (
            <Text>No chart data available</Text>
          )}
          <Button mt={4} onClick={() => setSelectedCoin(null)}>Close Chart</Button>
        </Box>
      )}
    </Box>
  );
};

export default TopRecommendations;