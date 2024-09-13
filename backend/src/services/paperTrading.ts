interface Trade {
  coinId: string;
  amount: number;
  price: number;
  type: 'buy' | 'sell';
  timestamp: Date;
}

interface Portfolio {
  userId: string;
  balance: number;
  trades: Trade[];
}

class PaperTradingService {
  private portfolios: Map<string, Portfolio> = new Map();

  createPortfolio(userId: string, initialBalance: number): Portfolio {
    const portfolio: Portfolio = {
      userId,
      balance: initialBalance,
      trades: []
    };
    this.portfolios.set(userId, portfolio);
    return portfolio;
  }

  executeTrade(userId: string, trade: Omit<Trade, 'timestamp'>): Portfolio {
    const portfolio = this.portfolios.get(userId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const updatedPortfolio = { ...portfolio };
    const tradeWithTimestamp: Trade = { ...trade, timestamp: new Date() };

    if (trade.type === 'buy') {
      updatedPortfolio.balance -= trade.amount * trade.price;
    } else {
      updatedPortfolio.balance += trade.amount * trade.price;
    }

    updatedPortfolio.trades.push(tradeWithTimestamp);
    this.portfolios.set(userId, updatedPortfolio);

    return updatedPortfolio;
  }

  // ... other methods like getPortfolio, calculateProfitLoss, etc. ...
}

export const paperTradingService = new PaperTradingService();