import { useState, useEffect } from 'react';
import { fetchLeaderboard, type LeaderboardEntry, type LeaderboardTimeframe } from '../lib/leaderboard';
import { formatUSD, getColorClass } from '../lib/utils';
import { truncateAddress } from '../lib/savedAddresses';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';

interface LeaderboardProps {
  onAddressClick: (address: string) => void;
}

export default function Leaderboard({ onAddressClick }: LeaderboardProps) {
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('allTime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await fetchLeaderboard(timeframe);
      setEntries(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newTimeframe: LeaderboardTimeframe | null,
  ) => {
    if (newTimeframe !== null) {
      setTimeframe(newTimeframe);
    }
  };

  const handleAddressClick = (address: string) => {
    onAddressClick(address);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(2)}B`;
    } else if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(2)}K`;
    }
    return formatUSD(volume, 0);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 lg:p-6">
      {/* Header with Timeframe Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-200">
          🏆 Hyperliquid Leaderboard
        </h2>
        
        <ToggleButtonGroup
          value={timeframe}
          exclusive
          onChange={handleTimeframeChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              color: '#9ca3af',
              borderColor: '#4b5563',
              backgroundColor: '#374151',
              '&.Mui-selected': {
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#2563eb',
                },
              },
              '&:hover': {
                backgroundColor: '#4b5563',
              },
              padding: '6px 16px',
              fontSize: '0.875rem',
            },
          }}
        >
          <ToggleButton value="1d">24H</ToggleButton>
          <ToggleButton value="1w">7D</ToggleButton>
          <ToggleButton value="1m">30D</ToggleButton>
          <ToggleButton value="allTime">All Time</ToggleButton>
        </ToggleButtonGroup>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <CircularProgress sx={{ color: '#3b82f6' }} />
        </div>
      )}

      {/* Leaderboard Table */}
      {!loading && entries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No leaderboard data available</p>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase">#</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase">Trader</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase">Account Value</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase">PnL</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase">Volume</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.ethAddress}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                >
                  <td className="py-3 px-2">
                    <span className="text-gray-300 font-semibold">{entry.rank}</span>
                  </td>
                  <td className="py-3 px-2">
                    <button
                      onClick={() => handleAddressClick(entry.ethAddress)}
                      className="text-blue-400 hover:text-blue-300 font-mono text-sm underline decoration-dotted transition-colors"
                      title={entry.ethAddress}
                    >
                      {truncateAddress(entry.ethAddress)}
                    </button>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="text-white font-semibold tabular-nums">
                      {formatUSD(entry.accountValue, 0)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className={`font-semibold tabular-nums ${getColorClass(entry.pnl)}`}>
                      {formatUSD(entry.pnl, 0)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="text-gray-300 font-semibold tabular-nums">
                      {formatVolume(entry.volume)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

