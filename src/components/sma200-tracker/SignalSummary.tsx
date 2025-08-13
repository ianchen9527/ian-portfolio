import type { ReactElement } from 'react';

export interface SignalSummaryProps {
  symbol: 'QQQ' | 'SPY';
  latestClose: number;
  latestSma200: number | null;
  state: 'UNKNOWN' | 'RISK_ON' | 'RISK_OFF';
  lastSwitchDate: string | null;
  holdingDays: number | null;
  lastUpdated: string | null;
}

function formatCurrency(value: number | null): string {
  if (value === null) return '-';
  return `$${value.toFixed(2)}`;
}

function formatState(state: string): string {
  switch (state) {
    case 'RISK_ON':
      return 'Risk On';
    case 'RISK_OFF':
      return 'Risk Off';
    case 'UNKNOWN':
      return 'Unknown';
    default:
      return state;
  }
}

export function SignalSummary({
  symbol,
  latestClose,
  latestSma200,
  state,
  lastSwitchDate,
  holdingDays,
  lastUpdated,
}: SignalSummaryProps): ReactElement {
  const stateColor: string = state === 'RISK_ON' 
    ? 'text-gray-800 bg-gray-100 border-gray-300' 
    : state === 'RISK_OFF' 
    ? 'text-gray-700 bg-gray-50 border-gray-200' 
    : 'text-gray-600 bg-gray-50 border-gray-200';

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{symbol}</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${stateColor}`}>
          {formatState(state)}
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Price Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500 text-xs uppercase tracking-wide">Close</div>
            <div className="font-mono text-lg text-gray-900">{formatCurrency(latestClose)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs uppercase tracking-wide">SMA200</div>
            <div className="font-mono text-lg text-gray-700">{formatCurrency(latestSma200)}</div>
          </div>
        </div>
        
        {/* Separator */}
        <div className="border-t border-gray-100"></div>
        
        {/* Signal Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500 text-xs uppercase tracking-wide">Last Switch</div>
            <div className="font-mono text-gray-700">{lastSwitchDate || '-'}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs uppercase tracking-wide">Holding Days</div>
            <div className="font-mono text-gray-700">{holdingDays !== null ? holdingDays : '-'}</div>
          </div>
        </div>
        
        {/* Last Updated */}
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-400">
            Last updated: {lastUpdated || '-'}
          </div>
        </div>
      </div>
    </div>
  );
}