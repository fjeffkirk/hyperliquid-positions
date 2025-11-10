import { useState, useEffect, useCallback } from 'react';
import AddressInput from './components/AddressInput';
import AccountSummary from './components/AccountSummary';
import PositionCard from './components/PositionCard';
import { fetchClearinghouseState, fetchAllMids, calculateUPnl, type AccountState, type Position } from './lib/hyperliquid';
import { fetchPricesForSymbols as fetchCoinbasePrices } from './lib/coinbase';
import { fetchPricesForSymbols as fetchCoinGeckoPrices } from './lib/coingecko';
import { getAddressFromHash, setAddressInHash } from './lib/utils';

function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountState, setAccountState] = useState<AccountState | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [usingCoinGecko, setUsingCoinGecko] = useState(false);

  // Load address from URL hash on mount
  useEffect(() => {
    const hashAddress = getAddressFromHash();
    if (hashAddress) {
      setAddress(hashAddress);
      // Auto-fetch positions if address is in URL
      fetchPositions(hashAddress);
    }
  }, []);

  // Polling effect
  useEffect(() => {
    if (!isPolling || !address) return;

    const intervalId = setInterval(() => {
      fetchPositions(address);
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [isPolling, address]);

  const fetchPositions = useCallback(async (userAddress: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch Hyperliquid data
      const state = await fetchClearinghouseState(userAddress);

      if (state.positions.length === 0) {
        setAccountState(state);
        setLastUpdated(new Date());
        setLoading(false);
        return;
      }

      // Fetch mark prices from Hyperliquid
      const hlPrices = await fetchAllMids();

      // Extract unique symbols that don't have mark prices yet
      const symbolsNeedingPrices = state.positions
        .filter((p) => !p.markPrice)
        .map((p) => p.symbol);
      const uniqueSymbols = [...new Set(symbolsNeedingPrices)];

      // Try Coinbase first for missing prices
      let coinbasePrices: Record<string, number> = {};
      let coinGeckoPrices: Record<string, number> = {};
      let usedCoinGecko = false;

      if (uniqueSymbols.length > 0) {
        // Try Coinbase first
        coinbasePrices = await fetchCoinbasePrices(uniqueSymbols);
        
        // Check which symbols still need prices
        const symbolsStillNeeded = uniqueSymbols.filter(
          (symbol) => !coinbasePrices[symbol]
        );

        // Fallback to CoinGecko for remaining symbols
        if (symbolsStillNeeded.length > 0) {
          console.log('Falling back to CoinGecko for:', symbolsStillNeeded);
          coinGeckoPrices = await fetchCoinGeckoPrices(symbolsStillNeeded);
          usedCoinGecko = Object.keys(coinGeckoPrices).length > 0;
        }
      }

      setUsingCoinGecko(usedCoinGecko);

      // Enrich positions with mark prices and uPnL
      const enrichedPositions: Position[] = state.positions.map((position) => {
        // Priority: position.markPrice (from HL) > hlPrices > coinbasePrices > coinGeckoPrices
        let markPrice = position.markPrice;
        
        if (!markPrice && hlPrices[position.symbol]) {
          markPrice = hlPrices[position.symbol];
        }
        
        if (!markPrice && coinbasePrices[position.symbol]) {
          markPrice = coinbasePrices[position.symbol];
        }
        
        if (!markPrice && coinGeckoPrices[position.symbol]) {
          markPrice = coinGeckoPrices[position.symbol];
        }

        // Calculate uPnL if we have a mark price
        let uPnl = position.uPnl; // Use HL-provided uPnL if available
        
        if (!uPnl && markPrice !== undefined) {
          uPnl = calculateUPnl(position, markPrice);
        }

        return {
          ...position,
          markPrice,
          uPnl,
        };
      });

      setAccountState({
        ...state,
        positions: enrichedPositions,
      });
      setLastUpdated(new Date());
      setAddress(userAddress);
      setAddressInHash(userAddress);
    } catch (err) {
      console.error('Error fetching positions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch positions');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddressSubmit = (newAddress: string) => {
    fetchPositions(newAddress);
  };

  const handleTogglePolling = () => {
    setIsPolling((prev) => !prev);
  };

  const handleManualRefresh = () => {
    if (address) {
      fetchPositions(address);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 lg:h-screen lg:overflow-hidden">
      <div className="h-full lg:flex lg:flex-col lg:max-h-screen">
        {/* Desktop: Fixed container, Mobile: Normal scroll */}
        <div className="py-4 px-4 lg:py-6 lg:px-6 lg:flex-1 lg:overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Input Section */}
            <AddressInput
              onSubmit={handleAddressSubmit}
              currentAddress={address}
              loading={loading}
              isPolling={isPolling}
              onTogglePolling={handleTogglePolling}
              onManualRefresh={handleManualRefresh}
            />

            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4">
                <p className="text-red-200 text-center text-sm">{error}</p>
              </div>
            )}

            {usingCoinGecko && !error && accountState && (
              <div className="bg-yellow-900/50 border border-yellow-500/50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-yellow-200 text-sm font-medium">
                    Some prices from CoinGecko (may have rate limits)
                  </p>
                </div>
              </div>
            )}

            {accountState && (
              <>
                {/* Account Summary - Full Width */}
                <div className="mb-4">
                  <AccountSummary
                    equity={accountState.equity}
                    marginUsed={accountState.marginUsed}
                    lastUpdated={lastUpdated}
                    address={address || ''}
                    totalUPnl={accountState.positions.reduce((sum, p) => sum + (p.uPnl || 0), 0)}
                  />
                </div>

                {accountState.positions.length === 0 ? (
                  <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <p className="text-gray-400 text-lg">No open positions found</p>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl lg:text-lg font-bold mb-3 lg:mb-2 text-gray-200">
                      Open Positions ({accountState.positions.length})
                    </h2>
                    
                    {/* Desktop: Grid 2-3 columns, Mobile: Stack */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-3">
                      {accountState.positions.map((position, index) => (
                        <PositionCard key={`${position.symbol}-${index}`} position={position} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Footer */}
            <div className="mt-8 lg:mt-4 text-center text-gray-500 text-xs">
              <p>Powered by Hyperliquid API & CoinGecko</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

