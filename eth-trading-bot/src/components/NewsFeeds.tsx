import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Heading, Text, VStack, HStack, Link, Spinner } from '@chakra-ui/react';

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

const NewsFeeds: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Using the free Crypto Panic API for news
        const response = await axios.get('https://cryptopanic.com/api/v1/posts/?auth_token=YOUR_API_KEY&kind=news');
        setNews(response.data.results);
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('Failed to fetch news. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (isLoading) {
    return <Spinner size="xl" />;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>Crypto News</Heading>
      <VStack spacing={4} align="stretch">
        {news.map((item, index) => (
          <Box key={index} p={4} borderWidth={1} borderRadius="md">
            <Link href={item.url} isExternal>
              <Heading size="md">{item.title}</Heading>
            </Link>
            <HStack justify="space-between" mt={2}>
              <Text fontSize="sm" color="gray.500">{item.source}</Text>
              <Text fontSize="sm" color="gray.500">{new Date(item.publishedAt).toLocaleString()}</Text>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default NewsFeeds;