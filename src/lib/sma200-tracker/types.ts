export type Bar = {
  date: string;
  close: number;
  sma200: number | null;
};

export type State = 'UNKNOWN' | 'RISK_ON' | 'RISK_OFF';

export type Action = 'NONE' | 'ENTER' | 'EXIT' | 'HOLD';

export type SmaPoint = Bar & {
  state: State;
  action: Action;
};

export type SeriesPayload = {
  symbol: 'QQQ' | 'SPY';
  rows: Bar[];
};