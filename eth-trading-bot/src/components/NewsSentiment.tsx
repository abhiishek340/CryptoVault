import React from 'react'
import { Box, Text } from "@chakra-ui/react"

interface NewsSentimentProps {
  cryptoId: string
}

const NewsSentiment: React.FC<NewsSentimentProps> = ({ cryptoId }) => {
  return (
    <Box>
      <Text>News and Sentiment analysis for {cryptoId}</Text>
      {/* Implement news and sentiment analysis here */}
    </Box>
  )
}

export default NewsSentiment