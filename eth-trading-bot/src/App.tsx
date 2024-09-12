import React from 'react';
import { ChakraProvider, Box, VStack, Grid, theme } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import CurrentPrice from './components/CurrentPrice';
import PriceChart from './components/PriceChart';
import TradingSimulation from './components/TradingSimulation';

const App = () => (
  <ChakraProvider theme={theme}>
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3}>
        <ColorModeSwitcher justifySelf="flex-end" />
        <VStack spacing={8}>
          <CurrentPrice />
          <PriceChart />
          <TradingSimulation />
        </VStack>
      </Grid>
    </Box>
  </ChakraProvider>
);

export default App;
