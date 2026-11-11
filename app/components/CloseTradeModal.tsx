"use client";

import { useState } from "react";
import { Trade } from "../types";

interface Props {
  trade: Trade;
  onClose: (exitPrice: number) => void;
  onCancel: () => void;
}

export default function CloseTradeModal({ trade, onClose, onCancel }: Props) {
  const [exitPrice, setExitPrice] = useState("");

  const submit = (e: React.FormEvent) => { e.preventDefault(); onClose(parseFloat(exitPrice)); };

  const pip = 0.01, pipValue = 10;
  const preview =
    exitPrice && !isNaN(parseFloat(exitPrice))
      ? (() => {
          const pips = trade.direction === "long"
            ? (parseFloat(exitPrice) - trade.entryPrice) / pip
            : (trade.entryPrice - parseFloat(exitPrice)) / pip;
          return pips * pipValue * trade.lotSize;
        })()
      : null;

  const isWin  = preview !== null && preview > 0;
  const isLoss = preview !== null && preview < 0;
  const long   = trade.direction === "long";

  return (
    <>
      <div className="fixed inset-0 z-50 backdrop-enter"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)" }}
        onClick={onCancel}
      />
      <div
        className="fixed bottom-0 inset-x-0 z-50 sheet-enter rounded-t-3xl"
        style={{
          background: "var(--card)",
          borderTop:  "1px solid var(--border-hi)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Accent line */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <h2 className="font-black text-base text-white">Close Position</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-lg text-xs font-black"
                style={{
                  background: long ? "var(--green-dim)" : "var(--red-dim)",
                  color:      long ? "var(--green)"     : "var(--red)",
                }}>
                {long ? "▲ LONG" : "▼ SHORT"}
              </span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                Entry ${trade.entryPrice.toFixed(2)} · {trade.lotSize} lots
              </span>
            </div>
          </div>
          <button onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.07)", color: "var(--muted)" }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="px-5 pb-5 space-y-4">
          {/* Exit price */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--muted)" }}>
              Exit Price ($)
            </label>
            <input
              type="number" inputMode="decimal" step="0.01"
              value={exitPrice} onChange={(e) => setExitPrice(e.target.value)}
              placeholder={`e.g. ${(trade.entryPrice + (long ? 10 : -10)).toFixed(2)}`}
              className="w-full px-4 py-4 rounded-xl text-white focus:outline-none"
              style={{
                background: "var(--card-2, #19172a)",
                border: "1px solid var(--border)",
                fontSize: "20px", fontWeight: 700,
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
              onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
              required autoFocus
            />
          </div>

          {/* P&L preview */}
          <div
            className="rounded-2xl py-5 text-center relative overflow-hidden"
            style={
              isWin  ? { background: "var(--green-dim)", border: "1px solid rgba(13,217,168,0.2)" }
            : isLoss ? { background: "var(--red-dim)",   border: "1px solid rgba(255,82,97,0.2)"  }
            :           { background: "var(--card-2, #19172a)", border: "1px solid var(--border)" }
            }
          >
            {/* Background glow blob */}
            {preview !== null && (
              <div style={{
                position: "absolute", inset: 0,
                background: isWin
                  ? "radial-gradient(ellipse at center, var(--green-glow) 0%, transparent 65%)"
                  : "radial-gradient(ellipse at center, var(--red-glow) 0%, transparent 65%)",
                pointerEvents: "none",
              }} />
            )}
            <p className="text-xs font-semibold uppercase tracking-wider mb-2 relative" style={{ color: "var(--muted)" }}>
              Estimated P&L
            </p>
            <p
              className="text-5xl font-black relative"
              style={{
                color: isWin ? "var(--green)" : isLoss ? "var(--red)" : "var(--muted)",
                textShadow: isWin ? "0 0 30px var(--green-glow)" : isLoss ? "0 0 30px var(--red-glow)" : "none",
              }}
            >
              {preview !== null
                ? `${preview >= 0 ? "+" : ""}$${preview.toFixed(2)}`
                : "—"
              }
            </p>
          </div>

          <button type="submit"
            className="w-full py-4 rounded-2xl text-base font-black text-black"
            style={{
              background: "linear-gradient(135deg, var(--gold-hi), var(--gold))",
              boxShadow:  "0 4px 20px var(--gold-glow)",
            }}>
            Confirm Close
          </button>
        </form>
      </div>
    </>
  );
}
