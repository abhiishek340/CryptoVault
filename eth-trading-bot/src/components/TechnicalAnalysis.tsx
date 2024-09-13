import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, SimpleGrid, Heading, Text, Badge } from '@chakra-ui/react';
import { RSI, MACD, BollingerBands, SMA } from 'technicalindicators';

interface TechnicalAnalysisProps {
  data: any[];
  recommendation: string;
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ data, recommendation }) => {
  const prices = data.map(d => d.close);

  // Calculate RSI
  const rsiData = RSI.calculate({values: prices, period: 14});
  const rsiChartData = data.slice(14).map((d, i) => ({...d, rsi: rsiData[i]}));

  // Calculate MACD
  const macdData = MACD.calculate({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });
  const macdChartData = data.slice(33).map((d, i) => ({...d, ...macdData[i]}));

  // Calculate Bollinger Bands
  const bbData = BollingerBands.calculate({
    values: prices,
    period: 20,
    stdDev: 2
  });
  const bbChartData = data.slice(19).map((d, i) => ({...d, ...bbData[i]}));

  // Calculate Simple Moving Averages
  const sma20Data = SMA.calculate({values: prices, period: 20});
  const sma50Data = SMA.calculate({values: prices, period: 50});
  const smaChartData = data.slice(49).map((d, i) => ({
    ...d,
    sma20: sma20Data[i + 30],
    sma50: sma50Data[i]
  }));

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'Strong Buy':
      case 'Buy':
        return 'green';
      case 'Strong Sell':
      case 'Sell':
        return 'red';
      default:
        return 'yellow';
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading as="h2" size="lg">Technical Analysis</Heading>
        <Badge colorScheme={getRecommendationColor(recommendation)} fontSize="md">
          Recommendation: {recommendation}
        </Badge>
      </Flex>
      <SimpleGrid columns={2} spacing={4}>
        <Box>
          <Heading as="h3" size="md" mb={2}>Price and SMAs</Heading>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={smaChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="close" stroke="#8884d8" dot={false} />
              <Line type="monotone" dataKey="sma20" stroke="#82ca9d" dot={false} />
              <Line type="monotone" dataKey="sma50" stroke="#ffc658" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        <Box>
          <Heading as="h3" size="md" mb={2}>RSI</Heading>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={rsiChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rsi" stroke="#8884d8" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        <Box>
          <Heading as="h3" size="md" mb={2}>MACD</Heading>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={macdChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="MACD" stroke="#8884d8" dot={false} />
              <Line type="monotone" dataKey="signal" stroke="#82ca9d" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        <Box>
          <Heading as="h3" size="md" mb={2}>Bollinger Bands</Heading>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bbChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="close" stroke="#8884d8" dot={false} />
              <Line type="monotone" dataKey="upper" stroke="#82ca9d" dot={false} />
              <Line type="monotone" dataKey="middle" stroke="#ffc658" dot={false} />
              <Line type="monotone" dataKey="lower" stroke="#ff8042" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default TechnicalAnalysis;