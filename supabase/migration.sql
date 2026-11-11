-- ─────────────────────────────────────────────────────────────
-- Gold Tracker — Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ─────────────────────────────────────────────────────────────

-- 1. TRADES TABLE
CREATE TABLE IF NOT EXISTS public.trades (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  direction    TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  entry_price  NUMERIC(12, 2) NOT NULL,
  exit_price   NUMERIC(12, 2),
  lot_size     NUMERIC(10, 2) NOT NULL,
  stop_loss    NUMERIC(12, 2),
  take_profit  NUMERIC(12, 2),
  pnl          NUMERIC(12, 2),
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. GOALS TABLE  (one row per user — upsert on user_id)
CREATE TABLE IF NOT EXISTS public.goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ROW LEVEL SECURITY
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals  ENABLE ROW LEVEL SECURITY;

-- Users can only see/touch their own rows
CREATE POLICY "own trades" ON public.trades
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own goals" ON public.goals
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS trades_user_date ON public.trades (user_id, date DESC);
CREATE INDEX IF NOT EXISTS trades_user_status ON public.trades (user_id, status);
