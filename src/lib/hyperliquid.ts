// Hyperliquid API integration

const HYPERLIQUID_API_URL = 'https://api.hyperliquid.xyz/info';

export interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  liquidationPrice: number | null;
  markPrice?: number;
  uPnl?: number;
}

export interface AccountState {
  equity: number;
  marginUsed: number;
  positions: Position[];
}

// Helper to safely extract nested values
function getNestedValue(obj: any, paths: string[]): any {
  for (const path of paths) {
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        value = undefined;
        break;
      }
    }
    
    if (value !== undefined) {
      return value;
    }
  }
  
  return undefined;
}

// Parse position data defensively
function parsePosition(posData: any): Position | null {
  try {
    // Extract symbol (could be: symbol, coin, asset, position.symbol)
    const symbol = getNestedValue(posData, [
      'symbol',
      'coin',
      'asset',
      'position.symbol',
      'position.coin',
    ]);

    if (!symbol) {
      console.warn('Position missing symbol:', posData);
      return null;
    }

    // Extract size (could be: size, szi, position.size)
    const sizeStr = getNestedValue(posData, [
      'position.szi',
      'szi',
      'size',
      'position.size',
    ]);

    const size = parseFloat(sizeStr);
    if (isNaN(size) || size === 0) {
      // Skip positions with 0 size
      return null;
    }

    // Determine side
    const side: 'LONG' | 'SHORT' = size > 0 ? 'LONG' : 'SHORT';
    const absSize = Math.abs(size);

    // Extract entry price (could be: entryPx, avgEntryPx, position.entryPx)
    const entryPxStr = getNestedValue(posData, [
      'position.entryPx',
      'entryPx',
      'avgEntryPx',
      'position.avgEntryPx',
    ]);

    const entryPrice = parseFloat(entryPxStr);
    if (isNaN(entryPrice)) {
      console.warn('Position missing valid entry price:', posData);
      return null;
    }

    // Extract liquidation price (optional)
    const liqPxStr = getNestedValue(posData, [
      'position.liquidationPx',
      'liquidationPx',
      'liqPx',
      'position.liqPx',
      'liqPrice',
    ]);

    const liquidationPrice = liqPxStr ? parseFloat(liqPxStr) : null;

    // Extract mark price (optional - may be in position data)
    const markPxStr = getNestedValue(posData, [
      'position.markPx',
      'markPx',
      'markPrice',
      'position.markPrice',
    ]);

    const markPrice = markPxStr ? parseFloat(markPxStr) : undefined;

    // Extract uPnL if provided by Hyperliquid
    const unrealizedPnlStr = getNestedValue(posData, [
      'position.unrealizedPnl',
      'unrealizedPnl',
      'position.uPnl',
      'uPnl',
    ]);

    const uPnl = unrealizedPnlStr ? parseFloat(unrealizedPnlStr) : undefined;

    return {
      symbol,
      side,
      size: absSize,
      entryPrice,
      liquidationPrice: liquidationPrice && !isNaN(liquidationPrice) ? liquidationPrice : null,
      markPrice: markPrice && !isNaN(markPrice) ? markPrice : undefined,
      uPnl: uPnl && !isNaN(uPnl) ? uPnl : undefined,
    };
  } catch (error) {
    console.error('Error parsing position:', error, posData);
    return null;
  }
}

// Fetch clearinghouse state from Hyperliquid
export async function fetchClearinghouseState(
  userAddress: string
): Promise<AccountState> {
  try {
    const response = await fetch(HYPERLIQUID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'clearinghouseState',
        user: userAddress,
      }),
    });

    if (!response.ok) {
      throw new Error(`Hyperliquid API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Debug: Log the raw response to help troubleshoot
    console.log('Hyperliquid clearinghouseState response:', data);

    // Extract account values
    const equity = parseFloat(
      getNestedValue(data, [
        'marginSummary.accountValue',
        'crossMarginSummary.accountValue',
        'accountValue',
      ]) || '0'
    );

    const marginUsed = parseFloat(
      getNestedValue(data, [
        'marginSummary.totalMarginUsed',
        'crossMarginSummary.totalMarginUsed',
        'totalMarginUsed',
      ]) || '0'
    );

    // Extract positions array
    const positionsData = getNestedValue(data, [
      'assetPositions',
      'positions',
      'user.assetPositions',
      'state.assetPositions',
    ]) || [];

    const positions: Position[] = [];

    if (Array.isArray(positionsData)) {
      console.log('Positions data array:', positionsData);
      for (const posData of positionsData) {
        const position = parsePosition(posData);
        if (position) {
          positions.push(position);
        }
      }
    }

    return {
      equity: isNaN(equity) ? 0 : equity,
      marginUsed: isNaN(marginUsed) ? 0 : marginUsed,
      positions,
    };
  } catch (error) {
    console.error('Error fetching Hyperliquid data:', error);
    throw error;
  }
}

// Fetch all market prices (mark prices) from Hyperliquid
export async function fetchAllMids(): Promise<Record<string, number>> {
  try {
    const response = await fetch(HYPERLIQUID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'allMids',
      }),
    });

    if (!response.ok) {
      console.error(`Hyperliquid allMids API returned ${response.status}`);
      return {};
    }

    const data = await response.json();
    
    // Debug: Log mark prices
    console.log('Hyperliquid allMids response:', data);
    
    // Response is a simple object like { "BTC": "50000", "ETH": "3000", ... }
    const prices: Record<string, number> = {};
    
    if (data && typeof data === 'object') {
      for (const [symbol, priceStr] of Object.entries(data)) {
        const price = parseFloat(priceStr as string);
        if (!isNaN(price)) {
          prices[symbol] = price;
        }
      }
    }
    
    return prices;
  } catch (error) {
    console.error('Error fetching Hyperliquid mark prices:', error);
    return {};
  }
}

// Calculate uPnL for a position given mark price
export function calculateUPnl(
  position: Position,
  markPrice: number
): number {
  const priceDiff = markPrice - position.entryPrice;
  const multiplier = position.side === 'LONG' ? 1 : -1;
  return position.size * priceDiff * multiplier;
}

