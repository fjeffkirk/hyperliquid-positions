// CoinGecko API integration

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// Manual overrides for known symbols
const SYMBOL_OVERRIDES: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  TIA: 'celestia',
  NEAR: 'near',
  ZEC: 'zcash',
  SOL: 'solana',
  AVAX: 'avalanche-2',
  AR: 'arweave',
  SUI: 'sui',
  OP: 'optimism',
  MATIC: 'matic-network',
  ARB: 'arbitrum',
  DOGE: 'dogecoin',
  LTC: 'litecoin',
  LINK: 'chainlink',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  XRP: 'ripple',
  ADA: 'cardano',
  DOT: 'polkadot',
  SHIB: 'shiba-inu',
  FTM: 'fantom',
  HBAR: 'hedera-hashgraph',
  APT: 'aptos',
  INJ: 'injective-protocol',
  SEI: 'sei-network',
  WLD: 'worldcoin-wld',
  PEPE: 'pepe',
  BONK: 'bonk',
};

// Cache for resolved CoinGecko IDs
function getCachedCoinId(symbol: string): string | null {
  const key = `cgid:${symbol.toUpperCase()}`;
  return localStorage.getItem(key);
}

function setCachedCoinId(symbol: string, coinId: string): void {
  const key = `cgid:${symbol.toUpperCase()}`;
  localStorage.setItem(key, coinId);
}

// Search for a coin by symbol
async function searchCoinId(symbol: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/search?query=${encodeURIComponent(symbol)}`
    );
    
    if (!response.ok) {
      console.warn(`CoinGecko search failed for ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.coins || data.coins.length === 0) {
      return null;
    }

    // Try to find exact symbol match
    const exactMatch = data.coins.find(
      (coin: any) => coin.symbol?.toUpperCase() === symbol.toUpperCase()
    );

    const coinId = exactMatch ? exactMatch.id : data.coins[0].id;
    
    if (coinId) {
      setCachedCoinId(symbol, coinId);
    }
    
    return coinId;
  } catch (error) {
    console.error(`Error searching CoinGecko for ${symbol}:`, error);
    return null;
  }
}

// Resolve symbol to CoinGecko ID
export async function resolveCoinId(symbol: string): Promise<string | null> {
  const upperSymbol = symbol.toUpperCase();
  
  // Check override first
  if (SYMBOL_OVERRIDES[upperSymbol]) {
    return SYMBOL_OVERRIDES[upperSymbol];
  }
  
  // Check cache
  const cached = getCachedCoinId(upperSymbol);
  if (cached) {
    return cached;
  }
  
  // Search CoinGecko
  return await searchCoinId(symbol);
}

// Fetch prices for multiple coin IDs
export async function fetchPrices(
  coinIds: string[]
): Promise<Record<string, number>> {
  if (coinIds.length === 0) {
    return {};
  }

  try {
    const idsParam = coinIds.join(',');
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${encodeURIComponent(idsParam)}&vs_currencies=usd`
    );

    if (!response.ok) {
      console.error(`CoinGecko price fetch failed: ${response.status}`);
      return {};
    }

    const data = await response.json();
    
    // Transform { "bitcoin": { "usd": 50000 } } to { "bitcoin": 50000 }
    const prices: Record<string, number> = {};
    for (const [coinId, priceData] of Object.entries(data)) {
      if (priceData && typeof priceData === 'object' && 'usd' in priceData) {
        prices[coinId] = (priceData as any).usd;
      }
    }
    
    return prices;
  } catch (error) {
    console.error('Error fetching prices from CoinGecko:', error);
    return {};
  }
}

// Resolve symbols to IDs and fetch prices
export async function fetchPricesForSymbols(
  symbols: string[]
): Promise<Record<string, number>> {
  // Resolve all symbols to coin IDs
  const resolutions = await Promise.all(
    symbols.map(async (symbol) => ({
      symbol,
      coinId: await resolveCoinId(symbol),
    }))
  );

  // Filter out unresolved symbols
  const validResolutions = resolutions.filter((r) => r.coinId !== null);
  
  if (validResolutions.length === 0) {
    return {};
  }

  // Fetch prices for all coin IDs
  const coinIds = validResolutions.map((r) => r.coinId!);
  const pricesByCoinId = await fetchPrices(coinIds);

  // Map back to symbols
  const pricesBySymbol: Record<string, number> = {};
  for (const { symbol, coinId } of validResolutions) {
    if (coinId && pricesByCoinId[coinId] !== undefined) {
      pricesBySymbol[symbol] = pricesByCoinId[coinId];
    }
  }

  return pricesBySymbol;
}

