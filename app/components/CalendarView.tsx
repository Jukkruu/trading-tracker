"use client";

import { useState, useMemo } from "react";
import { Trade } from "../types";

interface DayStats {
  pnl: number;
  count: number;
  trades: Trade[];
}

interface Props {
  trades: Trade[];
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["S","M","T","W","T","F","S"];

function fmtPnl(pnl: number): string {
  const abs = Math.abs(pnl);
  if (abs >= 10000) return `${pnl >= 0 ? "+" : "-"}${(abs / 1000).toFixed(0)}k`;
  if (abs >= 1000) return `${pnl >= 0 ? "+" : "-"}${(abs / 1000).toFixed(1)}k`;
  return `${pnl >= 0 ? "+" : ""}${pnl.toFixed(0)}`;
}

export default function CalendarView({ trades }: Props) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  /* ── Build daily stats from closed trades only ── */
  const dailyStats = useMemo(() => {
    const map: Record<string, DayStats> = {};
    for (const t of trades) {
      if (t.status !== "closed" || t.pnl === undefined) continue;
      const key = t.date;
      if (!map[key]) map[key] = { pnl: 0, count: 0, trades: [] };
      map[key].pnl    += t.pnl;
      map[key].count  += 1;
      map[key].trades.push(t);
    }
    return map;
  }, [trades]);

  /* ── Calendar math ── */
  const firstWeekday  = new Date(year, month, 1).getDay();
  const daysInMonth   = new Date(year, month + 1, 0).getDate();
  const todayKey      = today.toISOString().slice(0, 10);
  const monthPrefix   = `${year}-${String(month + 1).padStart(2, "0")}`;

  /* ── Monthly summary ── */
  const monthEntries = Object.entries(dailyStats).filter(([d]) => d.startsWith(monthPrefix));
  const monthPnl     = monthEntries.reduce((s, [, v]) => s + v.pnl, 0);
  const profitDays   = monthEntries.filter(([, v]) => v.pnl > 0).length;
  const lossDays     = monthEntries.filter(([, v]) => v.pnl < 0).length;
  const tradingDays  = monthEntries.length;

  /* ── Best / worst day this month ── */
  const bestDay  = monthEntries.length ? monthEntries.reduce((a, b) => a[1].pnl > b[1].pnl ? a : b) : null;
  const worstDay = monthEntries.length ? monthEntries.reduce((a, b) => a[1].pnl < b[1].pnl ? a : b) : null;

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelected(null);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelected(null);
  }

  const selectedStats = selected ? dailyStats[selected] : null;

  return (
    <>
      <div className="space-y-3">
        {/* ── Monthly summary banner ── */}
        {tradingDays > 0 ? (
          <div
            className="rounded-2xl p-4"
            style={{
              background: monthPnl >= 0 ? "var(--green-dim)" : "var(--red-dim)",
              border: `1px solid ${monthPnl >= 0 ? "rgba(13,217,168,0.2)" : "rgba(255,82,97,0.2)"}`,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>
                  {MONTH_NAMES[month]} {year}
                </p>
                <p
                  className="text-3xl font-black"
                  style={{ color: monthPnl >= 0 ? "var(--green)" : "var(--red)" }}
                >
                  {monthPnl >= 0 ? "+" : ""}${monthPnl.toFixed(2)}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  {tradingDays} trading day{tradingDays !== 1 ? "s" : ""}
                  {" · "}
                  <span style={{ color: "var(--green)" }}>{profitDays}✓</span>
                  {" · "}
                  <span style={{ color: "var(--red)" }}>{lossDays}✗</span>
                </p>
              </div>
              {/* Best / worst */}
              <div className="text-right space-y-1">
                {bestDay && bestDay[1].pnl > 0 && (
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>Best</p>
                    <p className="text-sm font-bold" style={{ color: "var(--green)" }}>
                      +${bestDay[1].pnl.toFixed(2)}
                    </p>
                  </div>
                )}
                {worstDay && worstDay[1].pnl < 0 && (
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>Worst</p>
                    <p className="text-sm font-bold" style={{ color: "var(--red)" }}>
                      ${worstDay[1].pnl.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div>
              <p className="font-semibold text-white">{MONTH_NAMES[month]} {year}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>No trades this month</p>
            </div>
          </div>
        )}

        {/* ── Calendar grid ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          {/* Month nav */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <button
              onClick={prevMonth}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--card-elevated)", color: "var(--muted)" }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(null); }}
              className="font-bold text-white text-sm"
            >
              {MONTH_NAMES[month]} {year}
            </button>

            <button
              onClick={nextMonth}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--card-elevated)", color: "var(--muted)" }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 px-2 pt-3 pb-1">
            {DAY_LABELS.map((d, i) => (
              <div
                key={i}
                className="text-center text-xs font-bold"
                style={{ color: i === 0 || i === 6 ? "rgba(100,116,139,0.6)" : "var(--muted)" }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1 px-2 pb-3">
            {/* Leading empty cells */}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`e${i}`} />
            ))}

            {/* Actual days */}
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
                  className="rounded-xl flex flex-col items-center justify-center"
                  style={{
                    minHeight: "54px",
                    cursor: hasData ? "pointer" : "default",
                    background: isSelected
                      ? isWin ? "rgba(16,185,129,0.22)" : isLoss ? "rgba(239,68,68,0.22)" : "var(--card-elevated)"
                      : isWin   ? "rgba(16,185,129,0.1)"
                      : isLoss  ? "rgba(239,68,68,0.1)"
                      : "transparent",
                    border: isToday
                      ? "1.5px solid var(--gold)"
                      : isSelected
                      ? `1.5px solid ${isWin ? "rgba(16,185,129,0.6)" : "rgba(239,68,68,0.6)"}`
                      : "1.5px solid transparent",
                  }}
                >
                  {/* Day number */}
                  <span
                    className="text-xs font-semibold leading-none mb-1"
                    style={{
                      color: isToday
                        ? "var(--gold)"
                        : hasData
                        ? "var(--text)"
                        : isWeekend
                        ? "rgba(100,116,139,0.5)"
                        : "var(--muted)",
                    }}
                  >
                    {day}
                  </span>

                  {/* P&L label */}
                  {hasData && (
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 700,
                        lineHeight: 1,
                        color: isWin ? "var(--green)" : "var(--red)",
                      }}
                    >
                      {fmtPnl(stats.pnl)}
                    </span>
                  )}

                  {/* Trade count dot */}
                  {hasData && stats.count > 1 && (
                    <span
                      className="mt-0.5 w-1 h-1 rounded-full"
                      style={{ background: isWin ? "var(--green)" : "var(--red)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div
            className="flex items-center justify-center gap-4 px-4 py-3 text-xs"
            style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }} />
              Profit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }} />
              Loss
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded" style={{ border: "1.5px solid var(--gold)" }} />
              Today
            </span>
          </div>
        </div>
      </div>

      {/* ── Day detail bottom sheet ── */}
      {selected && selectedStats && (
        <DaySheet
          date={selected}
          stats={selectedStats}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

/* ────────────────────────────────────────────── */
function DaySheet({
  date,
  stats,
  onClose,
}: {
  date: string;
  stats: DayStats;
  onClose: () => void;
}) {
  const isWin = stats.pnl > 0;

  const formatted = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <>
      <div
        className="fixed inset-0 z-50 backdrop-enter"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 inset-x-0 z-50 sheet-enter rounded-t-3xl"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderBottom: "none",
          maxHeight: "80dvh",
          display: "flex",
          flexDirection: "column",
          paddingBottom: `env(safe-area-inset-bottom)`,
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
        </div>

        {/* Sheet header */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <p className="font-bold text-white">{formatted}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {stats.count} trade{stats.count !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p
              className="text-2xl font-black"
              style={{ color: isWin ? "var(--green)" : "var(--red)" }}
            >
              {stats.pnl >= 0 ? "+" : ""}${stats.pnl.toFixed(2)}
            </p>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.08)", color: "var(--muted)" }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Trade cards */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          {stats.trades.map((t) => {
            const long    = t.direction === "long";
            const tradePnl = t.pnl ?? 0;
            return (
              <div
                key={t.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "var(--card-elevated)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${long ? "var(--green)" : "var(--red)"}`,
                }}
              >
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-bold"
                    style={{
                      background: long ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                      color:      long ? "var(--green)"           : "var(--red)",
                    }}
                  >
                    {long ? "▲ LONG" : "▼ SHORT"}
                  </span>
                  <span
                    className="text-base font-black"
                    style={{ color: tradePnl >= 0 ? "var(--green)" : "var(--red)" }}
                  >
                    {tradePnl >= 0 ? "+" : ""}${tradePnl.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                  {[
                    { label: "Entry", value: `$${t.entryPrice.toFixed(2)}` },
                    { label: "Exit",  value: t.exitPrice ? `$${t.exitPrice.toFixed(2)}` : "—" },
                    { label: "Lots",  value: `${t.lotSize}` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs mb-0.5" style={{ color: "var(--muted)" }}>{label}</p>
                      <p className="text-sm font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>

                {t.notes && (
                  <div
                    className="px-4 py-2.5 text-xs"
                    style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}
                  >
                    <span style={{ color: "var(--gold)", fontWeight: 600 }}>Note · </span>
                    {t.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
