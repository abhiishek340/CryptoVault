import Sentiment from 'sentiment';

const sentiment = new Sentiment();

export function analyzeSentiment(text: string): number {
  const result = sentiment.analyze(text);
  return result.score;
}

// ... use this function to analyze news or social media posts ...