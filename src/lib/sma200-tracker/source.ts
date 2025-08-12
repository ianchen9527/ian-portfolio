import type { SeriesPayload } from './types';

export interface DataSource {
  fetchDailySeries(symbol: 'QQQ' | 'SPY'): Promise<SeriesPayload>;
}