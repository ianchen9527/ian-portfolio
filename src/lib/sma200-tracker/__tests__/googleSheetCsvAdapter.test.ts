import { GoogleSheetCsvAdapter } from '../googleSheetCsvAdapter';
import type { Bar } from '../types';

// Test wrapper to access protected methods
class TestableGoogleSheetCsvAdapter extends GoogleSheetCsvAdapter {
  public testParseCsvToBars(csvText: string): Bar[] {
    return this.parseCsvToBars(csvText);
  }
}

// Test utilities
function runTest(testName: string, testFn: () => void): void {
  try {
    testFn();
    console.log(`✓ ${testName}`);
  } catch (error) {
    console.error(`✗ ${testName}: ${error}`);
    throw error;
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string): void {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`${message || 'Assertion failed'}: expected ${expectedStr}, got ${actualStr}`);
  }
}

function assertThrows(fn: () => void, expectedMessage?: string): void {
  try {
    fn();
    throw new Error('Expected function to throw');
  } catch (error) {
    if (expectedMessage && error instanceof Error && !error.message.includes(expectedMessage)) {
      throw new Error(`Expected error message to contain "${expectedMessage}", got "${error.message}"`);
    }
  }
}

// Test suite
function runAllTests(): void {
  console.log('Running GoogleSheetCsvAdapter unit tests...\n');
  
  const adapter = new TestableGoogleSheetCsvAdapter();
  
  // Test 1: Handles CRLF and blank lines
  runTest('Handles CRLF and blank lines', () => {
    const csvWithCRLF = 'date,close,sma200\r\n2023-01-01,100.50,95.80\r\n\r\n2023-01-02,101.25,96.20\r\n2023-01-03,99.75,\r\n\r\n2023-01-04,102.00,97.50\r\n2023-01-05,103.50,98.00';
    
    const result: Bar[] = adapter.testParseCsvToBars(csvWithCRLF);
    
    assertEqual(result.length, 5, 'Should have 5 rows after filtering blanks');
    assertEqual(result[0].date, '2023-01-01');
    assertEqual(result[0].close, 100.50);
    assertEqual(result[0].sma200, 95.80);
    assertEqual(result[2].sma200, null, 'Empty sma200 should be null');
  });
  
  // Test 2: BOM on first header
  runTest('BOM on first header', () => {
    const csvWithBOM = '\uFEFFdate,close,sma200\n2023-01-01,100.50,95.80\n2023-01-02,101.25,96.20\n2023-01-03,99.75,\n2023-01-04,102.00,97.50\n2023-01-05,103.50,98.00';
    
    const result: Bar[] = adapter.testParseCsvToBars(csvWithBOM);
    
    assertEqual(result.length, 5, 'Should parse correctly with BOM');
    assertEqual(result[0].date, '2023-01-01');
  });
  
  // Test 3: Missing required headers
  runTest('Missing required headers', () => {
    const csvMissingHeaders = 'date,price,volume\n2023-01-01,100.50,1000';
    
    assertThrows(
      () => adapter.testParseCsvToBars(csvMissingHeaders),
      'Could not find header with required columns (date, close, sma200) within first 2 lines'
    );
  });
  
  // Test 4: Invalid numbers
  runTest('Invalid numbers', () => {
    const csvInvalidNumbers = 'date,close,sma200\n2023-01-01,abc,95.80\n2023-01-02,101.25,def\n2023-01-03,99.75,\n2023-01-04,102.00,97.50\n2023-01-05,103.50,98.00';
    
    const result: Bar[] = adapter.testParseCsvToBars(csvInvalidNumbers);
    
    // Should skip row with invalid close, but keep row with invalid sma200 as null
    assertEqual(result.length, 4, 'Should skip row with invalid close');
    
    const row2 = result.find(r => r.date === '2023-01-02');
    assertEqual(row2?.sma200, null, 'Invalid sma200 should become null');
    
    const row3 = result.find(r => r.date === '2023-01-03');
    assertEqual(row3?.sma200, null, 'Empty sma200 should be null');
  });
  
  // Test 5: Invalid dates
  runTest('Invalid dates', () => {
    const csvInvalidDates = 'date,close,sma200\n2023-1-1,100.50,95.80\ninvalid-date,101.25,96.20\n2023/01/03,99.75,97.00\n2023-01-04,102.00,97.50\n2023-01-05,103.50,98.00';
    
    const result: Bar[] = adapter.testParseCsvToBars(csvInvalidDates);
    
    // Should only keep rows with valid date formats (YYYY-MM-DD or YYYY/MM/DD)
    // Valid: 2023/01/03 (normalized), 2023-01-04, 2023-01-05
    assertEqual(result.length, 3, 'Should keep valid date formats including normalized slash dates');
    assertEqual(result.map(r => r.date).sort(), ['2023-01-03', '2023-01-04', '2023-01-05']);
  });
  
  // Test 6: Duplicate dates
  runTest('Duplicate dates', () => {
    const csvDuplicates = 'date,close,sma200\n2023-01-01,100.50,95.80\n2023-01-02,101.25,96.20\n2023-01-01,105.00,99.00\n2023-01-03,99.75,97.00\n2023-01-02,110.00,100.00';
    
    const result: Bar[] = adapter.testParseCsvToBars(csvDuplicates);
    
    assertEqual(result.length, 3, 'Should have unique dates only');
    
    // Should keep the last occurrence of each date
    const jan01 = result.find(r => r.date === '2023-01-01');
    assertEqual(jan01?.close, 105.00, 'Should keep last occurrence for 2023-01-01');
    assertEqual(jan01?.sma200, 99.00);
    
    const jan02 = result.find(r => r.date === '2023-01-02');
    assertEqual(jan02?.close, 110.00, 'Should keep last occurrence for 2023-01-02');
    assertEqual(jan02?.sma200, 100.00);
  });
  
  // Test 7: Happy path small sample
  runTest('Happy path small sample', () => {
    const csvHappyPath = 'date,close,sma200\n2023-01-05,103.50,98.00\n2023-01-01,100.50,95.80\n2023-01-03,99.75,\n2023-01-02,101.25,96.20\n2023-01-04,102.00,97.50';
    
    const result: Bar[] = adapter.testParseCsvToBars(csvHappyPath);
    
    assertEqual(result.length, 5, 'Should have all 5 rows');
    
    // Check specific values
    const jan01 = result.find(r => r.date === '2023-01-01');
    assertEqual(jan01?.close, 100.50);
    assertEqual(jan01?.sma200, 95.80);
    
    const jan03 = result.find(r => r.date === '2023-01-03');
    assertEqual(jan03?.close, 99.75);
    assertEqual(jan03?.sma200, null, 'Empty sma200 should be null');
    
    // Note: sorting is handled by sortByDateAscending method, not parseCsvToBars
    // parseCsvToBars only parses and deduplicates
  });
  
  // Test 8: Headers in different order and case
  runTest('Headers in different order and case', () => {
    const csvDifferentOrder = 'SMA200,Date,Close\n95.80,2023-01-01,100.50\n96.20,2023-01-02,101.25\n,2023-01-03,99.75\n97.50,2023-01-04,102.00\n98.00,2023-01-05,103.50';
    
    const result: Bar[] = adapter.testParseCsvToBars(csvDifferentOrder);
    
    assertEqual(result.length, 5, 'Should handle different header order and case');
    assertEqual(result[0].date, '2023-01-01');
    assertEqual(result[0].close, 100.50);
    assertEqual(result[0].sma200, 95.80);
  });

  // Test 9: Metadata rows before header
  runTest('Metadata rows before header', () => {
    const csvWithMetadata = '追蹤標的,qqq,,,,\n , , , , , \ndate,close,sma200\n2023-01-01,100.50,95.80\n2023-01-02,101.25,96.20\n2023-01-03,99.75,\n2023-01-04,102.00,97.50\n2023-01-05,103.50,98.00';
    
    const result: Bar[] = adapter.testParseCsvToBars(csvWithMetadata);
    
    assertEqual(result.length, 5, 'Should parse correctly with metadata rows before header');
    assertEqual(result[0].date, '2023-01-01');
    assertEqual(result[0].close, 100.50);
    assertEqual(result[0].sma200, 95.80);
    assertEqual(result[2].sma200, null, 'Empty sma200 should be null');
  });

  // Test 10: Slash date format normalization
  runTest('Slash date format normalization', () => {
    const csvSlashDates = 'date,close,sma200\n2023/01/01,100.50,95.80\n2023/01/02,101.25,96.20\n2023/01/03,99.75,\n2023/01/04,102.00,97.50\n2023/01/05,103.50,98.00';
    
    const result: Bar[] = adapter.testParseCsvToBars(csvSlashDates);
    
    assertEqual(result.length, 5, 'Should normalize slash dates correctly');
    assertEqual(result[0].date, '2023-01-01', 'Should normalize 2023/01/01 to 2023-01-01');
    assertEqual(result[1].date, '2023-01-02', 'Should normalize 2023/01/02 to 2023-01-02');
    assertEqual(result[0].close, 100.50);
    assertEqual(result[0].sma200, 95.80);
    assertEqual(result[2].sma200, null, 'Empty sma200 should be null');
  });

  // Test 11: Mixed date formats
  runTest('Mixed date formats', () => {
    const csvMixedDates = 'date,close,sma200\n2023-01-01,100.50,95.80\n2023/01/02,101.25,96.20\n2023-01-03,99.75,\n2023/01/04,102.00,97.50\n2023-01-05,103.50,98.00';
    
    const result: Bar[] = adapter.testParseCsvToBars(csvMixedDates);
    
    assertEqual(result.length, 5, 'Should handle mixed date formats');
    assertEqual(result[0].date, '2023-01-01', 'Dash format should remain unchanged');
    assertEqual(result[1].date, '2023-01-02', 'Slash format should be normalized to dash');
    assertEqual(result[2].date, '2023-01-03', 'Dash format should remain unchanged'); 
    assertEqual(result[3].date, '2023-01-04', 'Slash format should be normalized to dash');
    assertEqual(result[4].date, '2023-01-05', 'Dash format should remain unchanged');
  });

  // Test 12: Header detection within first 10 lines
  runTest('Header detection within first 10 lines', () => {
    const csvDeepHeader = 'metadata1,data\nmetadata2,more\nmetadata3,info\nmetadata4,stuff\nmetadata5,things\ndate,close,sma200\n2023-01-01,100.50,95.80\n2023-01-02,101.25,96.20\n2023-01-03,99.75,\n2023-01-04,102.00,97.50\n2023-01-05,103.50,98.00';
    
    const result: Bar[] = adapter.testParseCsvToBars(csvDeepHeader);
    
    assertEqual(result.length, 5, 'Should find header at line 6 and parse data correctly');
    assertEqual(result[0].date, '2023-01-01');
    assertEqual(result[0].close, 100.50);
    assertEqual(result[0].sma200, 95.80);
  });

  // Test 13: No valid header within first 10 lines
  runTest('No valid header within first 10 lines', () => {
    const csvNoHeader = 'metadata1,data\nmetadata2,more\nmetadata3,info\nmetadata4,stuff\nmetadata5,things\nmetadata6,other\nmetadata7,values\nmetadata8,content\nmetadata9,material\nmetadata10,final\ndate,close,sma200\n2023-01-01,100.50,95.80';
    
    assertThrows(
      () => adapter.testParseCsvToBars(csvNoHeader),
      'Could not find header with required columns (date, close, sma200) within first 10 lines'
    );
  });

  // Test 14: Invalid date formats are skipped (both old and new formats)
  runTest('Invalid date formats are skipped', () => {
    const csvInvalidDates = 'date,close,sma200\n2023-01-01,100.50,95.80\n2023/01/02,101.25,96.20\n2023-1-3,99.75,97.00\n23/01/04,102.00,97.50\ninvalid-date,103.50,98.00\n2023-01-05,104.00,98.50';
    
    const result: Bar[] = adapter.testParseCsvToBars(csvInvalidDates);
    
    // Should only keep valid dates: 2023-01-01, 2023/01/02 (normalized), 2023-01-05
    assertEqual(result.length, 3, 'Should skip invalid date formats');
    
    const sortedResult = result.sort((a, b) => a.date.localeCompare(b.date));
    assertEqual(sortedResult[0].date, '2023-01-01');
    assertEqual(sortedResult[1].date, '2023-01-02', 'Should normalize slash date');
    assertEqual(sortedResult[2].date, '2023-01-05');
  });
  
  console.log('\n✓ All tests passed!');
}

// Export for manual testing
export { runAllTests };