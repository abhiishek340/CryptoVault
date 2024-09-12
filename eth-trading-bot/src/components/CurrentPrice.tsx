import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Text } from '@chakra-ui/react';

const CurrentPrice: React.FC = () => {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/current-price');
        setPrice(response.data.price);
      } catch (error) {
        console.error('Error fetching ETH price:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold">
        Current ETH Price: {price ? `$${price.toFixed(2)}` : 'Loading...'}
      </Text>
    </Box>
  );
};

export default CurrentPrice;