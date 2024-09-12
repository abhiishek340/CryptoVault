import React, { useState, useEffect } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PriceChart: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/historical-data');
        const data = response.data;

        setChartData({
          labels: data.map((item: any) => new Date(item.timestamp).toLocaleDateString()),
          datasets: [
            {
              label: 'ETH Price',
              data: data.map((item: any) => item.price),
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    fetchHistoricalData();
  }, []);

  return (
    <Box width="100%" maxWidth="800px">
      <Heading as="h2" size="lg" mb={4}>ETH Price History</Heading>
      {chartData ? (
        <Line data={chartData} />
      ) : (
        <p>Loading chart data...</p>
      )}
    </Box>
  );
};

export default PriceChart;