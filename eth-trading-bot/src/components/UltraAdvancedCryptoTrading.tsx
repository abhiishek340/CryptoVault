'use client'

import React, { useState, useEffect } from 'react'
import {
  Box, Flex, VStack, HStack, Text, Heading, Input, Button,
  useColorModeValue, SimpleGrid, Stat, StatLabel, StatNumber,
  StatHelpText, StatArrow, Alert, AlertIcon, Spinner, Tabs, TabList, Tab, TabPanels, TabPanel
} from "@chakra-ui/react"
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import axios from 'axios'
import PriceChart from './PriceChart'

import CoinDetail from './CoinDetail'
import TradingSimulation from './TradingSimulation'
import AdvancedChart from './AdvancedChart'
import TechnicalIndicators from './TechnicalIndicators'
import NewsFeeds from './NewsFeeds'
import Portfolio from './Portfolio'

interface Crypto {
  id: string
  name: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
  macd: number
  signal: number
  histogram: number
  sma20: number
  sma50: number
  rsi: number
  prediction: string
  total_volume: number
  market_cap: number
  image: string
  sparkline_in_7d: { price: number[] }
}

export default function UltraAdvancedCryptoTrading() {
  const [cryptos, setCryptos] = useState<Crypto[]>([])
  const [initialInvestment, setInitialInvestment] = useState(10000)
  const [portfolio, setPortfolio] = useState({ value: 0, change: 0 })
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBgColor = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await axios.get('http://localhost:3001/api/coins-with-analysis')
        
        // Ensure all required properties are present and handle missing data
        const processedCoins = result.data.coins.map((coin: any) => ({
          ...coin,
          symbol: coin.symbol || 'N/A', // Provide a default value if symbol is missing
          current_price: coin.current_price || 0,
          total_volume: coin.total_volume || 0,
          market_cap: coin.market_cap || 0,
          image: coin.image || '',
          sparkline_in_7d: coin.sparkline_in_7d || { price: [] }
        }))
        
        setCryptos(processedCoins)
        
        // Calculate portfolio value based on initial investment
        const totalValue = processedCoins.reduce((acc: number, crypto: Crypto) => acc + crypto.current_price, 0)
        const portfolioValue = (initialInvestment / totalValue) * processedCoins[0].current_price
        const portfolioChange = ((portfolioValue - initialInvestment) / initialInvestment) * 100
        setPortfolio({ value: portfolioValue, change: portfolioChange })
      } catch (error) {
        console.error('Error fetching crypto data:', error)
        setError('Failed to fetch cryptocurrency data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [initialInvestment])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  }

  if (isLoading) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    )
  }

  if (error) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Box minHeight="100vh" bg={bgColor} p={5}>
      <VStack spacing={8} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading>Ultra Advanced Crypto Trading Platform</Heading>
          <HStack>
            <Text>Initial Investment:</Text>
            <Input 
              type="number" 
              value={initialInvestment} 
              onChange={(e) => setInitialInvestment(Number(e.target.value))}
              width="150px"
            />
          </HStack>
        </Flex>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Dashboard</Tab>
            <Tab>Advanced Chart</Tab>
            <Tab>Technical Analysis</Tab>
            <Tab>News & Sentiment</Tab>
            <Tab>Portfolio</Tab>
            <Tab>Trading Simulation</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                {cryptos.map((crypto) => (
                  <Box 
                    key={crypto.id} 
                    bg={cardBgColor} 
                    p={5} 
                    borderRadius="lg" 
                    boxShadow="md"
                    onClick={() => setSelectedCrypto(crypto)}
                    cursor="pointer"
                    transition="all 0.3s"
                    _hover={{ transform: 'scale(1.05)' }}
                  >
                    <HStack justifyContent="space-between" mb={4}>
                      <Text fontWeight="bold">{crypto.name}</Text>
                      <Text>{crypto.symbol ? crypto.symbol.toUpperCase() : 'N/A'}</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" mb={2}>
                      {formatCurrency(crypto.current_price)}
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text color={crypto.price_change_percentage_24h >= 0 ? 'green.500' : 'red.500'}>
                        {crypto.price_change_percentage_24h >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                        {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                      </Text>
                      <Text>24h</Text>
                    </HStack>
                    <Text mt={2}>Prediction: {crypto.prediction}</Text>
                    <Text>RSI: {crypto.rsi.toFixed(2)}</Text>
                    <Box height="100px" mt={4}>
                      <PriceChart data={crypto.sparkline_in_7d.price} type="line" />
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </TabPanel>
            <TabPanel>
              <AdvancedChart data={selectedCrypto?.sparkline_in_7d.price || []} />
            </TabPanel>
            <TabPanel>
              <TechnicalIndicators crypto={selectedCrypto} />
            </TabPanel>
            <TabPanel>
              <NewsFeeds />
            </TabPanel>
            <TabPanel>
              <Portfolio cryptos={cryptos} initialInvestment={initialInvestment} />
            </TabPanel>
            <TabPanel>
              <TradingSimulation />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {selectedCrypto && (
          <CoinDetail crypto={selectedCrypto} onClose={() => setSelectedCrypto(null)} />
        )}
      </VStack>
    </Box>
  )
}