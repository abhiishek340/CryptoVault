import React from 'react'
import { Box, SimpleGrid, Text, Heading, VStack, HStack, Badge } from "@chakra-ui/react"
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface TechnicalAnalysisProps {
  data: any[] | null
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <Text>No data available for technical analysis</Text>
  }

  const prices = data.map(d => d.close)

  const rsiData = calculateRSI(prices, 14)
  const macdData = calculateMACD(prices)
  const bbData = calculateBollingerBands(prices, 20, 2)
  const sma20 = calculateSMA(prices, 20)
  const sma50 = calculateSMA(prices, 50)

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Technical Indicators',
      },
    },
  }

  const priceChartData = {
    labels: data.map(d => new Date(d.time).toLocaleDateString()),
    datasets: [
      {
        label: 'Price',
        data: prices,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'SMA20',
        data: sma20,
        borderColor: 'rgb(255, 159, 64)',
        tension: 0.1
      },
      {
        label: 'SMA50',
        data: sma50,
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1
      }
    ]
  }

  const rsiChartData = {
    labels: data.map(d => new Date(d.time).toLocaleDateString()),
    datasets: [{
      label: 'RSI',
      data: rsiData,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  }

  const macdChartData = {
    labels: data.map(d => new Date(d.time).toLocaleDateString()),
    datasets: [
      {
        label: 'MACD',
        data: macdData.macd,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Signal',
        data: macdData.signal,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  }

  const bbChartData = {
    labels: data.map(d => new Date(d.time).toLocaleDateString()),
    datasets: [
      {
        label: 'Price',
        data: prices,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Upper Band',
        data: bbData.upper,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
        fill: false
      },
      {
        label: 'Lower Band',
        data: bbData.lower,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
        fill: false
      }
    ]
  }

  return (
    <VStack spacing={8} align="stretch">
      <Heading size="lg">Technical Analysis</Heading>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Box height="300px" p={4} borderWidth={1} borderRadius="lg">
          <Heading size="md" mb={2}>Price and SMAs</Heading>
          <Line data={priceChartData} options={chartOptions} />
        </Box>
        <Box height="300px" p={4} borderWidth={1} borderRadius="lg">
          <Heading size="md" mb={2}>RSI</Heading>
          <Line data={rsiChartData} options={chartOptions} />
        </Box>
        <Box height="300px" p={4} borderWidth={1} borderRadius="lg">
          <Heading size="md" mb={2}>MACD</Heading>
          <Line data={macdChartData} options={chartOptions} />
        </Box>
        <Box height="300px" p={4} borderWidth={1} borderRadius="lg">
          <Heading size="md" mb={2}>Bollinger Bands</Heading>
          <Line data={bbChartData} options={chartOptions} />
        </Box>
      </SimpleGrid>
      <HStack spacing={4} wrap="wrap">
        <Badge colorScheme="blue">SMA20: {sma20[sma20.length - 1].toFixed(2)}</Badge>
        <Badge colorScheme="purple">SMA50: {sma50[sma50.length - 1].toFixed(2)}</Badge>
        <Badge colorScheme={rsiData[rsiData.length - 1] > 70 ? "red" : rsiData[rsiData.length - 1] < 30 ? "green" : "yellow"}>
          RSI: {rsiData[rsiData.length - 1].toFixed(2)}
        </Badge>
        <Badge colorScheme={macdData.macd[macdData.macd.length - 1] > macdData.signal[macdData.signal.length - 1] ? "green" : "red"}>
          MACD: {macdData.macd[macdData.macd.length - 1].toFixed(2)}
        </Badge>
      </HStack>
    </VStack>
  )
}

function calculateRSI(prices: number[], period: number): number[] {
  const changes = prices.slice(1).map((price, index) => price - prices[index]);
  const gains = changes.map(change => change > 0 ? change : 0);
  const losses = changes.map(change => change < 0 ? -change : 0);

  const avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
  const avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;

  const rsi = [100 - (100 / (1 + avgGain / avgLoss))];

  for (let i = period; i < prices.length; i++) {
    const gain = changes[i - 1] > 0 ? changes[i - 1] : 0;
    const loss = changes[i - 1] < 0 ? -changes[i - 1] : 0;

    const avgGain = ((rsi[rsi.length - 1] * (period - 1)) + gain) / period;
    const avgLoss = ((rsi[rsi.length - 1] * (period - 1)) + loss) / period;

    rsi.push(100 - (100 / (1 + avgGain / avgLoss)));
  }

  return rsi;
}

function calculateMACD(prices: number[]): { macd: number[], signal: number[] } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12.map((value, index) => value - ema26[index]);
  const signal = calculateEMA(macd, 9);
  return { macd, signal };
}

function calculateEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema = [prices[0]];
  for (let i = 1; i < prices.length; i++) {
    ema.push(prices[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

function calculateBollingerBands(prices: number[], period: number, stdDev: number): { upper: number[], lower: number[] } {
  const sma = prices.map((_, index, array) => 
    array.slice(Math.max(0, index - period + 1), index + 1).reduce((a, b) => a + b) / Math.min(period, index + 1)
  );

  const upper = sma.map((value, index) => {
    const slice = prices.slice(Math.max(0, index - period + 1), index + 1);
    const std = Math.sqrt(slice.reduce((sum, x) => sum + Math.pow(x - value, 2), 0) / slice.length);
    return value + stdDev * std;
  });

  const lower = sma.map((value, index) => {
    const slice = prices.slice(Math.max(0, index - period + 1), index + 1);
    const std = Math.sqrt(slice.reduce((sum, x) => sum + Math.pow(x - value, 2), 0) / slice.length);
    return value - stdDev * std;
  });

  return { upper, lower };
}

function calculateSMA(prices: number[], period: number): number[] {
  return prices.map((_, index, array) => 
    array.slice(Math.max(0, index - period + 1), index + 1).reduce((a, b) => a + b) / Math.min(period, index + 1)
  );
}

export default TechnicalAnalysis