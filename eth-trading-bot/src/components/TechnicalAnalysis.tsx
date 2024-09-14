import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Box, SimpleGrid, Heading, Text, Badge, Flex, Button } from '@chakra-ui/react';
import { RSI, MACD, BollingerBands, SMA } from 'technicalindicators';

interface TechnicalAnalysisProps {
  data: any[];
  recommendation: string;
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ data, recommendation }) => {
  const [leftZoom, setLeftZoom] = useState<{ [key: string]: number | undefined }>({});
  const [rightZoom, setRightZoom] = useState<{ [key: string]: number | undefined }>({});
  const [refAreaLeft, setRefAreaLeft] = useState<{ [key: string]: number | undefined }>({});
  const [refAreaRight, setRefAreaRight] = useState<{ [key: string]: number | undefined }>({});

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

  const getAxisYDomain = (from: number, to: number, ref: string, offset: number) => {
    const refData = data.slice(from - 1, to);
    let [bottom, top] = [refData[0][ref], refData[0][ref]];
    refData.forEach((d) => {
      if (d[ref] > top) top = d[ref];
      if (d[ref] < bottom) bottom = d[ref];
    });
    
    return [(bottom | 0) - offset, (top | 0) + offset];
  };

  const zoom = (chartId: string) => {
    let left = leftZoom[chartId];
    let right = rightZoom[chartId];
    let refLeft = refAreaLeft[chartId];
    let refRight = refAreaRight[chartId];

    if (refLeft === refRight || refRight === undefined) {
      setRefAreaLeft({ ...refAreaLeft, [chartId]: undefined });
      setRefAreaRight({ ...refAreaRight, [chartId]: undefined });
      return;
    }

    if (refLeft !== undefined && refRight !== undefined && refLeft > refRight) 
      [refLeft, refRight] = [refRight, refLeft];

    const [bottom, top] = getAxisYDomain(refLeft!, refRight!, 'close', 1);

    setRefAreaLeft({ ...refAreaLeft, [chartId]: undefined });
    setRefAreaRight({ ...refAreaRight, [chartId]: undefined });
    setLeftZoom({ ...leftZoom, [chartId]: refLeft });
    setRightZoom({ ...rightZoom, [chartId]: refRight });
  };

  const zoomOut = (chartId: string) => {
    setLeftZoom({ ...leftZoom, [chartId]: undefined });
    setRightZoom({ ...rightZoom, [chartId]: undefined });
  };

  const renderChart = (chartData: any[], chartId: string, title: string, lines: { key: string, color: string }[]) => (
    <Box>
      <Heading as="h3" size="md" mb={2}>{title}</Heading>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          onMouseDown={(e: any) => setRefAreaLeft({ ...refAreaLeft, [chartId]: e.activeLabel })}
          onMouseMove={(e: any) => refAreaLeft[chartId] !== undefined && setRefAreaRight({ ...refAreaRight, [chartId]: e.activeLabel })}
          onMouseUp={() => zoom(chartId)}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            allowDataOverflow={true}
            dataKey="time"
            domain={[leftZoom[chartId] || 'dataMin', rightZoom[chartId] || 'dataMax']}
            type="number"
          />
          <YAxis allowDataOverflow={true} domain={['auto', 'auto']} />
          <Tooltip />
          <Legend />
          {lines.map(line => (
            <Line key={line.key} type="monotone" dataKey={line.key} stroke={line.color} dot={false} />
          ))}
          {refAreaLeft[chartId] !== undefined && refAreaRight[chartId] !== undefined && (
            <ReferenceArea x1={refAreaLeft[chartId]} x2={refAreaRight[chartId]} strokeOpacity={0.3} />
          )}
        </LineChart>
      </ResponsiveContainer>
      <Button onClick={() => zoomOut(chartId)} size="sm" mt={2}>
        Zoom Out
      </Button>
    </Box>
  );

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading as="h2" size="lg">Technical Analysis</Heading>
        <Badge colorScheme={getRecommendationColor(recommendation)} fontSize="md">
          Recommendation: {recommendation}
        </Badge>
      </Flex>
      <SimpleGrid columns={2} spacing={4}>
        {renderChart(smaChartData, 'price', "Price and SMAs", [
          { key: "close", color: "#8884d8" },
          { key: "sma20", color: "#82ca9d" },
          { key: "sma50", color: "#ffc658" }
        ])}
        {renderChart(rsiChartData, 'rsi', "RSI", [
          { key: "rsi", color: "#8884d8" }
        ])}
        {renderChart(macdChartData, 'macd', "MACD", [
          { key: "MACD", color: "#8884d8" },
          { key: "signal", color: "#82ca9d" }
        ])}
        {renderChart(bbChartData, 'bb', "Bollinger Bands", [
          { key: "close", color: "#8884d8" },
          { key: "upper", color: "#82ca9d" },
          { key: "middle", color: "#ffc658" },
          { key: "lower", color: "#ff8042" }
        ])}
      </SimpleGrid>
    </Box>
  );
};

export default TechnicalAnalysis;