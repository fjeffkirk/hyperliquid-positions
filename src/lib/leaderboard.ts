// Hyperliquid Leaderboard API integration

const HYPERLIQUID_API_URL = 'https://api.hyperliquid.xyz/info';

export type LeaderboardTimeframe = '1d' | '1w' | '1m' | 'allTime';

export interface LeaderboardEntry {
  ethAddress: string;
  accountValue: number;
  pnl: number;
  volume: number;
  rank: number;
}

// Fetch leaderboard data from Hyperliquid
export async function fetchLeaderboard(
  timeframe: LeaderboardTimeframe = 'allTime'
): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(HYPERLIQUID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'leaderboard',
        timeframe: timeframe,
      }),
    });

    if (!response.ok) {
      console.error(`Hyperliquid leaderboard API returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log('Hyperliquid leaderboard response:', data);

    // Parse the leaderboard data
    // The API might return different structures, so we'll handle defensively
    let entries: LeaderboardEntry[] = [];

    if (Array.isArray(data)) {
      entries = data.map((entry, index) => parseLeaderboardEntry(entry, index + 1));
    } else if (data.leaderboard && Array.isArray(data.leaderboard)) {
      entries = data.leaderboard.map((entry: any, index: number) => parseLeaderboardEntry(entry, index + 1));
    } else if (data.data && Array.isArray(data.data)) {
      entries = data.data.map((entry: any, index: number) => parseLeaderboardEntry(entry, index + 1));
    }

    // Filter out any invalid entries and return top 10
    return entries.filter((e) => e.ethAddress).slice(0, 10);
  } catch (error) {
    console.error('Error fetching Hyperliquid leaderboard:', error);
    return [];
  }
}

function parseLeaderboardEntry(entry: any, rank: number): LeaderboardEntry {
  // Try to extract fields with multiple possible names
  const ethAddress = entry.ethAddress || entry.address || entry.user || entry.account || '';
  
  const accountValue = parseFloat(
    entry.accountValue || entry.account_value || entry.equity || entry.value || '0'
  );
  
  const pnl = parseFloat(
    entry.pnl || entry.PnL || entry.profit || entry.totalPnl || entry.total_pnl || '0'
  );
  
  const volume = parseFloat(
    entry.volume || entry.totalVolume || entry.total_volume || entry.tradingVolume || '0'
  );

  return {
    ethAddress,
    accountValue: isNaN(accountValue) ? 0 : accountValue,
    pnl: isNaN(pnl) ? 0 : pnl,
    volume: isNaN(volume) ? 0 : volume,
    rank,
  };
}

