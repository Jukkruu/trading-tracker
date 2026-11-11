"use client";

import { useMemo, useState, useEffect } from "react";
import { useTrades } from "./hooks/useTrades";
import { Trade }     from "./types";
import { useGoal }   from "./hooks/useGoal";
import TradeForm       from "./components/TradeForm";
import TradeLog        from "./components/TradeLog";
import Portfolio       from "./components/Portfolio";
import Stats           from "./components/Stats";
import CalendarView    from "./components/CalendarView";
import GoalCard        from "./components/GoalCard";

type Tab = "portfolio" | "log" | "calendar" | "stats";

/* ── Streak: consecutive profitable days ending today ── */
function calcStreak(trades: Trade[], today: Date): number {
  const pnlByDay: Record<string, number> = {};
  trades.forEach((t) => {
    if (t.status === "closed" && t.pnl != null)
      pnlByDay[t.date] = (pnlByDay[t.date] ?? 0) + t.pnl;
  });
  let streak = 0;
  const d = new Date(today);
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10);
    if ((pnlByDay[key] ?? 0) > 0) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

export default function Home() {
  const { trades, loading, addTrade, deleteTrade } = useTrades();
  const { goal, setGoal } = useGoal();
  const [tab, setTab]     = useState<Tab>("portfolio");
  const [showForm, setShowForm] = useState(false);
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => { setToday(new Date()); }, []);

  const closed   = trades.filter((t) => t.status === "closed" && t.pnl != null);
  const openCount = trades.filter((t) => t.status === "open").length;
  const totalPnl  = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const wins      = closed.filter((t) => (t.pnl ?? 0) > 0).length;
  const winRate   = closed.length > 0 ? (wins / closed.length) * 100 : 0;
  const streak    = useMemo(() => today ? calcStreak(trades, today) : 0, [trades, today]);

  /* Current month P&L (for goal) */
  const monthPrefix = today ? today.toISOString().slice(0, 7) : "";
  const monthPnl    = closed
    .filter((t) => t.date.startsWith(monthPrefix))
    .reduce((s, t) => s + (t.pnl ?? 0), 0);

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4"
        style={{ height: "100dvh", background: "var(--bg)" }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg text-black"
          style={{
            background: "linear-gradient(135deg, var(--gold-hi), var(--gold))",
            boxShadow:  "0 4px 20px var(--gold-glow)",
          }}
        >
          Au
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: "var(--gold)",
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>

      {/* ── Header ── */}
      <header
        className="shrink-0 flex items-center justify-between px-4"
        style={{
          paddingTop:    `max(env(safe-area-inset-top), 14px)`,
          paddingBottom: "14px",
          background:    "rgba(9,8,14,0.92)",
          backdropFilter:"blur(14px)",
          borderBottom:  "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-black"
            style={{
              background: "linear-gradient(135deg, var(--gold-hi), var(--gold))",
              boxShadow:  "0 2px 10px var(--gold-glow)",
            }}
          >
            Au
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--text)", letterSpacing: "0.02em" }}>
              Gold Tracker
            </p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>XAU / USD</p>
          </div>
        </div>

        {/* Right side stats */}
        <div className="flex items-center gap-3">
          {/* Streak badge */}
          {streak >= 2 && (
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
              style={{ background: "var(--gold-dim)", border: "1px solid var(--border-hi)" }}
            >
              <span className="text-sm">🔥</span>
              <span className="text-xs font-bold" style={{ color: "var(--gold)" }}>{streak}d</span>
            </div>
          )}
          {/* P&L */}
          <div className="text-right">
            <p className="text-xs" style={{ color: "var(--muted)" }}>Total P&L</p>
            <p
              className="text-sm font-black"
              style={{
                color: totalPnl > 0 ? "var(--green)" : totalPnl < 0 ? "var(--red)" : "var(--text)",
                textShadow: totalPnl > 0 ? "0 0 12px var(--green-glow)" : totalPnl < 0 ? "0 0 12px var(--red-glow)" : "none",
              }}
            >
              {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
            </p>
          </div>
        </div>
      </header>

      {/* ── Scrollable content ── */}
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: "80px" }}>
        <div className="px-4 pt-4 space-y-4">

          {/* Goal card — only on portfolio & calendar tabs */}
          {(tab === "portfolio" || tab === "calendar") && (
            <GoalCard goal={goal} currentPnl={monthPnl} onSetGoal={setGoal} />
          )}

          {tab === "portfolio" && (
            <Portfolio trades={trades} onDelete={deleteTrade} />
          )}
          {tab === "log" && (
            <TradeLog trades={trades} onDelete={deleteTrade} />
          )}
          {tab === "calendar" && <CalendarView trades={trades} />}
          {tab === "stats"     && <Stats trades={trades} winRate={winRate} streak={streak} />}
        </div>
      </main>

      {/* ── Bottom Nav ── */}
      <nav
        className="shrink-0 fixed bottom-0 inset-x-0 z-40 flex items-center"
        style={{
          background:    "rgba(9,8,14,0.96)",
          backdropFilter:"blur(18px)",
          borderTop:     "1px solid var(--border)",
          paddingBottom: "env(safe-area-inset-bottom)",
          height:        "calc(62px + env(safe-area-inset-bottom))",
        }}
      >
        <NavBtn active={tab === "portfolio"} onClick={() => setTab("portfolio")} label="Portfolio"
          badge={openCount > 0 ? openCount : undefined}
          icon={<BarChartIcon />}
        />
        <NavBtn active={tab === "log"} onClick={() => setTab("log")} label="Log"
          badge={trades.length > 0 ? trades.length : undefined}
          icon={<ListIcon />}
        />

        {/* FAB */}
        <div className="flex-1 flex justify-center items-center">
          <button
            onClick={() => setShowForm(true)}
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-black"
            style={{
              background:  "linear-gradient(135deg, var(--gold-hi), var(--gold))",
              boxShadow:   "0 0 20px var(--gold-glow), 0 4px 12px rgba(0,0,0,0.5)",
              marginBottom:"10px",
            }}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <NavBtn active={tab === "calendar"} onClick={() => setTab("calendar")} label="Calendar"
          icon={<CalendarIcon />}
        />
        <NavBtn active={tab === "stats"} onClick={() => setTab("stats")} label="Stats"
          icon={<TrendIcon />}
        />
      </nav>

      {showForm && <TradeForm onAdd={addTrade} onClose={() => setShowForm(false)} />}
    </div>
  );
}

/* ─────────── Nav Button ─────────── */
function NavBtn({ active, onClick, icon, label, badge }: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative"
      style={{ color: active ? "var(--gold)" : "var(--muted)" }}
    >
      <div className="relative">
        {icon}
        {badge != null && (
          <span
            className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center text-black"
            style={{ background: "var(--gold)" }}
          >
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-semibold">{label}</span>
      {active && (
        <span className="absolute bottom-0 w-5 h-0.5 rounded-full" style={{ background: "var(--gold)" }} />
      )}
    </button>
  );
}

/* ─────────── Icons ─────────── */
const BarChartIcon = () => (
  <svg width="21" height="21" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);
const ListIcon = () => (
  <svg width="21" height="21" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="21" height="21" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
  </svg>
);
const TrendIcon = () => (
  <svg width="21" height="21" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);
