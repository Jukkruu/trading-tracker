"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";
import { Trade } from "../types";

interface Props {
  trades: Trade[];
  winRate: number;
  streak: number;
}

export default function Stats({ trades, winRate, streak }: Props) {
  const closed = trades.filter((t) => t.status === "closed" && t.pnl !== undefined);

  if (closed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--muted)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-white mb-1">No statistics yet</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Close some trades to see your performance</p>
        </div>
      </div>
    );
  }

  const totalPnl    = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const wins        = closed.filter((t) => (t.pnl ?? 0) > 0);
  const losses      = closed.filter((t) => (t.pnl ?? 0) <= 0);
  const avgWin      = wins.length   > 0 ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length     : 0;
  const avgLoss     = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0)) / losses.length : 0;
  const rr          = avgLoss > 0 ? avgWin / avgLoss : 0;
  const grossWin    = wins.reduce((s, t)   => s + (t.pnl ?? 0), 0);
  const grossLoss   = losses.reduce((s, t) => s + Math.abs(t.pnl ?? 0), 0);
  const pf          = grossLoss > 0 ? grossWin / grossLoss : Infinity;
  const up          = totalPnl >= 0;

  /* Equity curve */
  const sorted = [...closed].sort((a, b) => a.date.localeCompare(b.date));
  let running = 0;
  const curve = sorted.map((t, i) => {
    running += t.pnl ?? 0;
    return { label: `#${i + 1}`, equity: parseFloat(running.toFixed(2)) };
  });

  /* Max drawdown */
  let peak = 0, maxDD = 0;
  for (const p of curve) {
    if (p.equity > peak) peak = p.equity;
    if (peak - p.equity > maxDD) maxDD = peak - p.equity;
  }

  return (
    <div className="space-y-3">

      {/* ── Hero P&L ── */}
      <div
        className="rounded-2xl px-5 py-4 relative overflow-hidden"
        style={{
          background: up ? "rgba(13,217,168,0.07)" : "rgba(255,82,97,0.07)",
          border: `1px solid ${up ? "rgba(13,217,168,0.2)" : "rgba(255,82,97,0.2)"}`,
        }}
      >
        {/* Glow behind number */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "200px", height: "80px",
          background: up ? "radial-gradient(ellipse, var(--green-glow) 0%, transparent 70%)" : "radial-gradient(ellipse, var(--red-glow) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>
          Total P&L
        </p>
        <p
          className="text-5xl font-black leading-none mb-2"
          style={{
            color: up ? "var(--green)" : "var(--red)",
            textShadow: up ? "0 0 32px var(--green-glow)" : "0 0 32px var(--red-glow)",
          }}
        >
          {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
        </p>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          {closed.length} closed trades
        </p>
      </div>

      {/* ── Win rate + streak ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Win rate with ring */}
        <div className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Win Rate</p>
          <p className="text-3xl font-black mb-2" style={{ color: "var(--text)" }}>
            {winRate.toFixed(1)}<span className="text-lg" style={{ color: "var(--muted)" }}>%</span>
          </p>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${winRate}%`,
                background: "linear-gradient(90deg, var(--green), #3fffd6)",
                boxShadow: "0 0 6px var(--green-glow)",
              }}
            />
          </div>
          <p className="text-xs mt-1.5" style={{ color: "var(--muted)" }}>
            <span style={{ color: "var(--green)" }}>{wins.length}W</span>
            {" · "}
            <span style={{ color: "var(--red)" }}>{losses.length}L</span>
          </p>
        </div>

        {/* Streak */}
        <div className="rounded-2xl p-4 flex flex-col justify-between"
          style={{ background: streak >= 2 ? "rgba(220,165,60,0.08)" : "var(--card)", border: streak >= 2 ? "1px solid var(--border-hi)" : "1px solid var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Streak</p>
          <div>
            <p className="text-3xl font-black" style={{ color: streak >= 2 ? "var(--gold)" : "var(--text)" }}>
              {streak >= 2 ? "🔥" : ""} {streak}
              <span className="text-sm font-medium ml-1" style={{ color: "var(--muted)" }}>days</span>
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              {streak >= 2 ? "Profitable days in a row" : "Consecutive profit days"}
            </p>
          </div>
        </div>
      </div>

      {/* ── 2-col grid ── */}
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Avg Win"       value={`+$${avgWin.toFixed(2)}`}   color="var(--green)" />
        <Metric label="Avg Loss"      value={`-$${avgLoss.toFixed(2)}`}  color="var(--red)"   />
        <Metric label="Risk / Reward" value={rr > 0 ? `1 : ${rr.toFixed(2)}` : "—"} />
        <Metric
          label="Profit Factor"
          value={isFinite(pf) ? pf.toFixed(2) : "∞"}
          color={pf >= 1 ? "var(--green)" : "var(--red)"}
        />
        <Metric label="Max Drawdown"  value={`$${maxDD.toFixed(2)}`}    color={maxDD > 0 ? "var(--red)" : undefined} />
        <Metric label="Total Trades"  value={`${closed.length}`} />
      </div>

      {/* ── Equity curve ── */}
      <div className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {/* Top accent */}
        <div style={{ height: "1px", marginBottom: "1px", background: `linear-gradient(90deg, transparent, ${up ? "var(--green)" : "var(--red)"}, transparent)`, opacity: 0.4 }} />
        <div className="flex items-center justify-between mb-4 mt-3">
          <p className="font-bold text-white">Equity Curve</p>
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{
              background: up ? "var(--green-dim)" : "var(--red-dim)",
              color:      up ? "var(--green)"     : "var(--red)",
            }}
          >
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={curve} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="eqG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={up ? "#0dd9a8" : "#ff5261"} stopOpacity={0.28} />
                <stop offset="95%" stopColor={up ? "#0dd9a8" : "#ff5261"} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#6a6080", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "#6a6080", fontSize: 10 }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `$${v}`}
              width={50}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
            <Tooltip
              contentStyle={{
                background: "#110f1b",
                border: "1px solid var(--border)",
                borderRadius: 10, color: "#ede8f8", fontSize: 12,
              }}
              formatter={(v) => [`$${Number(v).toFixed(2)}`, "Equity"]}
              labelFormatter={(l) => `Trade ${l}`}
            />
            <Area
              type="monotone" dataKey="equity"
              stroke={up ? "#0dd9a8" : "#ff5261"}
              strokeWidth={2.5}
              fill="url(#eqG)"
              dot={{ fill: up ? "#0dd9a8" : "#ff5261", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <p className="text-xl font-black" style={{
        color: color ?? "var(--text)",
        textShadow: color?.includes("green") ? "0 0 12px var(--green-glow)"
                  : color?.includes("red")   ? "0 0 12px var(--red-glow)"
                  : "none",
      }}>
        {value}
      </p>
    </div>
  );
}
