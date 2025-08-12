import type { SmaPoint } from './types';

/**
 * Finds the last date when an ENTER or EXIT action occurred
 * Scans from the end of the array backwards
 * 
 * @param points Array of SmaPoint data (oldest → newest)
 * @returns Date string of last switch or null if no switches found
 */
export function getLastSwitchDate(points: SmaPoint[]): string | null {
  for (let i = points.length - 1; i >= 0; i--) {
    const point: SmaPoint = points[i];
    if (point.action === 'ENTER' || point.action === 'EXIT') {
      return point.date;
    }
  }
  return null;
}

/**
 * Counts consecutive days from the end with the same non-UNKNOWN state as the latest row
 * 
 * @param points Array of SmaPoint data (oldest → newest)  
 * @returns Number of consecutive holding days
 */
export function countHoldingDays(points: SmaPoint[]): number {
  if (points.length === 0) {
    return 0;
  }
  
  const latestPoint: SmaPoint = points[points.length - 1];
  
  // If latest state is UNKNOWN, return 0
  if (latestPoint.state === 'UNKNOWN') {
    return 0;
  }
  
  const targetState = latestPoint.state;
  let holdingDays: number = 0;
  
  // Count backwards from the end while state matches and is not UNKNOWN
  for (let i = points.length - 1; i >= 0; i--) {
    const point: SmaPoint = points[i];
    
    if (point.state === targetState) {
      holdingDays++;
    } else {
      break;
    }
  }
  
  return holdingDays;
}