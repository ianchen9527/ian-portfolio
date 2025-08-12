import type { SeriesPayload, Bar } from './types';
import type { DataSource } from './source';

export class GoogleSheetCsvAdapter implements DataSource {
  async fetchDailySeries(symbol: 'QQQ' | 'SPY'): Promise<SeriesPayload> {
    const csvUrl: string = this.getCsvUrl(symbol);
    
    try {
      const response: Response = await fetch(csvUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const csvText: string = await response.text();
      const rows: Bar[] = this.parseCsvToBars(csvText);
      
      if (rows.length < 5) {
        throw new Error(`Insufficient data: expected at least 5 rows, got ${rows.length}`);
      }
      
      const sortedRows: Bar[] = this.sortByDateAscending(rows);
      
      return {
        symbol,
        rows: sortedRows,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch data for ${symbol}: ${error.message}`);
      }
      throw new Error(`Failed to fetch data for ${symbol}: Unknown error`);
    }
  }
  
  private getCsvUrl(symbol: 'QQQ' | 'SPY'): string {
    const url: string | undefined = symbol === 'QQQ' 
      ? process.env.QQQ_CSV_URL 
      : process.env.SPY_CSV_URL;
    
    if (!url) {
      throw new Error(`Missing environment variable: ${symbol}_CSV_URL`);
    }
    
    return url;
  }
  
  private parseCsvToBars(csvText: string): Bar[] {
    const lines: string[] = csvText.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row');
    }
    
    const headerLine: string = lines[0];
    const expectedHeaders: string[] = ['date', 'close', 'sma200'];
    const actualHeaders: string[] = headerLine.split(',').map(h => h.trim().toLowerCase());
    
    if (!expectedHeaders.every(header => actualHeaders.includes(header))) {
      throw new Error(`CSV header must contain: ${expectedHeaders.join(', ')}`);
    }
    
    const dateIndex: number = actualHeaders.indexOf('date');
    const closeIndex: number = actualHeaders.indexOf('close');
    const sma200Index: number = actualHeaders.indexOf('sma200');
    
    const bars: Bar[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line: string = lines[i].trim();
      if (!line) continue;
      
      const columns: string[] = line.split(',').map(col => col.trim());
      
      if (columns.length < Math.max(dateIndex, closeIndex, sma200Index) + 1) {
        continue;
      }
      
      const date: string = columns[dateIndex];
      const closeStr: string = columns[closeIndex];
      const sma200Str: string = columns[sma200Index];
      
      if (!date || !closeStr) {
        continue;
      }
      
      const close: number = parseFloat(closeStr);
      if (isNaN(close)) {
        continue;
      }
      
      let sma200: number | null = null;
      if (sma200Str && sma200Str !== '') {
        const sma200Parsed: number = parseFloat(sma200Str);
        if (!isNaN(sma200Parsed)) {
          sma200 = sma200Parsed;
        }
      }
      
      bars.push({
        date,
        close,
        sma200,
      });
    }
    
    return bars;
  }
  
  private sortByDateAscending(bars: Bar[]): Bar[] {
    return [...bars].sort((a: Bar, b: Bar) => {
      return a.date.localeCompare(b.date);
    });
  }
}