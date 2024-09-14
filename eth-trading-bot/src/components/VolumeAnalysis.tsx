import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Heading, Spinner, Text, Select } from '@chakra-ui/react';

interface VolumeAnalysisProps {
  coinId: string;
}

const VolumeAnalysis: React.FC<VolumeAnalysisProps> = ({ coinId }) => {
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('30');

  useEffect(() => {
    const fetchVolumeData = async () => {
      try {
        console.log(`Fetching volume data for coin: ${coinId}`);
        const response = await axios.get(`http://localhost:3001/api/volume/${coinId}?days=${timeframe}`);
        console.log('Volume data received:', response.data);
        setVolumeData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching volume data:', error);
        setError('Failed to fetch volume data. Please try again later.');
        setLoading(false);
      }
    };

    fetchVolumeData();
  }, [coinId, timeframe]);

  if (loading) return <Spinner />;
  if (error) return <Text color="red.500">{error}</Text>;

  if (volumeData.length === 0) {
    return <Text>No volume data available for this coin.</Text>;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box bg="white" p={3} border="1px solid #ccc" borderRadius="md">
          <Text fontWeight="bold">{label}</Text>
          <Text color="green.500">Buy: {payload[0].value.toLocaleString()}</Text>
          <Text color="red.500">Sell: {payload[1].value.toLocaleString()}</Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>Volume Analysis</Heading>
      <Select
        value={timeframe}
        onChange={(e) => setTimeframe(e.target.value)}
        mb={4}
        width="200px"
      >
        <option value="7">7 Days</option>
        <option value="30">30 Days</option>
        <option value="90">90 Days</option>
      </Select>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={volumeData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="buyVolume" fill="#4CAF50" name="Buy Volume" stackId="a" />
          <Bar dataKey="sellVolume" fill="#F44336" name="Sell Volume" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default VolumeAnalysis;