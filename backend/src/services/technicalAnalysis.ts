import { RSI } from 'technicalindicators';

function calculateRSI(prices: number[], period: number = 14): number[] {
  const input = {
    values: prices,
    period: period
  };
  return RSI.calculate(input);
}

// ... other technical indicators ...