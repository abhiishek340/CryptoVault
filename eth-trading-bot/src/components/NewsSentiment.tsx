import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Text, VStack, Heading, Spinner } from '@chakra-ui/react';

interface NewsSentimentProps {
  coinId: string;
}

const NewsSentiment: React.FC<NewsSentimentProps> = ({ coinId }) => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/news/${coinId}`);
        setNews(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('Failed to fetch news. Please try again later.');
        setLoading(false);
      }
    };

    fetchNews();
  }, [coinId]);

  if (loading) return <Spinner />;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box>
      <Heading size="md" mb={4}>Latest News and Sentiment</Heading>
      <VStack align="stretch" spacing={4}>
        {news.map((item, index) => (
          <Box key={index} p={4} borderWidth={1} borderRadius="md">
            <Text fontWeight="bold">{item.title}</Text>
            <Text mt={2}>{item.description}</Text>
            <Text mt={2} color={item.sentiment === 'positive' ? 'green.500' : item.sentiment === 'negative' ? 'red.500' : 'gray.500'}>
              Sentiment: {item.sentiment}
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default NewsSentiment;