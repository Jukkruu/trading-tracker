"use client";

import { Trade } from "../types";

interface Props {
  trades: Trade[];
  onDelete: (id: string) => void;
}

export default function TradeLog({ trades, onDelete }: Props) {
  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--muted)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-white mb-1">No trades yet</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Tap <span style={{ color: "var(--gold)" }}>+</span> to log your first trade
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary row */}
      <p className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: "var(--muted)" }}>
        {trades.length} trades · {trades.filter((t) => t.status === "open").length} open · {trades.filter((t) => t.status === "closed").length} closed
      </p>

      {trades.map((t) => {
        const long    = t.direction === "long";
        const isOpen  = t.status === "open";
        const pnl     = t.pnl ?? 0;
        const hasP    = t.pnl !== undefined;
        const side    = long
          ? { color: "var(--green)", dim: "var(--green-dim)", label: "▲ LONG" }
          : { color: "var(--red)",   dim: "var(--red-dim)",   label: "▼ SHORT" };

        return (
          <div
            key={t.id}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--card)",
              border:     "1px solid var(--border)",
              borderLeft: `3px solid ${side.color}`,
            }}
          >
            {/* Top accent */}
            <div style={{ height: "1px", background: `linear-gradient(90deg, ${side.color}33, transparent)` }} />

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black"
                  style={{ background: side.dim, color: side.color, letterSpacing: "0.05em" }}>
                  {side.label}
                </span>
                <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>{t.date}</span>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={isOpen
                  ? { background: "rgba(96,165,250,0.1)", color: "#7cb4ff" }
                  : { background: "rgba(106,96,128,0.15)", color: "var(--muted)" }}
              >
                {isOpen ? "● Open" : "✓ Closed"}
              </span>
            </div>

            {/* Price + P&L row */}
            <div className="grid grid-cols-4 px-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
              <Cell label="Entry" value={`$${t.entryPrice.toFixed(2)}`} />
              <Cell label="Exit"  value={t.exitPrice ? `$${t.exitPrice.toFixed(2)}` : "—"} />
              <Cell label="Lots"  value={`${t.lotSize}`} />
              <Cell
                label="P&L"
                value={hasP ? `${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}` : "—"}
                color={hasP ? (pnl >= 0 ? "var(--green)" : "var(--red)") : undefined}
                glow={hasP}
                bold
              />
            </div>

            {/* Notes + actions */}
            <div className="flex items-center justify-between px-4 py-2.5">
              {t.notes
                ? <p className="text-xs flex-1 mr-3 truncate" style={{ color: "var(--muted)" }}>
                    <span style={{ color: "var(--gold)", fontWeight: 700 }}>Note · </span>{t.notes}
                  </p>
                : <span />
              }
              <button onClick={() => onDelete(t.id)} className="p-1.5 rounded-lg shrink-0"
                style={{ color: "var(--muted)" }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Cell({ label, value, color, bold, glow }: {
  label: string; value: string; color?: string; bold?: boolean; glow?: boolean;
}) {
  return (
    <div>
      <p className="text-xs mb-0.5" style={{ color: "var(--muted)" }}>{label}</p>
      <p
        className={bold ? "text-sm font-black" : "text-sm font-semibold"}
        style={{
          color: color ?? "var(--text)",
          textShadow: glow && color
            ? color.includes("green") ? "0 0 10px var(--green-glow)" : "0 0 10px var(--red-glow)"
            : "none",
        }}
      >
        {value}
      </p>
    </div>
  );
}
