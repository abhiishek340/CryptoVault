import React from 'react';
import { Box, Heading, Text, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface TechnicalIndicatorsProps {
  crypto: {
    name: string;
    macd: number;
    signal: number;
    histogram: number;
    rsi: number;
    sma20: number;
    sma50: number;
    sparkline_in_7d: { price: number[] };
  } | null;
}

const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ crypto }) => {
  if (!crypto) {
    return <Box>Please select a cryptocurrency to view technical indicators.</Box>;
  }

  const chartData = {
    labels: crypto.sparkline_in_7d.price.map((_, index) => index.toString()),
    datasets: [
      {
        label: 'Price',
        data: crypto.sparkline_in_7d.price,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'SMA20',
        data: Array(20).fill(null).concat(crypto.sparkline_in_7d.price.slice(20).map((_, i, arr) => 
          arr.slice(i, i + 20).reduce((a, b) => a + b, 0) / 20
        )),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'SMA50',
        data: Array(50).fill(null).concat(crypto.sparkline_in_7d.price.slice(50).map((_, i, arr) => 
          arr.slice(i, i + 50).reduce((a, b) => a + b, 0) / 50
        )),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
      },
    ],
  };

  return (
    <Box>
      <Heading size="lg" mb={4}>{crypto.name} Technical Indicators</Heading>
      <SimpleGrid columns={[1, 2, 3]} spacing={4} mb={8}>
        <Stat>
          <StatLabel>MACD</StatLabel>
          <StatNumber>{crypto.macd.toFixed(2)}</StatNumber>
          <StatHelpText>
            <StatArrow type={crypto.macd > crypto.signal ? 'increase' : 'decrease'} />
            {(crypto.macd - crypto.signal).toFixed(2)}
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>RSI</StatLabel>
          <StatNumber>{crypto.rsi.toFixed(2)}</StatNumber>
          <StatHelpText>
            {crypto.rsi < 30 ? 'Oversold' : crypto.rsi > 70 ? 'Overbought' : 'Neutral'}
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>SMA Crossover</StatLabel>
          <StatNumber>{crypto.sma20 > crypto.sma50 ? 'Bullish' : 'Bearish'}</StatNumber>
          <StatHelpText>
            SMA20: {crypto.sma20.toFixed(2)}, SMA50: {crypto.sma50.toFixed(2)}
          </StatHelpText>
        </Stat>
      </SimpleGrid>
      <Box height="400px">
        <Line data={chartData} options={{ maintainAspectRatio: false }} />
      </Box>
    </Box>
  );
};

export default TechnicalIndicators;