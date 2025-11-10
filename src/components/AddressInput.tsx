import { useState, useEffect } from 'react';
import { isValidEthAddress, copyToClipboard } from '../lib/utils';
import { getSavedAddresses, addSavedAddress, removeSavedAddress, truncateAddress, type SavedAddress } from '../lib/savedAddresses';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

interface AddressInputProps {
  onSubmit: (address: string) => void;
  currentAddress: string | null;
  loading: boolean;
  isPolling: boolean;
  onTogglePolling: () => void;
  onManualRefresh: () => void;
}

export default function AddressInput({ 
  onSubmit, 
  currentAddress, 
  loading, 
  isPolling, 
  onTogglePolling, 
  onManualRefresh 
}: AddressInputProps) {
  const [address, setAddress] = useState(currentAddress || '');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // Load saved addresses on mount
  useEffect(() => {
    setSavedAddresses(getSavedAddresses());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    if (!isValidEthAddress(address.trim())) {
      setError('Invalid Ethereum address format');
      return;
    }

    // Save address and update list
    const updated = addSavedAddress(address.trim());
    setSavedAddresses(updated);

    onSubmit(address.trim());
  };

  const handleChipClick = (chipAddress: string) => {
    setAddress(chipAddress);
    onSubmit(chipAddress);
  };

  const handleChipDelete = (chipAddress: string) => {
    const updated = removeSavedAddress(chipAddress);
    setSavedAddresses(updated);
  };

  const handleShareLink = async () => {
    if (!currentAddress) return;
    
    const url = `${window.location.origin}${window.location.pathname}#addr=${currentAddress}`;
    try {
      await copyToClipboard(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 lg:p-5 mb-4 lg:mb-4">
      {/* Header with Title and Controls */}
      <div className="flex items-center justify-between mb-4 lg:mb-5">
        <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Hyperliquid PnL Viewer
        </h1>
        
        {/* Auto-refresh Toggle + Manual Refresh */}
        {currentAddress && (
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Manual Refresh Button */}
            <button
              onClick={onManualRefresh}
              disabled={loading}
              className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
              title="Manual Refresh"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>

            {/* Toggle Switch for Auto-Refresh */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-xs lg:text-sm text-gray-300 whitespace-nowrap">Auto</span>
                <div className="relative group">
                  <svg 
                    className="w-3.5 h-3.5 text-gray-400 cursor-help" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10 pointer-events-none">
                    Auto will poll API's every 30 seconds
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onTogglePolling}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                  isPolling ? 'bg-green-600' : 'bg-gray-600'
                }`}
                role="switch"
                aria-checked={isPolling}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    isPolling ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
        <div>
          <label htmlFor="address" className="block text-xs lg:text-sm font-medium text-gray-300 mb-1.5 lg:mb-2">
            Ethereum Address
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            disabled={loading}
            className="w-full px-3 py-2 lg:px-4 lg:py-2.5 text-sm lg:text-base bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {error && (
            <p className="mt-1.5 text-xs lg:text-sm text-red-400">{error}</p>
          )}
        </div>

        <div className="flex gap-2 lg:gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2 lg:py-2.5 px-4 lg:px-6 text-sm lg:text-base rounded-lg transition-colors duration-200 shadow-md"
          >
            {loading ? 'Loading...' : 'View Positions'}
          </button>

          {currentAddress && (
            <button
              type="button"
              onClick={handleShareLink}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 lg:py-2.5 px-4 lg:px-6 text-sm lg:text-base rounded-lg transition-colors duration-200 shadow-md whitespace-nowrap"
            >
              {copied ? '✓ Copied!' : 'Share Link'}
            </button>
          )}
        </div>
      </form>

      {/* Saved Addresses Chips */}
      {savedAddresses.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-400">Saved Addresses:</span>
          </div>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {savedAddresses.map((saved) => (
              <Chip
                key={saved.address}
                label={truncateAddress(saved.address)}
                onClick={() => handleChipClick(saved.address)}
                onDelete={() => handleChipDelete(saved.address)}
                disabled={loading}
                sx={{
                  backgroundColor: currentAddress?.toLowerCase() === saved.address.toLowerCase() 
                    ? '#3b82f6' 
                    : '#374151',
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  '&:hover': {
                    backgroundColor: currentAddress?.toLowerCase() === saved.address.toLowerCase()
                      ? '#2563eb'
                      : '#4b5563',
                  },
                  '& .MuiChip-deleteIcon': {
                    color: '#9ca3af',
                    '&:hover': {
                      color: '#ef4444',
                    },
                  },
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  marginBottom: '0.5rem',
                }}
                size="small"
              />
            ))}
          </Stack>
        </div>
      )}
    </div>
  );
}

