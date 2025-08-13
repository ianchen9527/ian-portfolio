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
import { getTranslations } from '@/lib/getTranslations';

// Revalidate every 12 hours (43200 seconds)
export const revalidate = 43200;

// Helper function to interpolate strings with placeholders
function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => String(values[key] || match));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const t = await getTranslations(params, "projects/sma200-tracker");
  
  return {
    title: t.metadata.title,
    description: t.metadata.description,
  };
}

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

interface SMA200TrackerTranslations {
  error: {
    insufficientData: string;
    unknownError: string;
    dataUnavailable: string;
    checkCsvUrl: string;
    noDataAvailable: string;
  };
  [key: string]: unknown;
}

async function fetchSymbolData(adapter: GoogleSheetCsvAdapter, symbol: 'QQQ' | 'SPY', t: SMA200TrackerTranslations): Promise<SymbolData> {
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
        error: interpolate(t.error.insufficientData, { count: seriesData.rows.length }),
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
    const errorMessage: string = error instanceof Error ? error.message : t.error.unknownError;
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

function ErrorCard({ symbol, error, t }: { symbol: string; error: string; t: SMA200TrackerTranslations }): ReactElement {
  return (
    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
      <h2 className="text-lg font-semibold text-red-800 mb-2">{symbol}</h2>
      <div className="text-red-700">
        <p className="font-medium">{t.error.dataUnavailable}</p>
        <p className="text-sm mt-1">{error}</p>
        <p className="text-xs mt-2 text-red-600">
          {interpolate(t.error.checkCsvUrl, { symbol })}
        </p>
      </div>
    </div>
  );
}

export default async function SMA200TrackerPage({ params }: PageProps): Promise<ReactElement> {
  const t = await getTranslations(params, "projects/sma200-tracker");
  
  const adapter = new GoogleSheetCsvAdapter();
  
  // Fetch data for both symbols in parallel
  const [qqqData, spyData] = await Promise.all([
    fetchSymbolData(adapter, 'QQQ', t),
    fetchSymbolData(adapter, 'SPY', t),
  ]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">{t.page.title}</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {qqqData.error ? (
          <ErrorCard symbol={qqqData.symbol} error={qqqData.error} t={t} />
        ) : qqqData.latestPoint ? (
          <SignalSummary
            symbol={qqqData.symbol}
            latestClose={qqqData.latestPoint.close}
            latestSma200={qqqData.latestPoint.sma200}
            state={qqqData.latestPoint.state}
            lastSwitchDate={qqqData.lastSwitchDate}
            holdingDays={qqqData.holdingDays}
            lastUpdated={qqqData.lastUpdated}
            t={t}
          />
        ) : (
          <ErrorCard symbol={qqqData.symbol} error={t.error.noDataAvailable} t={t} />
        )}
        
        {spyData.error ? (
          <ErrorCard symbol={spyData.symbol} error={spyData.error} t={t} />
        ) : spyData.latestPoint ? (
          <SignalSummary
            symbol={spyData.symbol}
            latestClose={spyData.latestPoint.close}
            latestSma200={spyData.latestPoint.sma200}
            state={spyData.latestPoint.state}
            lastSwitchDate={spyData.lastSwitchDate}
            holdingDays={spyData.holdingDays}
            lastUpdated={spyData.lastUpdated}
            t={t}
          />
        ) : (
          <ErrorCard symbol={spyData.symbol} error={t.error.noDataAvailable} t={t} />
        )}
      </div>
      
      {/* Tables */}
      <div className="space-y-8">
        {!qqqData.error && qqqData.signals.length > 0 && (
          <Table rows={qqqData.signals} symbol="QQQ" t={t} />
        )}
        {!spyData.error && spyData.signals.length > 0 && (
          <Table rows={spyData.signals} symbol="SPY" t={t} />
        )}
      </div>
    </div>
  );
}