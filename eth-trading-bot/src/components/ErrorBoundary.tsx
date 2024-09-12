import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Text, Heading } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box p={5}>
          <Heading mb={4}>Sorry.. there was an error</Heading>
          <Text>Please try refreshing the page or contact support if the problem persists.</Text>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;