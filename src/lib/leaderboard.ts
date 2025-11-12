// Hyperliquid Leaderboard API integration
// NOTE: The leaderboard endpoint is currently returning 422 errors
// The API may not support this endpoint publicly or the format has changed
// Keeping this code for when/if the endpoint becomes available

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
    // Try different possible request formats
    // Hyperliquid API might use 'leaderBoard' (capital B)
    const requestBody = {
      type: 'leaderBoard',
      req: timeframe,
    };

    console.log('Fetching leaderboard with request:', requestBody);

    const response = await fetch(HYPERLIQUID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error(`Hyperliquid leaderboard API returned ${response.status}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return [];
    }

    const data = await response.json();
    console.log('Hyperliquid leaderboard response:', data);
    console.log('Response type:', typeof data);
    console.log('Is array?', Array.isArray(data));

    // Parse the leaderboard data
    // The API might return different structures, so we'll handle defensively
    let entries: LeaderboardEntry[] = [];

    if (Array.isArray(data)) {
      console.log('Data is array, length:', data.length);
      entries = data.map((entry, index) => parseLeaderboardEntry(entry, index + 1));
    } else if (data.leaderboard && Array.isArray(data.leaderboard)) {
      console.log('Found data.leaderboard array, length:', data.leaderboard.length);
      entries = data.leaderboard.map((entry: any, index: number) => parseLeaderboardEntry(entry, index + 1));
    } else if (data.data && Array.isArray(data.data)) {
      console.log('Found data.data array, length:', data.data.length);
      entries = data.data.map((entry: any, index: number) => parseLeaderboardEntry(entry, index + 1));
    } else if (data.users && Array.isArray(data.users)) {
      console.log('Found data.users array, length:', data.users.length);
      entries = data.users.map((entry: any, index: number) => parseLeaderboardEntry(entry, index + 1));
    } else {
      console.error('Unknown data structure:', Object.keys(data));
      // Try to find any array in the response
      for (const key of Object.keys(data)) {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          console.log(`Found array at data.${key}, length:`, data[key].length);
          entries = data[key].map((entry: any, index: number) => parseLeaderboardEntry(entry, index + 1));
          break;
        }
      }
    }

    console.log('Parsed entries:', entries.length);
    
    // Filter out any invalid entries and return top 10
    const validEntries = entries.filter((e) => e.ethAddress).slice(0, 10);
    console.log('Valid entries:', validEntries.length);
    return validEntries;
  } catch (error) {
    console.error('Error fetching Hyperliquid leaderboard:', error);
    return [];
  }
}

function parseLeaderboardEntry(entry: any, rank: number): LeaderboardEntry {
  console.log('Parsing entry:', entry);
  
  // Try to extract fields with multiple possible names
  const ethAddress = entry.ethAddress || entry.address || entry.user || entry.account || entry.wallet || '';
  
  const accountValue = parseFloat(
    entry.accountValue || entry.account_value || entry.equity || entry.value || entry.accountEquity || '0'
  );
  
  const pnl = parseFloat(
    entry.pnl || entry.PnL || entry.profit || entry.totalPnl || entry.total_pnl || entry.windowPerformance || entry.performance || '0'
  );
  
  const volume = parseFloat(
    entry.volume || entry.totalVolume || entry.total_volume || entry.tradingVolume || entry.notionalVolume || entry.vlm || '0'
  );

  const parsed = {
    ethAddress,
    accountValue: isNaN(accountValue) ? 0 : accountValue,
    pnl: isNaN(pnl) ? 0 : pnl,
    volume: isNaN(volume) ? 0 : volume,
    rank,
  };
  
  console.log('Parsed to:', parsed);
  
  return parsed;
}

