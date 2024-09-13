import React, { useState } from 'react';
import { Box, Heading, SimpleGrid, Card, CardHeader, CardBody, Text, Spinner, Badge, Switch, Flex } from '@chakra-ui/react';

interface CoinAnalysis {
  id: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  prediction: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  histogram: number;
}

interface TopRecommendationsProps {
  buyRecommendations: CoinAnalysis[];
  sellRecommendations: CoinAnalysis[];
  loading: boolean;
}

const TopRecommendations: React.FC<TopRecommendationsProps> = ({ buyRecommendations, sellRecommendations, loading }) => {
  const [showBuyRecommendations, setShowBuyRecommendations] = useState(true);

  if (loading) {
    return <Spinner size="xl" />;
  }

  const renderRecommendations = (recommendations: CoinAnalysis[]) => (
    <SimpleGrid columns={[1, 2, 3]} spacing={4}>
      {recommendations.length > 0 ? (
        recommendations.map(coin => (
          <Card key={coin.id}>
            <CardHeader>
              <Heading size="sm">{coin.name}</Heading>
            </CardHeader>
            <CardBody>
              <Text>${coin.current_price.toFixed(2)}</Text>
              <Badge colorScheme={coin.price_change_percentage_24h >= 0 ? 'green' : 'red'}>
                {coin.price_change_percentage_24h.toFixed(2)}%
              </Badge>
              <Text mt={2}>Prediction: {coin.prediction}</Text>
            </CardBody>
          </Card>
        ))
      ) : (
        <Text>No recommendations available</Text>
      )}
    </SimpleGrid>
  );

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>Top Recommendations</Heading>
      <Flex align="center" mb={4}>
        <Text mr={2}>Sell</Text>
        <Switch 
          isChecked={showBuyRecommendations}
          onChange={() => setShowBuyRecommendations(!showBuyRecommendations)}
        />
        <Text ml={2}>Buy</Text>
      </Flex>
      {showBuyRecommendations ? 
        renderRecommendations(buyRecommendations) : 
        renderRecommendations(sellRecommendations)
      }
    </Box>
  );
};

export default TopRecommendations;