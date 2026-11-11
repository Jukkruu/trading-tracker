"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Trade } from "../types";

type Row = Record<string, unknown>;

function toTrade(r: Row): Trade {
  return {
    id:          r.id as string,
    date:        r.date as string,
    direction:   r.direction as Trade["direction"],
    entryPrice:  r.entry_price as number,
    exitPrice:   r.exit_price  as number | undefined,
    lotSize:     r.lot_size    as number,
    stopLoss:    r.stop_loss   as number | undefined,
    takeProfit:  r.take_profit as number | undefined,
    pnl:         r.pnl         as number | undefined,
    status:      r.status      as Trade["status"],
    notes:       r.notes       as string | undefined,
  };
}

function toRow(t: Omit<Trade, "id">) {
  return {
    date:         t.date,
    direction:    t.direction,
    entry_price:  t.entryPrice,
    lot_size:     t.lotSize,
    stop_loss:    t.stopLoss    ?? null,
    take_profit:  t.takeProfit  ?? null,
    status:       t.status,
    notes:        t.notes       ?? null,
  };
}

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Initial load ── */
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("trades")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setTrades(data.map(toTrade));
        setLoading(false);
      });
  }, []);

  /* ── Add ── */
  const addTrade = useCallback(async (trade: Omit<Trade, "id">) => {
    const supabase = createClient();
    const tempId = crypto.randomUUID();

    // Optimistic
    setTrades((prev) => [{ ...trade, id: tempId }, ...prev]);

    const { data } = await supabase
      .from("trades")
      .insert(toRow(trade))
      .select()
      .single();

    if (data) {
      setTrades((prev) => prev.map((t) => (t.id === tempId ? toTrade(data) : t)));
    }
  }, []);

  /* ── Close ── */
  const closeTrade = useCallback((id: string, exitPrice: number) => {
    const supabase = createClient();

    setTrades((prev) => {
      const trade = prev.find((t) => t.id === id);
      if (!trade) return prev;

      const pips =
        trade.direction === "long"
          ? (exitPrice - trade.entryPrice) / 0.01
          : (trade.entryPrice - exitPrice) / 0.01;
      const pnl = parseFloat((pips * 10 * trade.lotSize).toFixed(2));

      // Fire-and-forget
      supabase
        .from("trades")
        .update({ exit_price: exitPrice, pnl, status: "closed" })
        .eq("id", id);

      return prev.map((t) =>
        t.id === id ? { ...t, exitPrice, pnl, status: "closed" as const } : t
      );
    });
  }, []);

  /* ── Delete ── */
  const deleteTrade = useCallback((id: string) => {
    const supabase = createClient();
    setTrades((prev) => prev.filter((t) => t.id !== id)); // optimistic
    supabase.from("trades").delete().eq("id", id);
  }, []);

  return { trades, loading, addTrade, closeTrade, deleteTrade };
}
