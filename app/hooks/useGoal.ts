"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function useGoal() {
  const [goal, setGoalState] = useState<number>(0);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("goals")
      .select("amount")
      .maybeSingle()
      .then(({ data }) => {
        if (data) setGoalState(data.amount);
      });
  }, []);

  const setGoal = useCallback(async (amount: number) => {
    const supabase = createClient();
    setGoalState(amount); // optimistic

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("goals")
      .upsert({ user_id: user.id, amount, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  }, []);

  return { goal, setGoal };
}
