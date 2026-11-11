"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode]       = useState<"signin" | "signup">("signin");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    const { error: err } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        background: "var(--bg)",
        backgroundImage: `
          radial-gradient(ellipse 90% 45% at 50% -8%, rgba(220,165,60,0.07) 0%, transparent 70%),
          radial-gradient(circle at 1.5px 1.5px, rgba(220,165,60,0.055) 1.5px, transparent 0)
        `,
        backgroundSize: "auto, 28px 28px",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg text-black mb-3"
            style={{
              background: "linear-gradient(135deg, var(--gold-hi), var(--gold))",
              boxShadow: "0 4px 20px var(--gold-glow)",
            }}
          >
            Au
          </div>
          <h1 className="text-xl font-black text-white">Gold Tracker</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            XAU / USD Trading Journal
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: "var(--card)", border: "1px solid var(--border-hi)" }}
        >
          {/* Top accent */}
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

          {/* Mode toggle */}
          <div
            className="grid grid-cols-2 m-4 p-1 rounded-2xl"
            style={{ background: "var(--card-2, #19172a)", border: "1px solid var(--border)" }}
          >
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className="py-2.5 rounded-xl text-sm font-bold transition-all"
                style={
                  mode === m
                    ? { background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid var(--border-hi)" }
                    : { color: "var(--muted)", border: "1px solid transparent" }
                }
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="px-5 pb-6 space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--muted)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3.5 rounded-xl text-base text-white focus:outline-none"
                style={{ background: "var(--card-2, #19172a)", border: "1px solid var(--border)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--muted)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className="w-full px-4 py-3.5 rounded-xl text-base text-white focus:outline-none"
                style={{ background: "var(--card-2, #19172a)", border: "1px solid var(--border)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Error */}
            {error && (
              <p
                className="text-sm px-4 py-3 rounded-xl"
                style={{ background: "var(--red-dim)", color: "var(--red)", border: "1px solid rgba(255,82,97,0.2)" }}
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-base font-black text-black"
              style={{
                background: loading
                  ? "rgba(220,165,60,0.4)"
                  : "linear-gradient(135deg, var(--gold-hi), var(--gold))",
                boxShadow: loading ? "none" : "0 4px 20px var(--gold-glow)",
              }}
            >
              {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>

            {mode === "signup" && (
              <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("signin")}
                  style={{ color: "var(--gold)", fontWeight: 600 }}>
                  Sign in
                </button>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
