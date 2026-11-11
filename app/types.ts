export type Direction = "long" | "short";

export type TradeStatus = "open" | "closed";

export interface Trade {
  id: string;
  date: string;
  direction: Direction;
  entryPrice: number;
  exitPrice?: number;
  lotSize: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl?: number;
  status: TradeStatus;
  notes?: string;
}
