"use client";

import { useState } from "react";
import { Trade, Direction } from "../types";

interface Props {
  onAdd: (trade: Omit<Trade, "id">) => void;
  onClose: () => void;
}

export default function TradeForm({ onAdd, onClose }: Props) {
  const [direction,  setDirection]  = useState<Direction>("long");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice,  setExitPrice]  = useState("");
  const [lotSize,    setLotSize]    = useState("");

  const entry = parseFloat(entryPrice);
  const exit  = parseFloat(exitPrice);
  const lots  = parseFloat(lotSize);

  const pipsPreview = !isNaN(entry) && !isNaN(exit)
    ? direction === "long" ? (exit - entry) / 0.01 : (entry - exit) / 0.01
    : null;
  const pnlPreview = pipsPreview !== null && !isNaN(lots)
    ? pipsPreview * 10 * lots
    : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const pips = direction === "long" ? (exit - entry) / 0.01 : (entry - exit) / 0.01;
    const pnl  = parseFloat((pips * 10 * lots).toFixed(2));
    onAdd({
      date:       new Date().toISOString().slice(0, 10),
      direction,
      entryPrice: entry,
      exitPrice:  exit,
      lotSize:    lots,
      pnl,
      status:     "closed",
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 backdrop-enter"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 inset-x-0 z-50 sheet-enter rounded-t-3xl"
        style={{
          background: "var(--card)",
          borderTop: "1px solid var(--border-hi)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <h2 className="font-black text-base text-white">Log Trade</h2>
            <p className="text-xs" style={{ color: "var(--muted)" }}>XAU / USD · Gold</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.07)", color: "var(--muted)" }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="px-5 pb-6 space-y-4">
          {/* Direction */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl"
            style={{ background: "var(--card-2, #19172a)", border: "1px solid var(--border)" }}>
            {(["long", "short"] as Direction[]).map((dir) => {
              const active = direction === dir;
              return (
                <button key={dir} type="button" onClick={() => setDirection(dir)}
                  className="py-3.5 rounded-xl text-sm font-black transition-all"
                  style={active ? {
                    background: dir === "long" ? "var(--green-dim)" : "var(--red-dim)",
                    color:      dir === "long" ? "var(--green)"     : "var(--red)",
                    border:     `1px solid ${dir === "long" ? "rgba(13,217,168,0.3)" : "rgba(255,82,97,0.3)"}`,
                    boxShadow:  `0 0 10px ${dir === "long" ? "var(--green-glow)" : "var(--red-glow)"}`,
                  } : { color: "var(--muted)", border: "1px solid transparent" }}
                >
                  {dir === "long" ? "▲  Buy" : "▼  Sell"}
                </button>
              );
            })}
          </div>

          {/* Entry / Exit */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Entry Price">
              <input type="number" inputMode="decimal" step="0.01"
                value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="2650.00" required />
            </Field>
            <Field label="Exit Price">
              <input type="number" inputMode="decimal" step="0.01"
                value={exitPrice} onChange={(e) => setExitPrice(e.target.value)}
                placeholder="2670.00" required />
            </Field>
          </div>

          {/* Lot size */}
          <Field label="Lot Size">
            <input type="number" inputMode="decimal" step="0.01"
              value={lotSize} onChange={(e) => setLotSize(e.target.value)}
              placeholder="0.10" required />
          </Field>

          {/* P&L preview */}
          {pnlPreview !== null && (
            <div className="rounded-xl px-4 py-3 flex items-center justify-between"
              style={{ background: "var(--card-2, #19172a)", border: "1px solid var(--border)" }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                P&L Preview
              </span>
              <span
                className="text-base font-black"
                style={{
                  color: pnlPreview >= 0 ? "var(--green)" : "var(--red)",
                  textShadow: pnlPreview >= 0 ? "0 0 12px var(--green-glow)" : "0 0 12px var(--red-glow)",
                }}
              >
                {pnlPreview >= 0 ? "+" : ""}${pnlPreview.toFixed(2)}
              </span>
            </div>
          )}

          <button type="submit"
            className="w-full py-4 rounded-2xl text-base font-black text-black"
            style={{
              background: "linear-gradient(135deg, var(--gold-hi), var(--gold))",
              boxShadow:  "0 4px 20px var(--gold-glow)",
            }}>
            Save Trade
          </button>
        </form>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--muted)" }}>
        {label}
      </label>
      {(() => {
        const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
        return (
          <child.type
            {...child.props}
            className="w-full px-4 py-3.5 rounded-xl text-base text-white focus:outline-none"
            style={{
              background: "var(--card-2, #19172a)",
              border: "1px solid var(--border)",
              ...(child.props.style ?? {}),
            }}
            onFocus={(e: React.FocusEvent<HTMLElement>) => (e.target as HTMLElement).style.borderColor = "var(--gold)"}
            onBlur={(e: React.FocusEvent<HTMLElement>)  => (e.target as HTMLElement).style.borderColor = "var(--border)"}
          />
        );
      })()}
    </div>
  );
}
