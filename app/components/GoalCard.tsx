"use client";

import { useState } from "react";

interface Props {
  goal: number;
  currentPnl: number;
  onSetGoal: (v: number) => void;
}

export default function GoalCard({ goal, currentPnl, onSetGoal }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const today        = new Date();
  const daysInMonth  = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft     = daysInMonth - today.getDate() + 1;
  const pct          = goal > 0 ? Math.min((currentPnl / goal) * 100, 100) : 0;
  const exceeded     = goal > 0 && currentPnl >= goal;
  const remaining    = goal - currentPnl;
  const up           = currentPnl >= 0;

  /* SVG ring */
  const R    = 36;
  const circ = 2 * Math.PI * R;
  const dash = circ * Math.min(pct / 100, 1);
  const strokeColor = exceeded ? "var(--green)" : "var(--gold)";

  const save = () => {
    const v = parseFloat(draft);
    if (!isNaN(v) && v > 0) onSetGoal(v);
    setEditing(false);
  };

  /* No goal set yet */
  if (goal === 0 && !editing) {
    return (
      <button
        onClick={() => { setDraft(""); setEditing(true); }}
        className="w-full rounded-2xl px-5 py-4 flex items-center gap-3 text-left"
        style={{
          background: "var(--card)",
          border: "1px dashed var(--border-hi)",
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--gold-dim)", color: "var(--gold)" }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--gold)" }}>Set a monthly goal</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Track your progress toward a P&L target</p>
        </div>
      </button>
    );
  }

  /* Editing mode */
  if (editing) {
    return (
      <div
        className="rounded-2xl px-5 py-4"
        style={{ background: "var(--card)", border: "1px solid var(--border-hi)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>
          Monthly Goal ($)
        </p>
        <div className="flex gap-3">
          <input
            type="number"
            inputMode="decimal"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. 1000"
            autoFocus
            className="flex-1 px-4 py-3 rounded-xl text-lg font-bold text-white focus:outline-none"
            style={{
              background: "var(--card-2, #19172a)",
              border: "1px solid var(--border-hi)",
            }}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
          />
          <button
            onClick={save}
            className="px-5 rounded-xl font-bold text-sm text-black"
            style={{ background: "linear-gradient(135deg, var(--gold-hi), var(--gold))" }}
          >
            Save
          </button>
          {goal > 0 && (
            <button
              onClick={() => setEditing(false)}
              className="px-4 rounded-xl text-sm"
              style={{ background: "var(--card-2, #19172a)", color: "var(--muted)", border: "1px solid var(--border)" }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }

  /* Goal set — show ring + progress */
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      {/* Top accent line */}
      <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${exceeded ? "var(--green)" : "var(--gold)"}, transparent)`, opacity: 0.5 }} />

      <div className="flex items-center gap-4 px-5 py-4">
        {/* Ring */}
        <div className="shrink-0 relative">
          <svg width="80" height="80" viewBox="0 0 88 88">
            {/* Background track */}
            <circle cx="44" cy="44" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            {/* Animated progress arc */}
            <circle
              cx="44" cy="44" r={R}
              fill="none"
              stroke={strokeColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              transform="rotate(-90 44 44)"
              style={{ filter: `drop-shadow(0 0 6px ${exceeded ? "var(--green-glow)" : "var(--gold-glow)"})` }}
            />
            {/* Center % */}
            <text
              x="44" y="40"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={exceeded ? "var(--green)" : "var(--gold)"}
              fontSize="14"
              fontWeight="800"
              fontFamily="inherit"
            >
              {pct.toFixed(0)}%
            </text>
            <text
              x="44" y="56"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--muted)"
              fontSize="8"
              fontFamily="inherit"
            >
              {exceeded ? "DONE!" : "of goal"}
            </text>
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Monthly Goal
            </p>
            <button
              onClick={() => { setDraft(String(goal)); setEditing(true); }}
              className="p-1 rounded-lg"
              style={{ color: "var(--muted)" }}
            >
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
            </button>
          </div>

          <p
            className="text-2xl font-black leading-none mb-1"
            style={{ color: up ? "var(--green)" : "var(--red)" }}
          >
            {currentPnl >= 0 ? "+" : ""}${currentPnl.toFixed(0)}
            <span className="text-sm font-medium ml-1" style={{ color: "var(--muted)" }}>
              / ${goal.toLocaleString()}
            </span>
          </p>

          {exceeded ? (
            <p className="text-xs font-semibold" style={{ color: "var(--green)" }}>
              🏆 Goal exceeded by +${(currentPnl - goal).toFixed(2)}
            </p>
          ) : currentPnl > 0 ? (
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              ${remaining.toFixed(2)} to go · {daysLeft}d left
            </p>
          ) : (
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {daysLeft} days left this month
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-4">
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: exceeded
                ? "linear-gradient(90deg, var(--green), #3fffd6)"
                : "linear-gradient(90deg, var(--gold), var(--gold-hi))",
              boxShadow: exceeded ? "0 0 8px var(--green-glow)" : "0 0 8px var(--gold-glow)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
