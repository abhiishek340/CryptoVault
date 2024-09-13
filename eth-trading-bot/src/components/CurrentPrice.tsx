import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Text, Spinner } from '@chakra-ui/react';

const CurrentPrice: React.FC = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get<{ price: number }>('http://localhost:3001/api/current-price');
        setPrice(response.data.price);
      } catch (error) {
        console.error('Error fetching current price:', error);
        setError('Failed to fetch current price. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <Spinner size="xl" />;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold">
        Current Price: ${price ? price.toFixed(2) : 'N/A'}
      </Text>
    </Box>
  );
};

export default CurrentPrice;