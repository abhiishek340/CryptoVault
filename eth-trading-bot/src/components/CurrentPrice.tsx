import React, { useState, useEffect } from 'react';
import { Box, Text, Heading } from '@chakra-ui/react';
import axios from 'axios';

const CurrentPrice: React.FC = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/current-price');
        setPrice(response.data.price);
        setError(null);
      } catch (error) {
        console.error('Error fetching ETH price:', error);
        setError('Failed to fetch current price. Please try again later.');
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Heading as="h2" size="lg">Current ETH Price</Heading>
      {error ? (
        <Text color="red.500">{error}</Text>
      ) : price ? (
        <Text fontSize="2xl" fontWeight="bold">${price.toFixed(2)}</Text>
      ) : (
        <Text>Loading...</Text>
      )}
    </Box>
  );
};

export default CurrentPrice;