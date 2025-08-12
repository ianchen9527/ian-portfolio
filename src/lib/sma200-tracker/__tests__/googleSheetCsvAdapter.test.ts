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
      'CSV header missing required columns: close, sma200. Actual headers: [date, price, volume]'
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
    
    // Should only keep rows with valid YYYY-MM-DD format
    assertEqual(result.length, 2, 'Should only keep valid date formats');
    assertEqual(result.map(r => r.date).sort(), ['2023-01-04', '2023-01-05']);
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
  
  console.log('\n✓ All tests passed!');
}

// Export for manual testing
export { runAllTests };