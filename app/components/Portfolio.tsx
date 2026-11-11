"use client";

import { Trade } from "../types";

interface Props {
  trades: Trade[];
  onDelete: (id: string) => void;
}

export default function Portfolio({ trades, onDelete }: Props) {
  const open = trades.filter((t) => t.status === "open");

  if (open.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--muted)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-white mb-1">No open positions</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Tap <span style={{ color: "var(--gold)" }}>+</span> to enter a trade
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <SectionLabel text={`${open.length} open position${open.length !== 1 ? "s" : ""}`} />
      {open.map((t) => <PositionCard key={t.id} trade={t} onDelete={onDelete} />)}
    </div>
  );
}

function PositionCard({ trade: t, onDelete }: {
  trade: Trade;
  onDelete: (id: string) => void;
}) {
  const long = t.direction === "long";
  const slPips = t.stopLoss   ? Math.abs(t.entryPrice - t.stopLoss)   / 0.01 : null;
  const tpPips = t.takeProfit ? Math.abs(t.takeProfit - t.entryPrice) / 0.01 : null;
  const rr     = slPips && tpPips ? (tpPips / slPips).toFixed(2) : null;
  const side   = long ? { color: "var(--green)", dim: "var(--green-dim)", label: "▲ LONG" }
                      : { color: "var(--red)",   dim: "var(--red-dim)",   label: "▼ SHORT" };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background:  "var(--card)",
        border:      `1px solid var(--border)`,
        borderLeft:  `3px solid ${side.color}`,
      }}
    >
      {/* Top accent line */}
      <div style={{ height: "1px", background: `linear-gradient(90deg, ${side.color}44, transparent)` }} />

      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
        <div className="flex items-center gap-3">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-black"
            style={{ background: side.dim, color: side.color, letterSpacing: "0.05em" }}
          >
            {side.label}
          </span>
          <span className="font-bold text-sm" style={{ color: "var(--text)" }}>XAU / USD</span>
        </div>
        {/* Live dot */}
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "var(--green)", boxShadow: "0 0 6px var(--green-glow)" }}
          />
          <span className="text-xs font-semibold" style={{ color: "var(--green)" }}>Live</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 px-4 pb-3 gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
        <Stat label="Entry"    value={`$${t.entryPrice.toFixed(2)}`} />
        <Stat label="Lot Size" value={`${t.lotSize}`} />
        <Stat label={rr ? "R : R" : "Date"} value={rr ? `1 : ${rr}` : t.date.slice(5)} />
      </div>

      {/* SL / TP */}
      {(t.stopLoss || t.takeProfit) && (
        <div className="grid grid-cols-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          {t.stopLoss   && <Stat label="Stop Loss"   value={`$${t.stopLoss.toFixed(2)}`}   color="var(--red)"   />}
          {t.takeProfit && <Stat label="Take Profit" value={`$${t.takeProfit.toFixed(2)}`} color="var(--green)" />}
        </div>
      )}

      {/* Notes */}
      {t.notes && (
        <div className="px-4 py-2.5 text-xs" style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
          <span style={{ color: "var(--gold)", fontWeight: 700 }}>Note · </span>{t.notes}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end px-3 pb-3">
        <button
          onClick={() => onDelete(t.id)}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--red-dim)", color: "var(--red)", border: "1px solid rgba(255,82,97,0.2)" }}
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-xs mb-0.5" style={{ color: "var(--muted)" }}>{label}</p>
      <p className="text-sm font-bold" style={{ color: color ?? "var(--text)" }}>{value}</p>
    </div>
  );
}
function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: "var(--muted)" }}>{text}</p>
  );
}
