import { computeSignals } from '../signalService';
import type { Bar, SmaPoint, State, Action } from '../types';

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

function createBar(date: string, close: number, sma200: number | null): Bar {
  return { date, close, sma200 };
}

function assertSignalPoint(point: SmaPoint, expectedState: State, expectedAction: Action, message?: string): void {
  assertEqual(point.state, expectedState, `${message} - state mismatch`);
  assertEqual(point.action, expectedAction, `${message} - action mismatch`);
}

// Test suite
function runAllTests(): void {
  console.log('Running SignalService unit tests...\n');

  // Test 1: UNKNOWN window
  runTest('UNKNOWN window - large dataset with null sma200 values', () => {
    const bars: Bar[] = [];
    
    // Create 210 rows where first 200 have sma200 = null
    for (let i = 1; i <= 210; i++) {
      const date: string = `2023-01-${i.toString().padStart(2, '0')}`;
      const close: number = 100 + (i * 0.1); // Slightly increasing close prices
      const sma200: number | null = i <= 200 ? null : 100; // First 200 are null
      
      bars.push(createBar(date, close, sma200));
    }
    
    const result: SmaPoint[] = computeSignals(bars);
    
    assertEqual(result.length, 210, 'Should have same length as input');
    
    // Check first row
    assertSignalPoint(result[0], 'UNKNOWN', 'NONE', 'First row');
    
    // Check rows 1-199 (indices 1-199, which are rows 2-200)
    for (let i = 1; i <= 199; i++) {
      assertSignalPoint(result[i], 'UNKNOWN', 'HOLD', `Row ${i + 1} (index ${i})`);
    }
    
    // Verify no ENTER/EXIT in the UNKNOWN window
    const unknownActions: Action[] = result.slice(0, 200).map(p => p.action);
    const enterExitCount: number = unknownActions.filter(a => a === 'ENTER' || a === 'EXIT').length;
    assertEqual(enterExitCount, 0, 'No ENTER/EXIT should appear in UNKNOWN window');
    
    // Check transition from UNKNOWN to known state
    assertSignalPoint(result[200], 'RISK_ON', 'HOLD', 'Row 201 - first with sma200, but transition from UNKNOWN should be HOLD');
  });

  // Test 2: OFF → ON transition
  runTest('OFF → ON transition', () => {
    const bars: Bar[] = [
      createBar('2023-01-01', 95, 100),   // RISK_OFF (95 < 100)
      createBar('2023-01-02', 101, 100),  // RISK_ON (101 > 100) → ENTER
      createBar('2023-01-03', 102, 100),  // RISK_ON (102 > 100) → HOLD
    ];
    
    const result: SmaPoint[] = computeSignals(bars);
    
    assertEqual(result.length, 3);
    
    // Day 1: First row always NONE
    assertSignalPoint(result[0], 'RISK_OFF', 'NONE', 'Day 1');
    
    // Day 2: OFF → ON should be ENTER
    assertSignalPoint(result[1], 'RISK_ON', 'ENTER', 'Day 2');
    
    // Day 3: ON → ON should be HOLD
    assertSignalPoint(result[2], 'RISK_ON', 'HOLD', 'Day 3');
    
    // Verify exactly one ENTER, no EXIT
    const actions: Action[] = result.map(p => p.action);
    const enterCount: number = actions.filter(a => a === 'ENTER').length;
    const exitCount: number = actions.filter(a => a === 'EXIT').length;
    
    assertEqual(enterCount, 1, 'Should have exactly one ENTER');
    assertEqual(exitCount, 0, 'Should have no EXIT');
  });

  // Test 3: ON → OFF transition
  runTest('ON → OFF transition', () => {
    const bars: Bar[] = [
      createBar('2023-01-01', 105, 100),  // RISK_ON (105 > 100)
      createBar('2023-01-02', 99, 100),   // RISK_OFF (99 < 100) → EXIT
      createBar('2023-01-03', 98, 100),   // RISK_OFF (98 < 100) → HOLD
    ];
    
    const result: SmaPoint[] = computeSignals(bars);
    
    assertEqual(result.length, 3);
    
    // Day 1: First row always NONE
    assertSignalPoint(result[0], 'RISK_ON', 'NONE', 'Day 1');
    
    // Day 2: ON → OFF should be EXIT
    assertSignalPoint(result[1], 'RISK_OFF', 'EXIT', 'Day 2');
    
    // Day 3: OFF → OFF should be HOLD
    assertSignalPoint(result[2], 'RISK_OFF', 'HOLD', 'Day 3');
    
    // Verify exactly one EXIT, no ENTER
    const actions: Action[] = result.map(p => p.action);
    const enterCount: number = actions.filter(a => a === 'ENTER').length;
    const exitCount: number = actions.filter(a => a === 'EXIT').length;
    
    assertEqual(enterCount, 0, 'Should have no ENTER');
    assertEqual(exitCount, 1, 'Should have exactly one EXIT');
  });

  // Test 4: Equality treated as OFF
  runTest('Equality treated as OFF', () => {
    const bars: Bar[] = [
      createBar('2023-01-01', 105, 100),  // RISK_ON (105 > 100)
      createBar('2023-01-02', 100, 100),  // RISK_OFF (100 === 100) → EXIT
      createBar('2023-01-03', 100, 100),  // RISK_OFF (100 === 100) → HOLD
    ];
    
    const result: SmaPoint[] = computeSignals(bars);
    
    assertEqual(result.length, 3);
    
    // Day 1: RISK_ON
    assertSignalPoint(result[0], 'RISK_ON', 'NONE', 'Day 1');
    
    // Day 2: Equality should be RISK_OFF and trigger EXIT
    assertSignalPoint(result[1], 'RISK_OFF', 'EXIT', 'Day 2 - equality treated as RISK_OFF');
    
    // Day 3: Still RISK_OFF, should HOLD
    assertSignalPoint(result[2], 'RISK_OFF', 'HOLD', 'Day 3 - continued equality');
    
    // Verify the equality logic
    assertEqual(result[1].close, result[1].sma200, 'Close should equal sma200 on day 2');
    assertEqual(result[2].close, result[2].sma200, 'Close should equal sma200 on day 3');
  });

  // Test 5: Complex sequence with UNKNOWN transitions
  runTest('Complex sequence with UNKNOWN transitions', () => {
    const bars: Bar[] = [
      createBar('2023-01-01', 105, 100),  // RISK_ON
      createBar('2023-01-02', 95, 100),   // RISK_OFF → EXIT
      createBar('2023-01-03', 98, null),  // UNKNOWN → HOLD (from RISK_OFF)
      createBar('2023-01-04', 102, null), // UNKNOWN → HOLD (from UNKNOWN)
      createBar('2023-01-05', 105, 100),  // RISK_ON → HOLD (from UNKNOWN, should not be ENTER)
      createBar('2023-01-06', 95, 100),   // RISK_OFF → EXIT (from RISK_ON)
    ];
    
    const result: SmaPoint[] = computeSignals(bars);
    
    assertEqual(result.length, 6);
    
    assertSignalPoint(result[0], 'RISK_ON', 'NONE', 'Day 1');
    assertSignalPoint(result[1], 'RISK_OFF', 'EXIT', 'Day 2');
    assertSignalPoint(result[2], 'UNKNOWN', 'HOLD', 'Day 3 - transition to UNKNOWN');
    assertSignalPoint(result[3], 'UNKNOWN', 'HOLD', 'Day 4 - stay in UNKNOWN');
    assertSignalPoint(result[4], 'RISK_ON', 'HOLD', 'Day 5 - from UNKNOWN, should be HOLD not ENTER');
    assertSignalPoint(result[5], 'RISK_OFF', 'EXIT', 'Day 6 - normal EXIT');
    
    // Verify UNKNOWN transitions don't produce ENTER/EXIT
    assertEqual(result[4].action, 'HOLD', 'Transition from UNKNOWN should never be ENTER');
  });

  // Test 6: Empty array
  runTest('Empty array handling', () => {
    const result: SmaPoint[] = computeSignals([]);
    assertEqual(result.length, 0, 'Empty input should return empty array');
  });

  // Test 7: Single row
  runTest('Single row handling', () => {
    const bars: Bar[] = [createBar('2023-01-01', 105, 100)];
    const result: SmaPoint[] = computeSignals(bars);
    
    assertEqual(result.length, 1);
    assertSignalPoint(result[0], 'RISK_ON', 'NONE', 'Single row should always have action NONE');
  });

  console.log('\n✓ All SignalService tests passed!');
}

// Export for manual testing
export { runAllTests };