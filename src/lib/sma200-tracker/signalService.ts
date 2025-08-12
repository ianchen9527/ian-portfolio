import type { Bar, SmaPoint, State, Action } from './types';

/**
 * Helper function to determine the state of a single bar based on its SMA200 value
 */
function determineState(bar: Bar): State {
  if (bar.sma200 === null) {
    return 'UNKNOWN';
  }
  
  if (bar.close > bar.sma200) {
    return 'RISK_ON';
  }
  
  // Equality is treated as RISK_OFF
  return 'RISK_OFF';
}

/**
 * Determines the action based on current and previous state
 */
function determineAction(currentState: State, previousState: State | null): Action {
  // First row always has action = 'NONE'
  if (previousState === null) {
    return 'NONE';
  }
  
  // Any transition involving UNKNOWN must not produce ENTER/EXIT
  if (currentState === 'UNKNOWN' || previousState === 'UNKNOWN') {
    return 'HOLD';
  }
  
  // RISK_OFF → RISK_ON transition
  if (previousState === 'RISK_OFF' && currentState === 'RISK_ON') {
    return 'ENTER';
  }
  
  // RISK_ON → RISK_OFF transition
  if (previousState === 'RISK_ON' && currentState === 'RISK_OFF') {
    return 'EXIT';
  }
  
  // All other cases (same state or no valid transition)
  return 'HOLD';
}

/**
 * Computes SMA200 signals for a series of bars
 * Preserves input order and does not mutate the input array
 * 
 * @param rows Array of Bar data (oldest → newest)
 * @returns Array of SmaPoint with computed state and action
 */
export function computeSignals(rows: Bar[]): SmaPoint[] {
  if (rows.length === 0) {
    return [];
  }
  
  const result: SmaPoint[] = [];
  let previousState: State | null = null;
  
  for (let i = 0; i < rows.length; i++) {
    const bar: Bar = rows[i];
    const currentState: State = determineState(bar);
    const action: Action = determineAction(currentState, previousState);
    
    const smaPoint: SmaPoint = {
      date: bar.date,
      close: bar.close,
      sma200: bar.sma200,
      state: currentState,
      action: action,
    };
    
    result.push(smaPoint);
    previousState = currentState;
  }
  
  return result;
}