import type { Metadata } from 'next';
import { 
  GoogleSheetCsvAdapter, 
  computeSignals, 
  getLastSwitchDate, 
  countHoldingDays 
} from '@/lib/sma200-tracker';
import type { SmaPoint, SeriesPayload } from '@/lib/sma200-tracker';
import type { ReactElement } from 'react';
import { SignalSummary } from '@/components/sma200-tracker/SignalSummary';
import { Table } from '@/components/sma200-tracker/Table';

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

interface SymbolData {
  symbol: 'QQQ' | 'SPY';
  signals: SmaPoint[];
  latestPoint: SmaPoint | null;
  lastSwitchDate: string | null;
  holdingDays: number;
  lastUpdated: string;
  error?: string;
}

async function fetchSymbolData(adapter: GoogleSheetCsvAdapter, symbol: 'QQQ' | 'SPY'): Promise<SymbolData> {
  try {
    const seriesData: SeriesPayload = await adapter.fetchDailySeries(symbol);
    
    if (seriesData.rows.length < 5) {
      return {
        symbol,
        signals: [],
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
      signals,
      latestPoint,
      lastSwitchDate,
      holdingDays,
      lastUpdated: latestPoint.date,
    };
  } catch (error) {
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      symbol,
      signals: [],
      latestPoint: null,
      lastSwitchDate: null,
      holdingDays: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      error: errorMessage,
    };
  }
}

function ErrorCard({ symbol, error }: { symbol: string; error: string }): ReactElement {
  return (
    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
      <h2 className="text-lg font-semibold text-red-800 mb-2">{symbol}</h2>
      <div className="text-red-700">
        <p className="font-medium">Data Unavailable</p>
        <p className="text-sm mt-1">{error}</p>
        <p className="text-xs mt-2 text-red-600">
          Please check CSV URL configuration for {symbol}
        </p>
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
  const [qqqData, spyData] = await Promise.all([
    fetchSymbolData(adapter, 'QQQ'),
    fetchSymbolData(adapter, 'SPY'),
  ]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">SMA200 Tracker</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {qqqData.error ? (
          <ErrorCard symbol={qqqData.symbol} error={qqqData.error} />
        ) : qqqData.latestPoint ? (
          <SignalSummary
            symbol={qqqData.symbol}
            latestClose={qqqData.latestPoint.close}
            latestSma200={qqqData.latestPoint.sma200}
            state={qqqData.latestPoint.state}
            lastSwitchDate={qqqData.lastSwitchDate}
            holdingDays={qqqData.holdingDays}
            lastUpdated={qqqData.lastUpdated}
          />
        ) : (
          <ErrorCard symbol={qqqData.symbol} error="No data available" />
        )}
        
        {spyData.error ? (
          <ErrorCard symbol={spyData.symbol} error={spyData.error} />
        ) : spyData.latestPoint ? (
          <SignalSummary
            symbol={spyData.symbol}
            latestClose={spyData.latestPoint.close}
            latestSma200={spyData.latestPoint.sma200}
            state={spyData.latestPoint.state}
            lastSwitchDate={spyData.lastSwitchDate}
            holdingDays={spyData.holdingDays}
            lastUpdated={spyData.lastUpdated}
          />
        ) : (
          <ErrorCard symbol={spyData.symbol} error="No data available" />
        )}
      </div>
      
      {/* Tables */}
      <div className="space-y-8">
        {!qqqData.error && qqqData.signals.length > 0 && (
          <Table rows={qqqData.signals} symbol="QQQ" />
        )}
        {!spyData.error && spyData.signals.length > 0 && (
          <Table rows={spyData.signals} symbol="SPY" />
        )}
      </div>
    </div>
  );
}