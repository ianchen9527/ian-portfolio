'use client';

import { useState, useMemo, useCallback } from 'react';
import type { ReactElement, ChangeEvent } from 'react';
import type { SmaPoint } from '@/lib/sma200-tracker';

export interface TableProps {
  rows: SmaPoint[];
  symbol?: string; // Optional symbol for display
}

function formatCurrency(value: number | null): string {
  if (value === null) return '-';
  return `$${value.toFixed(2)}`;
}

function formatState(state: string): string {
  switch (state) {
    case 'RISK_ON':
      return 'Risk On';
    case 'RISK_OFF':
      return 'Risk Off';
    case 'UNKNOWN':
      return 'Unknown';
    default:
      return state;
  }
}

function formatAction(action: string): string {
  return action.charAt(0) + action.slice(1).toLowerCase();
}

export function Table({ rows, symbol }: TableProps): ReactElement {
  const [showSwitchesOnly, setShowSwitchesOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Memoize filtered data
  const filteredRows = useMemo(() => {
    let filtered = rows;

    // Filter by switches if toggle is enabled
    if (showSwitchesOnly) {
      filtered = filtered.filter((row: SmaPoint) => 
        row.action === 'ENTER' || row.action === 'EXIT'
      );
    }

    // Filter by search term (date substring)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((row: SmaPoint) =>
        row.date.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [rows, showSwitchesOnly, searchTerm]);

  const handleSwitchToggle = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setShowSwitchesOnly(e.target.checked);
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Header with controls */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {symbol ? `${symbol} ` : ''}Historical Data
          </h3>
          <div className="text-sm text-gray-500">
            {filteredRows.length} of {rows.length} rows
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search input */}
          <div className="flex-1">
            <label htmlFor="date-search" className="sr-only">
              Search by date
            </label>
            <input
              id="date-search"
              type="text"
              placeholder="Search by date (e.g., 2023-01)"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Toggle switch */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showSwitchesOnly}
                onChange={handleSwitchToggle}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
              />
              Show switches only
            </label>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Close
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                SMA200
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                State
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No data found
                  {searchTerm && ' for the given search criteria'}
                  {showSwitchesOnly && !searchTerm && ' - no signal switches in this dataset'}
                </td>
              </tr>
            ) : (
              filteredRows.map((row: SmaPoint, index: number) => {
                const isEvenRow = index % 2 === 0;
                const isSignalRow = row.action === 'ENTER' || row.action === 'EXIT';
                
                return (
                  <tr 
                    key={`${row.date}-${index}`}
                    className={`${isEvenRow ? 'bg-white' : 'bg-gray-50'} ${
                      isSignalRow ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">
                      {row.date}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-right text-gray-900">
                      {formatCurrency(row.close)}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-right text-gray-700">
                      {formatCurrency(row.sma200)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        row.state === 'RISK_ON' 
                          ? 'bg-gray-100 text-gray-800'
                          : row.state === 'RISK_OFF'
                          ? 'bg-gray-50 text-gray-700'
                          : 'bg-gray-50 text-gray-600'
                      }`}>
                        {formatState(row.state)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        row.action === 'ENTER'
                          ? 'bg-green-100 text-green-800'
                          : row.action === 'EXIT'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {formatAction(row.action)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with row count */}
      {filteredRows.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
          Showing {filteredRows.length} row{filteredRows.length !== 1 ? 's' : ''}
          {filteredRows.length !== rows.length && ` of ${rows.length} total`}
        </div>
      )}
    </div>
  );
}