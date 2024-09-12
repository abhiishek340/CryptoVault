import React from 'react'
import { Box, SimpleGrid, Text, Flex, Image, useColorModeValue, Heading, VStack, HStack, Badge } from "@chakra-ui/react"
import { motion } from "framer-motion"
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip as ChartTooltip } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTooltip)

interface Crypto {
  id: string
  name: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
  sparkline_in_7d: { price: number[] }
  image: string
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell'
}

interface DashboardProps {
  cryptos: Crypto[]
  onSelectCrypto: (crypto: Crypto) => void
}

const MotionBox = motion(Box)

const Dashboard: React.FC<DashboardProps> = ({ cryptos, onSelectCrypto }) => {
  const cardBgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { display: false },
      y: { display: false }
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    elements: {
      point: { radius: 0 },
      line: { tension: 0.4, borderWidth: 1.5 }
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Strong Buy': return 'green.500'
      case 'Buy': return 'green.300'
      case 'Strong Sell': return 'red.500'
      case 'Sell': return 'red.300'
      default: return 'yellow.500'
    }
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>Top Cryptocurrencies</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {cryptos.map((crypto) => (
          <MotionBox
            key={crypto.id}
            p={3}
            borderWidth={1}
            borderRadius="lg"
            borderColor={borderColor}
            bg={cardBgColor}
            onClick={() => onSelectCrypto(crypto)}
            cursor="pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            boxShadow="md"
          >
            <VStack align="stretch" spacing={2}>
              {/* First row: Logo, Name, and Symbol */}
              <Flex alignItems="center" justifyContent="space-between">
                <HStack spacing={2}>
                  <Image src={crypto.image} alt={crypto.name} boxSize="24px" />
                  <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{crypto.name}</Text>
                </HStack>
                <Text color="gray.500" fontSize="xs">({crypto.symbol.toUpperCase()})</Text>
              </Flex>

              {/* Second row: Recommendation and Price */}
              <Flex justifyContent="space-between" alignItems="center">
                <Badge colorScheme={getRecommendationColor(crypto.recommendation)} fontSize="xs">
                  {crypto.recommendation}
                </Badge>
                <Text fontWeight="bold" fontSize="sm">
                  ${crypto.current_price < 1 ? crypto.current_price.toFixed(4) : crypto.current_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </Text>
              </Flex>

              {/* Third row: Price Change */}
              <Flex justifyContent="flex-end" alignItems="center">
                <HStack spacing={1}>
                  {crypto.price_change_percentage_24h >= 0 ? <ArrowUpIcon size={12} color="green" /> : <ArrowDownIcon size={12} color="red" />}
                  <Text
                    color={crypto.price_change_percentage_24h >= 0 ? 'green.500' : 'red.500'}
                    fontSize="xs"
                  >
                    {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                  </Text>
                </HStack>
              </Flex>

              {/* Fourth row: Graph */}
              <Box height="40px">
                <Line
                  data={{
                    labels: crypto.sparkline_in_7d.price.map((_, i) => i.toString()),
                    datasets: [{
                      data: crypto.sparkline_in_7d.price,
                      borderColor: crypto.price_change_percentage_24h >= 0 ? 'green' : 'red',
                      backgroundColor: crypto.price_change_percentage_24h >= 0 ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                      fill: true
                    }]
                  }}
                  options={chartOptions}
                />
              </Box>
            </VStack>
          </MotionBox>
        ))}
      </SimpleGrid>
    </Box>
  )
}

export default Dashboard