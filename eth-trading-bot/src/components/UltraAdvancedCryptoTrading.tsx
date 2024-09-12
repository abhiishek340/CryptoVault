'use client'

import React, { useState, useEffect } from 'react'
import {
  Box, Flex, VStack, HStack, Text, Heading, Input, Button, useColorModeValue,
  SimpleGrid, Spinner, Alert, AlertIcon, Container
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import axios from 'axios'
import Dashboard from './Dashboard'
import CoinDetail from './CoinDetail'
import Portfolio from './Portfolio'
import TradingSimulation from './TradingSimulation'
import TopRecommendations from './TopRecommendations'

const MotionBox = motion(Box)

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: { price: number[] };
  image: string;
}

export default function UltraAdvancedCryptoTrading() {
  const [cryptos, setCryptos] = useState<Crypto[]>([])
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null)
  const [initialInvestment, setInitialInvestment] = useState(10000)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await axios.get('http://localhost:3001/api/coins-with-analysis')
        setCryptos(result.data.coins)
      } catch (error) {
        console.error('Error fetching crypto data:', error)
        setError('Failed to fetch cryptocurrency data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bg={bgColor}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Box>
    )
  }

  if (error) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bg={bgColor}>
        <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px">
          <AlertIcon boxSize="40px" mr={0} />
          <Text mt={4} mb={1} fontSize="lg">
            {error}
          </Text>
          <Button onClick={() => window.location.reload()} mt={4} colorScheme="red">
            Try Again
          </Button>
        </Alert>
      </Box>
    )
  }

  if (selectedCrypto) {
    return <CoinDetail crypto={selectedCrypto} onClose={() => setSelectedCrypto(null)} />
  }

  return (
    <Box minHeight="100vh" bg={bgColor} p={5}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Flex justifyContent="space-between" alignItems="center">
            <Heading fontSize="3xl" fontWeight="bold" color="blue.500">
              Ultra Advanced Crypto Trading Platform
            </Heading>
            <HStack>
              <Text fontWeight="medium">Initial Investment:</Text>
              <Input 
                type="number" 
                value={initialInvestment} 
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                width="150px"
                borderColor={borderColor}
              />
            </HStack>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <MotionBox whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Box p={5} borderRadius="lg" boxShadow="md" bg={cardBgColor} borderColor={borderColor} borderWidth={1}>
                <Text fontSize="lg" fontWeight="medium">Portfolio Value</Text>
                <Text fontSize="3xl" fontWeight="bold" color="green.500">$15,234.56</Text>
                <Text color="green.500">+23.36%</Text>
              </Box>
            </MotionBox>
            {/* Add more stat boxes here */}
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            <Dashboard cryptos={cryptos} onSelectCrypto={setSelectedCrypto} />
            <TopRecommendations />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            <Portfolio cryptos={cryptos} initialInvestment={initialInvestment} />
            <TradingSimulation />
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}