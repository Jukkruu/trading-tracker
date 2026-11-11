"use client";

import { useState } from "react";
import { Trade, Direction } from "../types";

interface Props {
  onAdd: (trade: Omit<Trade, "id">) => void;
  onClose: () => void;
}

export default function TradeForm({ onAdd, onClose }: Props) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    direction: "long" as Direction,
    entryPrice: "",
    lotSize: "",
    stopLoss: "",
    takeProfit: "",
    notes: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      date: form.date,
      direction: form.direction,
      entryPrice: parseFloat(form.entryPrice),
      lotSize: parseFloat(form.lotSize),
      stopLoss:   form.stopLoss   ? parseFloat(form.stopLoss)   : undefined,
      takeProfit: form.takeProfit ? parseFloat(form.takeProfit) : undefined,
      notes: form.notes || undefined,
      status: "open",
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 backdrop-enter"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)" }}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 inset-x-0 z-50 sheet-enter rounded-t-3xl"
        style={{
          background: "var(--card)",
          borderTop: "1px solid var(--border-hi)",
          maxHeight: "92dvh",
          display: "flex", flexDirection: "column",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Top accent */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <div>
            <h2 className="font-black text-base text-white">New Trade</h2>
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

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={submit} className="px-5 pb-6 space-y-4">

            {/* Direction toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl"
              style={{ background: "var(--card-2, #19172a)", border: "1px solid var(--border)" }}>
              {(["long", "short"] as Direction[]).map((dir) => {
                const active = form.direction === dir;
                return (
                  <button key={dir} type="button" onClick={() => set("direction", dir)}
                    className="py-3.5 rounded-xl text-sm font-black transition-all"
                    style={active ? {
                      background: dir === "long" ? "var(--green-dim)" : "var(--red-dim)",
                      color:      dir === "long" ? "var(--green)"     : "var(--red)",
                      border:     `1px solid ${dir === "long" ? "rgba(13,217,168,0.3)" : "rgba(255,82,97,0.3)"}`,
                      boxShadow:  `0 0 10px ${dir === "long" ? "var(--green-glow)" : "var(--red-glow)"}`,
                    } : { color: "var(--muted)", border: "1px solid transparent" }}
                  >
                    {dir === "long" ? "▲  Long  (Buy)" : "▼  Short  (Sell)"}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Entry Price ($)">
                <input type="number" inputMode="decimal" step="0.01" value={form.entryPrice}
                  onChange={(e) => set("entryPrice", e.target.value)} placeholder="2650.00" required />
              </Field>
              <Field label="Date">
                <input type="date" value={form.date}
                  onChange={(e) => set("date", e.target.value)} required />
              </Field>
            </div>

            <Field label="Lot Size">
              <input type="number" inputMode="decimal" step="0.01" value={form.lotSize}
                onChange={(e) => set("lotSize", e.target.value)} placeholder="0.10" required />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Stop Loss ($)">
                <input type="number" inputMode="decimal" step="0.01" value={form.stopLoss}
                  onChange={(e) => set("stopLoss", e.target.value)} placeholder="Optional" />
              </Field>
              <Field label="Take Profit ($)">
                <input type="number" inputMode="decimal" step="0.01" value={form.takeProfit}
                  onChange={(e) => set("takeProfit", e.target.value)} placeholder="Optional" />
              </Field>
            </div>

            <Field label="Notes (optional)">
              <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
                placeholder="Setup, reason, mindset..." rows={2} style={{ resize: "none" }} />
            </Field>

            <button type="submit"
              className="w-full py-4 rounded-2xl text-base font-black text-black"
              style={{
                background: "linear-gradient(135deg, var(--gold-hi), var(--gold))",
                boxShadow:  "0 4px 20px var(--gold-glow)",
              }}>
              Add Trade
            </button>
          </form>
        </div>
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
