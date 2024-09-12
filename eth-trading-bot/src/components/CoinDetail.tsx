import React from 'react'
import { 
  Box, Flex, Text, Heading, Button, useColorModeValue,
  Tabs, TabList, Tab, TabPanels, TabPanel, Stat, StatLabel, StatNumber, StatHelpText, StatArrow
} from "@chakra-ui/react"
import { Line, Bar } from 'react-chartjs-2'
import { XIcon } from 'lucide-react'

interface CoinDetailProps {
  crypto: {
    id: string
    name: string
    symbol: string
    current_price: number
    price_change_percentage_24h: number
    total_volume: number
    market_cap: number
    image: string
    sparkline_in_7d: { price: number[] }
  }
  onClose: () => void
}

export default function CoinDetail({ crypto, onClose }: CoinDetailProps) {
  const bgColor = useColorModeValue('white', 'gray.800')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  }

  return (
    <Box position="fixed" top={0} left={0} right={0} bottom={0} bg={bgColor} zIndex={1000} p={5} overflowY="auto">
      <Flex justifyContent="space-between" alignItems="center" mb={5}>
        <Heading>{crypto.name} ({crypto.symbol.toUpperCase()})</Heading>
        <Button onClick={onClose}><XIcon /></Button>
      </Flex>

      <Tabs>
        <TabList>
          <Tab>Price Chart</Tab>
          <Tab>Technical Analysis</Tab>
          <Tab>Sentiment Analysis</Tab>
          <Tab>Volume</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box height="400px">
              <Line 
                data={{
                  labels: crypto.sparkline_in_7d.price.map((_, i) => i),
                  datasets: [{
                    label: 'Price',
                    data: crypto.sparkline_in_7d.price,
                    fill: false,
                    borderColor: 'blue',
                    tension: 0.1
                  }]
                }}
                options={{
                  responsive: true,
                  scales: { y: { beginAtZero: false } }
                }}
              />
            </Box>
            <Stat mt={5}>
              <StatLabel>Current Price</StatLabel>
              <StatNumber>{formatCurrency(crypto.current_price)}</StatNumber>
              <StatHelpText>
                <StatArrow type={crypto.price_change_percentage_24h >= 0 ? 'increase' : 'decrease'} />
                {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}% (24h)
              </StatHelpText>
            </Stat>
          </TabPanel>
          <TabPanel>
            <Text>Technical analysis data would go here</Text>
            {/* Add technical analysis charts/data here */}
          </TabPanel>
          <TabPanel>
            <Text>Sentiment analysis data would go here</Text>
            {/* Add sentiment analysis charts/data here */}
          </TabPanel>
          <TabPanel>
            <Box height="400px">
              <Bar 
                data={{
                  labels: ['Volume'],
                  datasets: [{
                    label: 'Trading Volume',
                    data: [crypto.total_volume],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                  }]
                }}
                options={{
                  responsive: true,
                  scales: { y: { beginAtZero: true } }
                }}
              />
            </Box>
            <Text mt={5}>24h Trading Volume: {formatCurrency(crypto.total_volume)}</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}