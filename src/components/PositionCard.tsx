import React from 'react';
import { formatNumber, formatUSD, getColorClass } from '../lib/utils';
import type { Position } from '../lib/hyperliquid';

interface PositionCardProps {
  position: Position;
}

export default function PositionCard({ position }: PositionCardProps) {
  const { symbol, side, size, entryPrice, liquidationPrice, markPrice, uPnl } = position;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 lg:p-3 mb-4 lg:mb-0 border border-gray-700 hover:border-gray-600 transition-colors">
      {/* Header: Symbol + Side */}
      <div className="flex items-center justify-between mb-3 lg:mb-2">
        <h3 className="text-xl lg:text-lg font-bold text-white">{symbol}</h3>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            side === 'LONG'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {side}
        </span>
      </div>

      {/* Position Details */}
      <div className="space-y-1.5 lg:space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs">Size:</span>
          <span className="text-white font-semibold tabular-nums text-sm">
            {formatNumber(size, 4)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs">Entry:</span>
          <span className="text-white font-semibold tabular-nums text-sm">
            {formatUSD(entryPrice, 4)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs">Mark:</span>
          <span className="text-white font-semibold tabular-nums text-sm">
            {markPrice ? formatUSD(markPrice, 4) : '—'}
          </span>
        </div>

        {/* uPnL - Highlighted */}
        <div className="flex justify-between items-center pt-1.5 mt-1.5 border-t border-gray-700">
          <span className="text-gray-300 font-medium text-sm">uPnL:</span>
          <span className={`font-bold text-lg lg:text-base tabular-nums ${getColorClass(uPnl || null)}`}>
            {uPnl !== undefined ? formatUSD(uPnl, 2) : '—'}
          </span>
        </div>

        {/* Liquidation Price */}
        {liquidationPrice !== null && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Liq:</span>
            <span className="text-orange-400 font-semibold tabular-nums text-xs">
              {formatUSD(liquidationPrice, 4)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

