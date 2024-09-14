declare module 'cryptocompare' {
  function setApiKey(apiKey: string): void;
  function newsList(lang: string, symbol: string): Promise<any[]>;
  // Add other function declarations as needed

  const cc: {
    setApiKey: typeof setApiKey;
    newsList: typeof newsList;
    // Add other properties as needed
  };

  export = cc;
}