import type { SeriesPayload, Bar } from './types';
import type { DataSource } from './source';

export class GoogleSheetCsvAdapter implements DataSource {
  async fetchDailySeries(symbol: 'QQQ' | 'SPY'): Promise<SeriesPayload> {
    const csvUrl: string = this.getCsvUrl(symbol);
    
    try {
      const response: Response = await fetch(csvUrl, { cache: 'no-store' });
      
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
    const envVarName: string = `${symbol}_CSV_URL`;
    const url: string | undefined = symbol === 'QQQ' 
      ? process.env.QQQ_CSV_URL 
      : process.env.SPY_CSV_URL;
    
    if (!url) {
      throw new Error(`Missing environment variable: ${envVarName} for symbol ${symbol}`);
    }
    
    return url;
  }
  
  protected parseCsvToBars(csvText: string): Bar[] {
    // Normalize line endings and remove BOM
    const normalizedText: string = csvText
      .replace(/^\uFEFF/, '') // Remove UTF-8 BOM
      .replace(/\r\n?/g, '\n'); // Normalize CRLF/CR to LF
    
    const lines: string[] = normalizedText.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row');
    }
    
    // Parse and validate headers
    const headerLine: string = lines[0].replace(/^\uFEFF/, ''); // Remove BOM from header if present
    const expectedHeaders: string[] = ['date', 'close', 'sma200'];
    const actualHeaders: string[] = headerLine.split(',').map(h => h.trim().toLowerCase());
    
    const missingHeaders: string[] = expectedHeaders.filter(header => !actualHeaders.includes(header));
    if (missingHeaders.length > 0) {
      throw new Error(`CSV header missing required columns: ${missingHeaders.join(', ')}. Actual headers: [${actualHeaders.join(', ')}]`);
    }
    
    const dateIndex: number = actualHeaders.indexOf('date');
    const closeIndex: number = actualHeaders.indexOf('close');
    const sma200Index: number = actualHeaders.indexOf('sma200');
    
    const dateRegex: RegExp = /^\d{4}-\d{2}-\d{2}$/;
    const barsMap: Map<string, Bar> = new Map();
    
    for (let i = 1; i < lines.length; i++) {
      const line: string = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const columns: string[] = line.split(',').map(col => col.trim());
      
      if (columns.length < Math.max(dateIndex, closeIndex, sma200Index) + 1) {
        continue; // Skip rows with insufficient columns
      }
      
      const date: string = columns[dateIndex];
      const closeStr: string = columns[closeIndex];
      const sma200Str: string = columns[sma200Index];
      
      // Validate date format
      if (!date || !dateRegex.test(date)) {
        continue; // Skip rows with invalid dates
      }
      
      // Validate and parse close
      if (!closeStr) {
        continue; // Skip rows without close price
      }
      const close: number = parseFloat(closeStr);
      if (isNaN(close)) {
        continue; // Skip rows with invalid close price
      }
      
      // Parse sma200 (empty string or invalid number becomes null)
      let sma200: number | null = null;
      if (sma200Str && sma200Str !== '') {
        const sma200Parsed: number = parseFloat(sma200Str);
        if (!isNaN(sma200Parsed)) {
          sma200 = sma200Parsed;
        }
      }
      
      // Handle duplicate dates - keep the last occurrence
      barsMap.set(date, {
        date,
        close,
        sma200,
      });
    }
    
    return Array.from(barsMap.values());
  }
  
  private sortByDateAscending(bars: Bar[]): Bar[] {
    return [...bars].sort((a: Bar, b: Bar) => {
      return a.date.localeCompare(b.date);
    });
  }
}