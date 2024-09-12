import React, { useState, useEffect } from 'react'
import { Box, Flex, Text, Button, Tabs, TabList, TabPanels, Tab, TabPanel, Spinner, Container } from "@chakra-ui/react"
import axios from 'axios'
import AdvancedChart from './AdvancedChart'
import TechnicalAnalysis from './TechnicalAnalysis'
import NewsSentiment from './NewsSentiment'
import VolumeAnalysis from './VolumeAnalysis'

interface Crypto {
  id: string
  name: string
  symbol: string
  // Add other properties as needed
}

interface CoinDetailProps {
  crypto: Crypto
  onClose: () => void
}

const CoinDetail: React.FC<CoinDetailProps> = ({ crypto, onClose }) => {
  const [historicalData, setHistoricalData] = useState<any>(null)
  const [timeframe, setTimeframe] = useState('1M')
  const [interval, setInterval] = useState('1h')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`http://localhost:3001/api/historical-data/${crypto.id}?timeframe=${timeframe}&interval=${interval}`)
        setHistoricalData(response.data)
      } catch (error) {
        console.error('Error fetching historical data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistoricalData()
  }, [crypto.id, timeframe, interval])

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={8}>
        <Text fontSize="3xl" fontWeight="bold">{crypto.name} ({crypto.symbol.toUpperCase()})</Text>
        <Button onClick={onClose} size="lg">Back to Dashboard</Button>
      </Flex>
      {isLoading ? (
        <Spinner size="xl" />
      ) : (
        <Tabs isLazy>
          <TabList>
            <Tab>Advanced Chart</Tab>
            <Tab>Technical Analysis</Tab>
            <Tab>News & Sentiment</Tab>
            <Tab>Volume Analysis</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <AdvancedChart data={historicalData} />
            </TabPanel>
            <TabPanel>
              <TechnicalAnalysis data={historicalData} />
            </TabPanel>
            <TabPanel>
              <NewsSentiment cryptoId={crypto.id} />
            </TabPanel>
            <TabPanel>
              <VolumeAnalysis data={historicalData} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </Container>
  )
}

export default CoinDetail