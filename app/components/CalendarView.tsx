"use client";

import { useState, useMemo } from "react";
import { Trade } from "../types";

interface DayStats { pnl: number; count: number; trades: Trade[]; }
interface Props { trades: Trade[]; }

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function fmt(pnl: number): string {
  const abs = Math.abs(pnl);
  const sign = pnl >= 0 ? "+" : "-";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(2)}`;
}

export default function CalendarView({ trades }: Props) {
  const today = new Date();
  const [year,  setYear]     = useState(today.getFullYear());
  const [month, setMonth]    = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  const dailyStats = useMemo(() => {
    const map: Record<string, DayStats> = {};
    for (const t of trades) {
      if (t.pnl == null) continue;
      const key = t.date;
      if (!map[key]) map[key] = { pnl: 0, count: 0, trades: [] };
      map[key].pnl   += t.pnl;
      map[key].count += 1;
      map[key].trades.push(t);
    }
    return map;
  }, [trades]);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const todayKey     = today.toISOString().slice(0, 10);
  const monthPrefix  = `${year}-${String(month + 1).padStart(2, "0")}`;

  const monthEntries = Object.entries(dailyStats).filter(([d]) => d.startsWith(monthPrefix));
  const monthPnl     = monthEntries.reduce((s, [, v]) => s + v.pnl, 0);
  const profitDays   = monthEntries.filter(([, v]) => v.pnl > 0).length;
  const lossDays     = monthEntries.filter(([, v]) => v.pnl < 0).length;
  const tradingDays  = monthEntries.length;
  const bestDay      = monthEntries.length ? monthEntries.reduce((a, b) => a[1].pnl > b[1].pnl ? a : b) : null;
  const worstDay     = monthEntries.length ? monthEntries.reduce((a, b) => a[1].pnl < b[1].pnl ? a : b) : null;

  function prev() { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); setSelected(null); }
  function next() { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); setSelected(null); }

  return (
    <>
      <div className="space-y-3">

        {/* ── Summary card ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border-hi)" }}>
          <div style={{ height: "2px", background: `linear-gradient(90deg, transparent, ${monthPnl >= 0 ? "var(--green)" : "var(--red)"}, transparent)` }} />
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>
                  {MONTHS[month]} {year}
                </p>
                <p className="text-3xl font-black"
                  style={{
                    color: monthPnl >= 0 ? "var(--green)" : "var(--red)",
                    textShadow: monthPnl >= 0 ? "0 0 20px var(--green-glow)" : "0 0 20px var(--red-glow)",
                  }}>
                  {tradingDays > 0 ? (monthPnl >= 0 ? "+" : "") + "$" + monthPnl.toFixed(2) : "$0.00"}
                </p>
              </div>
              <div className="flex gap-3">
                {bestDay && bestDay[1].pnl > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--muted)" }}>Best day</p>
                    <p className="text-sm font-black" style={{ color: "var(--green)" }}>+${bestDay[1].pnl.toFixed(2)}</p>
                  </div>
                )}
                {worstDay && worstDay[1].pnl < 0 && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--muted)" }}>Worst day</p>
                    <p className="text-sm font-black" style={{ color: "var(--red)" }}>${worstDay[1].pnl.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Trading Days", value: tradingDays,  color: "var(--text)" },
                { label: "Win Days",     value: profitDays,   color: "var(--green)" },
                { label: "Loss Days",    value: lossDays,     color: "var(--red)" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl px-3 py-2.5 text-center"
                  style={{ background: "var(--card-2, #19172a)", border: "1px solid var(--border)" }}>
                  <p className="text-lg font-black" style={{ color }}>{value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: "var(--muted)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Calendar ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>

          {/* Nav */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <button onClick={prev}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--card-2, #19172a)", color: "var(--muted)", border: "1px solid var(--border)" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(null); }}
              className="text-sm font-black" style={{ color: "var(--text)" }}>
              {MONTHS[month]} {year}
            </button>
            <button onClick={next}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--card-2, #19172a)", color: "var(--muted)", border: "1px solid var(--border)" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-2 pt-3 pb-2">
            {DAYS.map((d, i) => (
              <p key={i} className="text-center text-[10px] font-bold uppercase tracking-wider"
                style={{ color: i === 0 || i === 6 ? "rgba(106,96,128,0.5)" : "var(--muted)" }}>
                {d}
              </p>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1 px-2 pb-3">
            {Array.from({ length: firstWeekday }).map((_, i) => <div key={`e${i}`} />)}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day     = i + 1;
              const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const stats   = dailyStats[dateKey];
              const isToday    = dateKey === todayKey;
              const isSelected = dateKey === selected;
              const hasData    = !!stats;
              const isWin      = hasData && stats.pnl > 0;
              const isLoss     = hasData && stats.pnl < 0;
              const isWeekend  = new Date(year, month, day).getDay() % 6 === 0;

              return (
                <button
                  key={day}
                  onClick={() => hasData && setSelected(isSelected ? null : dateKey)}
                  className="rounded-xl flex flex-col items-center justify-center gap-0.5"
                  style={{
                    minHeight: "58px",
                    cursor: hasData ? "pointer" : "default",
                    background: isSelected
                      ? isWin ? "rgba(13,217,168,0.2)" : "rgba(255,82,97,0.2)"
                      : isWin  ? "rgba(13,217,168,0.08)"
                      : isLoss ? "rgba(255,82,97,0.08)"
                      : "transparent",
                    border: isToday
                      ? "1.5px solid var(--gold)"
                      : isSelected
                      ? `1.5px solid ${isWin ? "rgba(13,217,168,0.5)" : "rgba(255,82,97,0.5)"}`
                      : hasData
                      ? `1px solid ${isWin ? "rgba(13,217,168,0.2)" : "rgba(255,82,97,0.2)"}`
                      : "1px solid transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <span className="text-xs font-bold leading-none"
                    style={{
                      color: isToday ? "var(--gold)"
                        : hasData ? "var(--text)"
                        : isWeekend ? "rgba(106,96,128,0.4)"
                        : "var(--muted)",
                    }}>
                    {day}
                  </span>
                  {hasData && (
                    <span style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      lineHeight: 1,
                      color: isWin ? "var(--green)" : "var(--red)",
                      textShadow: isWin ? "0 0 6px var(--green-glow)" : "0 0 6px var(--red-glow)",
                    }}>
                      {fmt(stats.pnl)}
                    </span>
                  )}
                  {hasData && stats.count > 1 && (
                    <span className="w-1 h-1 rounded-full"
                      style={{ background: isWin ? "var(--green)" : "var(--red)" }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 px-4 py-3 text-xs"
            style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(13,217,168,0.15)", border: "1px solid rgba(13,217,168,0.4)" }} />
              Profit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(255,82,97,0.15)", border: "1px solid rgba(255,82,97,0.4)" }} />
              Loss
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ border: "1.5px solid var(--gold)" }} />
              Today
            </span>
          </div>
        </div>
      </div>

      {/* ── Day sheet ── */}
      {selected && dailyStats[selected] && (
        <DaySheet date={selected} stats={dailyStats[selected]} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function DaySheet({ date, stats, onClose }: { date: string; stats: DayStats; onClose: () => void }) {
  const isWin = stats.pnl > 0;
  const formatted = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <>
      <div className="fixed inset-0 z-50 backdrop-enter"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)" }}
        onClick={onClose} />
      <div className="fixed bottom-0 inset-x-0 z-50 sheet-enter rounded-t-3xl"
        style={{
          background: "var(--card)",
          borderTop: "1px solid var(--border-hi)",
          maxHeight: "80dvh",
          display: "flex", flexDirection: "column",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
        <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${isWin ? "var(--green)" : "var(--red)"}, transparent)` }} />

        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>

        <div className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p className="font-black text-white">{formatted}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{stats.count} trade{stats.count !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-black"
              style={{
                color: isWin ? "var(--green)" : "var(--red)",
                textShadow: isWin ? "0 0 16px var(--green-glow)" : "0 0 16px var(--red-glow)",
              }}>
              {stats.pnl >= 0 ? "+" : ""}${stats.pnl.toFixed(2)}
            </p>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.07)", color: "var(--muted)" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-3">
          {stats.trades.map((t) => {
            const long = t.direction === "long";
            const pnl  = t.pnl ?? 0;
            const side = long
              ? { color: "var(--green)", dim: "var(--green-dim)", label: "▲ BUY" }
              : { color: "var(--red)",   dim: "var(--red-dim)",   label: "▼ SELL" };
            return (
              <div key={t.id} className="rounded-2xl overflow-hidden"
                style={{ background: "var(--card-2, #19172a)", border: "1px solid var(--border)", borderLeft: `3px solid ${pnl >= 0 ? "var(--green)" : "var(--red)"}` }}>
                <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black"
                    style={{ background: side.dim, color: side.color }}>{side.label}</span>
                  <span className="text-base font-black"
                    style={{
                      color: pnl >= 0 ? "var(--green)" : "var(--red)",
                      textShadow: pnl >= 0 ? "0 0 10px var(--green-glow)" : "0 0 10px var(--red-glow)",
                    }}>
                    {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-3 px-4 pb-4 gap-2">
                  {[["Entry", `$${t.entryPrice.toFixed(2)}`], ["Exit", t.exitPrice ? `$${t.exitPrice.toFixed(2)}` : "—"], ["Lots", `${t.lotSize}`]].map(([l, v]) => (
                    <div key={l}>
                      <p className="text-xs mb-0.5" style={{ color: "var(--muted)" }}>{l}</p>
                      <p className="text-sm font-semibold text-white">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
