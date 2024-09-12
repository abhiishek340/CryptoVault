import React, { useState } from 'react';
import { Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td, Button, Input, VStack, HStack } from '@chakra-ui/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
}

interface PortfolioProps {
  cryptos: Crypto[];
  initialInvestment: number;
}

interface PortfolioItem {
  crypto: Crypto;
  amount: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Portfolio: React.FC<PortfolioProps> = ({ cryptos, initialInvestment }) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<string>(cryptos[0]?.id || '');
  const [amount, setAmount] = useState<number>(0);

  const addToPortfolio = () => {
    const crypto = cryptos.find(c => c.id === selectedCrypto);
    if (crypto) {
      const existingItem = portfolio.find(item => item.crypto.id === crypto.id);
      if (existingItem) {
        setPortfolio(portfolio.map(item => 
          item.crypto.id === crypto.id ? { ...item, amount: item.amount + amount } : item
        ));
      } else {
        setPortfolio([...portfolio, { crypto, amount }]);
      }
    }
    setAmount(0);
  };

  const totalValue = portfolio.reduce((total, item) => total + item.amount * item.crypto.current_price, 0);
  const profitLoss = totalValue - initialInvestment;

  const pieData = portfolio.map(item => ({
    name: item.crypto.symbol,
    value: item.amount * item.crypto.current_price,
  }));

  return (
    <Box>
      <Heading size="lg" mb={4}>Your Portfolio</Heading>
      <HStack spacing={4} mb={4}>
        <select value={selectedCrypto} onChange={(e) => setSelectedCrypto(e.target.value)}>
          {cryptos.map(crypto => (
            <option key={crypto.id} value={crypto.id}>{crypto.name}</option>
          ))}
        </select>
        <Input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Amount"
        />
        <Button onClick={addToPortfolio}>Add to Portfolio</Button>
      </HStack>
      <VStack spacing={4} align="stretch">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Crypto</Th>
              <Th isNumeric>Amount</Th>
              <Th isNumeric>Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            {portfolio.map(item => (
              <Tr key={item.crypto.id}>
                <Td>{item.crypto.name}</Td>
                <Td isNumeric>{item.amount}</Td>
                <Td isNumeric>${(item.amount * item.crypto.current_price).toFixed(2)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Box height="300px">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <Text fontSize="xl" fontWeight="bold">Total Value: ${totalValue.toFixed(2)}</Text>
        <Text fontSize="xl" color={profitLoss >= 0 ? 'green.500' : 'red.500'}>
          Profit/Loss: ${profitLoss.toFixed(2)} ({((profitLoss / initialInvestment) * 100).toFixed(2)}%)
        </Text>
      </VStack>
    </Box>
  );
};

export default Portfolio;