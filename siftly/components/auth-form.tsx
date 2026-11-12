"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function AuthForm({
  initialMode = "signin",
}: {
  initialMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          // Confirmation disabled in Supabase — user is signed in immediately.
          router.push("/dashboard");
          router.refresh();
        } else {
          // Confirmation enabled — show a note instead of redirecting.
          setInfo("Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="eyebrow">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="input"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="eyebrow">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="input"
        />
      </label>

      {error && (
        <p className="text-sm" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
      {info && (
        <p className="text-sm" style={{ color: "var(--accent-ink)" }}>
          {info}
        </p>
      )}

      <label className="flex items-center gap-2 text-sm cursor-pointer select-none mt-1">
        <input
          type="checkbox"
          defaultChecked
          className="w-4 h-4 accent-[color:var(--accent)]"
        />
        <span>Keep me signed in</span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary mt-2"
      >
        {loading
          ? "Working…"
          : mode === "signin"
            ? "Sign in"
            : "Create account"}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
          setInfo(null);
        }}
        className="btn btn-ghost text-sm"
      >
        {mode === "signin"
          ? "Need an account? Sign up"
          : "Already have an account? Sign in"}
      </button>

      <div className="flex items-center gap-3 my-3" aria-hidden>
        <div className="flex-1 h-px bg-[color:var(--rule)]" />
        <span className="eyebrow">or</span>
        <div className="flex-1 h-px bg-[color:var(--rule)]" />
      </div>

      <button
        type="button"
        disabled
        className="btn btn-outline"
        title="Coming soon"
      >
        Continue with Google &middot; soon
      </button>
    </form>
  );
}
