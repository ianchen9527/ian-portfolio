import { getLastSwitchDate, countHoldingDays } from '../summary';
import type { SmaPoint } from '../types';

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

function createSmaPoint(date: string, close: number, sma200: number | null, state: 'UNKNOWN' | 'RISK_ON' | 'RISK_OFF', action: 'NONE' | 'ENTER' | 'EXIT' | 'HOLD'): SmaPoint {
  return { date, close, sma200, state, action };
}

function runAllTests(): void {
  console.log('Running Summary utility tests...\n');

  // Test getLastSwitchDate
  runTest('getLastSwitchDate - finds last ENTER', () => {
    const points: SmaPoint[] = [
      createSmaPoint('2023-01-01', 100, 99, 'RISK_ON', 'NONE'),
      createSmaPoint('2023-01-02', 98, 99, 'RISK_OFF', 'EXIT'),
      createSmaPoint('2023-01-03', 101, 99, 'RISK_ON', 'ENTER'),
      createSmaPoint('2023-01-04', 102, 99, 'RISK_ON', 'HOLD'),
    ];
    
    const result: string | null = getLastSwitchDate(points);
    assertEqual(result, '2023-01-03', 'Should find last ENTER date');
  });

  runTest('getLastSwitchDate - finds last EXIT', () => {
    const points: SmaPoint[] = [
      createSmaPoint('2023-01-01', 101, 99, 'RISK_ON', 'NONE'),
      createSmaPoint('2023-01-02', 102, 99, 'RISK_ON', 'HOLD'),
      createSmaPoint('2023-01-03', 98, 99, 'RISK_OFF', 'EXIT'),
      createSmaPoint('2023-01-04', 97, 99, 'RISK_OFF', 'HOLD'),
    ];
    
    const result: string | null = getLastSwitchDate(points);
    assertEqual(result, '2023-01-03', 'Should find last EXIT date');
  });

  runTest('getLastSwitchDate - returns null when no switches', () => {
    const points: SmaPoint[] = [
      createSmaPoint('2023-01-01', 101, 99, 'RISK_ON', 'NONE'),
      createSmaPoint('2023-01-02', 102, 99, 'RISK_ON', 'HOLD'),
      createSmaPoint('2023-01-03', 103, 99, 'RISK_ON', 'HOLD'),
    ];
    
    const result: string | null = getLastSwitchDate(points);
    assertEqual(result, null, 'Should return null when no switches found');
  });

  // Test countHoldingDays
  runTest('countHoldingDays - counts consecutive RISK_ON days', () => {
    const points: SmaPoint[] = [
      createSmaPoint('2023-01-01', 98, 99, 'RISK_OFF', 'NONE'),
      createSmaPoint('2023-01-02', 101, 99, 'RISK_ON', 'ENTER'),
      createSmaPoint('2023-01-03', 102, 99, 'RISK_ON', 'HOLD'),
      createSmaPoint('2023-01-04', 103, 99, 'RISK_ON', 'HOLD'),
    ];
    
    const result: number = countHoldingDays(points);
    assertEqual(result, 3, 'Should count 3 consecutive RISK_ON days');
  });

  runTest('countHoldingDays - counts consecutive RISK_OFF days', () => {
    const points: SmaPoint[] = [
      createSmaPoint('2023-01-01', 101, 99, 'RISK_ON', 'NONE'),
      createSmaPoint('2023-01-02', 98, 99, 'RISK_OFF', 'EXIT'),
      createSmaPoint('2023-01-03', 97, 99, 'RISK_OFF', 'HOLD'),
    ];
    
    const result: number = countHoldingDays(points);
    assertEqual(result, 2, 'Should count 2 consecutive RISK_OFF days');
  });

  runTest('countHoldingDays - returns 0 for UNKNOWN latest state', () => {
    const points: SmaPoint[] = [
      createSmaPoint('2023-01-01', 101, 99, 'RISK_ON', 'NONE'),
      createSmaPoint('2023-01-02', 98, null, 'UNKNOWN', 'HOLD'),
    ];
    
    const result: number = countHoldingDays(points);
    assertEqual(result, 0, 'Should return 0 for UNKNOWN latest state');
  });

  runTest('countHoldingDays - stops at state change', () => {
    const points: SmaPoint[] = [
      createSmaPoint('2023-01-01', 101, 99, 'RISK_ON', 'NONE'),
      createSmaPoint('2023-01-02', 98, 99, 'RISK_OFF', 'EXIT'),
      createSmaPoint('2023-01-03', 97, 99, 'RISK_OFF', 'HOLD'),
      createSmaPoint('2023-01-04', 101, 99, 'RISK_ON', 'ENTER'),
      createSmaPoint('2023-01-05', 102, 99, 'RISK_ON', 'HOLD'),
    ];
    
    const result: number = countHoldingDays(points);
    assertEqual(result, 2, 'Should stop counting at state change and count only latest consecutive days');
  });

  runTest('countHoldingDays - empty array returns 0', () => {
    const result: number = countHoldingDays([]);
    assertEqual(result, 0, 'Empty array should return 0');
  });

  console.log('\n✓ All Summary utility tests passed!');
}

export { runAllTests };