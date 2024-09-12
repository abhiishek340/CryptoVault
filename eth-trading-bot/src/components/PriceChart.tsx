import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Box, Spinner, Text } from '@chakra-ui/react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface HistoricalData {
  priceUsd: string;
  time: number;
}

const PriceChart: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get<HistoricalData[]>('http://localhost:3001/api/historical-data');
        const data = response.data;

        if (!Array.isArray(data) || data.length === 0) {
          setError('No historical data available');
          return;
        }

        const labels = data.map((item: HistoricalData) => new Date(item.time).toLocaleDateString());
        const prices = data.map((item: HistoricalData) => parseFloat(item.priceUsd));

        setChartData({
          labels,
          datasets: [
            {
              label: 'Coin Price',
              data: prices,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching historical data:', error);
        setError('Failed to fetch historical data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <Box>
      {chartData && <Line data={chartData} />}
    </Box>
  );
};

export default PriceChart;