import type { Metadata } from 'next';
import { 
  GoogleSheetCsvAdapter, 
  computeSignals, 
  getLastSwitchDate, 
  countHoldingDays 
} from '@/lib/sma200-tracker';
import type { SmaPoint, SeriesPayload } from '@/lib/sma200-tracker';
import type { ReactElement } from 'react';

// Revalidate every 12 hours (43200 seconds)
export const revalidate = 43200;

export const metadata: Metadata = {
  title: 'SMA200 Tracker (QQQ & SPY)',
  description: 'Track QQQ and SPY market signals based on 200-day Simple Moving Average crossovers with risk-on/risk-off analysis.',
};

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

interface SymbolSummary {
  symbol: 'QQQ' | 'SPY';
  latestPoint: SmaPoint | null;
  lastSwitchDate: string | null;
  holdingDays: number;
  lastUpdated: string;
  error?: string;
}

async function fetchSymbolData(adapter: GoogleSheetCsvAdapter, symbol: 'QQQ' | 'SPY'): Promise<SymbolSummary> {
  try {
    const seriesData: SeriesPayload = await adapter.fetchDailySeries(symbol);
    
    if (seriesData.rows.length < 5) {
      return {
        symbol,
        latestPoint: null,
        lastSwitchDate: null,
        holdingDays: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        error: `Insufficient data: only ${seriesData.rows.length} rows available (minimum 5 required)`,
      };
    }

    const signals: SmaPoint[] = computeSignals(seriesData.rows);
    const latestPoint: SmaPoint = signals[signals.length - 1];
    const lastSwitchDate: string | null = getLastSwitchDate(signals);
    const holdingDays: number = countHoldingDays(signals);
    
    return {
      symbol,
      latestPoint,
      lastSwitchDate,
      holdingDays,
      lastUpdated: latestPoint.date,
    };
  } catch (error) {
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      symbol,
      latestPoint: null,
      lastSwitchDate: null,
      holdingDays: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      error: errorMessage,
    };
  }
}

function formatCurrency(value: number | null): string {
  if (value === null) return 'N/A';
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

interface SummaryCardProps {
  summary: SymbolSummary;
}

function SummaryCard({ summary }: SummaryCardProps): ReactElement {
  if (summary.error) {
    return (
      <div className="border rounded p-4 bg-red-50">
        <h2 className="text-lg font-semibold text-red-800 mb-2">{summary.symbol}</h2>
        <div className="text-red-700">
          <p className="font-medium">Data Unavailable</p>
          <p className="text-sm mt-1">{summary.error}</p>
          <p className="text-xs mt-2 text-red-600">
            Please check CSV URL configuration for {summary.symbol}
          </p>
        </div>
      </div>
    );
  }

  const { latestPoint, lastSwitchDate, holdingDays, lastUpdated } = summary;
  
  if (!latestPoint) {
    return (
      <div className="border rounded p-4 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{summary.symbol}</h2>
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  const stateColor: string = latestPoint.state === 'RISK_ON' 
    ? 'text-green-700 bg-green-50' 
    : latestPoint.state === 'RISK_OFF' 
    ? 'text-red-700 bg-red-50' 
    : 'text-gray-700 bg-gray-50';

  return (
    <div className="border rounded p-4">
      <h2 className="text-lg font-semibold mb-3">{summary.symbol}</h2>
      
      <div className="space-y-2">
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${stateColor}`}>
          {formatState(latestPoint.state)}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Latest Close:</span>
            <div className="font-medium">{formatCurrency(latestPoint.close)}</div>
          </div>
          
          <div>
            <span className="text-gray-600">SMA200:</span>
            <div className="font-medium">{formatCurrency(latestPoint.sma200)}</div>
          </div>
          
          <div>
            <span className="text-gray-600">Last Switch:</span>
            <div className="font-medium">{lastSwitchDate || 'None'}</div>
          </div>
          
          <div>
            <span className="text-gray-600">Holding Days:</span>
            <div className="font-medium">{holdingDays}</div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-3">
          Last updated: {lastUpdated}
        </div>
      </div>
    </div>
  );
}

export default async function SMA200TrackerPage({ params }: PageProps): Promise<ReactElement> {
  // Read locale parameter to maintain signature alignment (i18n will be added later)
  const resolvedParams = await params;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _locale: string = resolvedParams.locale;
  
  const adapter = new GoogleSheetCsvAdapter();
  
  // Fetch data for both symbols in parallel
  const [qqqSummary, spySummary] = await Promise.all([
    fetchSymbolData(adapter, 'QQQ'),
    fetchSymbolData(adapter, 'SPY'),
  ]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">SMA200 Tracker (QQQ & SPY)</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <SummaryCard summary={qqqSummary} />
        <SummaryCard summary={spySummary} />
      </div>
      
      {/* Chart Placeholder */}
      <div className="border rounded p-8 mb-6 text-center bg-gray-50">
        <h2 className="text-lg font-medium text-gray-700 mb-2">Chart Placeholder</h2>
        <p className="text-gray-500">Interactive price charts with SMA200 overlay will be added in Step 5</p>
      </div>
      
      {/* Table Placeholder */}
      <div className="border rounded p-8 text-center bg-gray-50">
        <h2 className="text-lg font-medium text-gray-700 mb-2">Table Placeholder</h2>
        <p className="text-gray-500">Historical data table with signals will be added in Step 5</p>
      </div>
    </div>
  );
}