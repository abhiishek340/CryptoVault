import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Box } from '@chakra-ui/react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PriceChart: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/historical-data');
        const prices = response.data.prices;

        const labels = prices.map((price: [number, number]) => new Date(price[0]).toLocaleDateString());
        const data = prices.map((price: [number, number]) => price[1]);

        setChartData({
          labels,
          datasets: [
            {
              label: 'ETH Price',
              data,
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
    <Box>
      {chartData && <Line data={chartData} />}
    </Box>
  );
};

export default PriceChart;