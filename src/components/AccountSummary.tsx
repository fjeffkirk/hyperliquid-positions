import { formatUSD } from '../lib/utils';

interface AccountSummaryProps {
  equity: number;
  marginUsed: number;
  lastUpdated: Date | null;
  address: string;
  totalUPnl?: number;
}

export default function AccountSummary({ equity, marginUsed, lastUpdated, address, totalUPnl }: AccountSummaryProps) {
  const availableMargin = equity - marginUsed;
  const marginUsedPercent = equity > 0 ? (marginUsed / equity) * 100 : 0;

  // Helper to get color class based on value
  const getValueColor = (value: number) => {
    if (value < 0) return 'text-red-400';
    if (value > 0) return 'text-green-400';
    return 'text-white';
  };

  // Truncate address for display
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 lg:p-4 mb-4 lg:mb-0 h-full">
      <h2 className="text-lg lg:text-base font-bold mb-3 lg:mb-3 text-gray-200">Account Summary</h2>
      
      {/* Address Display */}
      <div className="mb-3 pb-2 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs">Address:</span>
          <span className="text-blue-400 font-mono text-xs" title={address}>
            {truncatedAddress}
          </span>
        </div>
      </div>
      
      <div className="space-y-2 lg:space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm lg:text-xs">Equity:</span>
          <span className={`${getValueColor(equity)} font-semibold tabular-nums text-base lg:text-sm`}>
            {formatUSD(equity)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm lg:text-xs">Margin Used:</span>
          <span className={`${getValueColor(marginUsed)} font-semibold tabular-nums text-base lg:text-sm`}>
            {formatUSD(marginUsed)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm lg:text-xs">Available:</span>
          <span className={`${getValueColor(availableMargin)} font-semibold tabular-nums text-base lg:text-sm`}>
            {formatUSD(availableMargin)}
          </span>
        </div>

        <div className="pt-2 border-t border-gray-700">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-gray-400 text-xs">Margin Usage:</span>
            <span className="text-white font-semibold tabular-nums text-xs">
              {marginUsedPercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                marginUsedPercent > 80 ? 'bg-red-500' : marginUsedPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(marginUsedPercent, 100)}%` }}
            ></div>
          </div>
        </div>

        {lastUpdated && (
          <div className="pt-1.5 text-xs text-gray-500 text-center">
            {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Total uPnL - Prominent Display */}
      {totalUPnl !== undefined && (
        <div className="mt-3 pt-3 border-t-2 border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 font-bold text-base lg:text-sm">Total uPnL:</span>
            <span className={`${getValueColor(totalUPnl)} font-bold tabular-nums text-xl lg:text-lg`}>
              {formatUSD(totalUPnl)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

