// Coinbase API integration

const COINBASE_API_BASE = 'https://api.coinbase.com/v2';

// Map common symbols to Coinbase trading pairs
const SYMBOL_TO_PAIR: Record<string, string> = {
  BTC: 'BTC-USD',
  ETH: 'ETH-USD',
  SOL: 'SOL-USD',
  AVAX: 'AVAX-USD',
  MATIC: 'MATIC-USD',
  LINK: 'LINK-USD',
  UNI: 'UNI-USD',
  ATOM: 'ATOM-USD',
  DOT: 'DOT-USD',
  ADA: 'ADA-USD',
  XRP: 'XRP-USD',
  DOGE: 'DOGE-USD',
  LTC: 'LTC-USD',
  SHIB: 'SHIB-USD',
  ARB: 'ARB-USD',
  OP: 'OP-USD',
  NEAR: 'NEAR-USD',
  FTM: 'FTM-USD',
  APT: 'APT-USD',
  INJ: 'INJ-USD',
  SEI: 'SEI-USD',
  SUI: 'SUI-USD',
  TIA: 'TIA-USD',
  AR: 'AR-USD',
  HBAR: 'HBAR-USD',
  PEPE: 'PEPE-USD',
};

// Fetch spot price for a single symbol
async function fetchSpotPrice(symbol: string): Promise<number | null> {
  const pair = SYMBOL_TO_PAIR[symbol.toUpperCase()] || `${symbol.toUpperCase()}-USD`;
  
  try {
    const response = await fetch(
      `${COINBASE_API_BASE}/prices/${pair}/spot`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // 404 means pair not found on Coinbase
      if (response.status === 404) {
        return null;
      }
      console.warn(`Coinbase API error for ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data && data.data && data.data.amount) {
      const price = parseFloat(data.data.amount);
      return isNaN(price) ? null : price;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching Coinbase price for ${symbol}:`, error);
    return null;
  }
}

// Fetch prices for multiple symbols (with rate limiting)
export async function fetchPricesForSymbols(
  symbols: string[]
): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  
  // Fetch prices with a small delay to avoid rate limiting
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    const price = await fetchSpotPrice(symbol);
    
    if (price !== null) {
      prices[symbol] = price;
    }
    
    // Small delay between requests (100ms)
    if (i < symbols.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('Coinbase prices fetched:', prices);
  return prices;
}

// Check if a symbol is likely supported by Coinbase
export function isLikelySupportedByCoinbase(symbol: string): boolean {
  return symbol.toUpperCase() in SYMBOL_TO_PAIR;
}

