"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "siftly.theme";

function readStored(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    // ignore
  }
  return "dark";
}

function applyTheme(choice: Theme) {
  const resolved =
    choice === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : choice;
  document.documentElement.setAttribute("data-theme", resolved);
}

export default function ThemePicker() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(readStored());
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    applyTheme(next);
  }

  const options: { value: Theme; label: string; sub: string }[] = [
    {
      value: "light",
      label: "Light",
      sub: "Cream + mint, serif headlines.",
    },
    {
      value: "dark",
      label: "Dark",
      sub: "Default. Deep ink background.",
    },
    {
      value: "system",
      label: "System",
      sub: "Follow your OS / browser setting.",
    },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {options.map((o) => {
        const selected = theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => choose(o.value)}
            className="text-left px-4 py-3 rounded transition-colors"
            style={{
              background: selected ? "var(--accent-soft)" : "var(--bg-elev)",
              border: `1px solid ${selected ? "var(--accent)" : "var(--rule)"}`,
              color: "var(--ink)",
            }}
          >
            <p className="font-display text-base mb-0.5">{o.label}</p>
            <p className="text-xs text-[color:var(--muted)]">{o.sub}</p>
          </button>
        );
      })}
    </div>
  );
}
