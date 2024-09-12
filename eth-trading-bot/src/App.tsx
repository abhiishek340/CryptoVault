import React from 'react';
import { ChakraProvider, theme } from '@chakra-ui/react';
import UltraAdvancedCryptoTrading from './components/UltraAdvancedCryptoTrading';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ErrorBoundary>
        <UltraAdvancedCryptoTrading />
      </ErrorBoundary>
    </ChakraProvider>
  );
}

export default App;