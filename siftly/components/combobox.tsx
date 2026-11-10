"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

// ---------------------------------------------------------------- matching ---

const STOPWORDS = new Set([
  "of", "at", "the", "in", "and", "for", "a", "an", "to", "on",
]);

// Compute an acronym from a school/place name by taking the first letter
// of each non-stopword word. "Massachusetts Institute of Technology" -> "MIT".
export function acronymOf(name: string): string {
  const words = name.split(/[\s,\-&/.]+/).filter(Boolean);
  const keep = words.filter((w) => !STOPWORDS.has(w.toLowerCase()));
  return keep.map((w) => w[0]?.toUpperCase() ?? "").join("");
}

type Indexed = {
  name: string;
  lower: string;
  acronym: string;
};

function buildIndex(options: string[]): Indexed[] {
  return options.map((name) => ({
    name,
    lower: name.toLowerCase(),
    acronym: acronymOf(name).toLowerCase(),
  }));
}

function filterOptions(
  query: string,
  index: Indexed[],
  aliases?: Record<string, string[]>,
  max = 10
): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const aliasTargets = new Set(
    (aliases?.[q] ?? []).map((t) => t.toLowerCase())
  );

  const results: { name: string; rank: number }[] = [];
  for (const item of index) {
    let rank = 0;
    if (aliasTargets.has(item.lower)) rank = 5;
    else if (item.lower.startsWith(q)) rank = 4;
    else if (item.acronym && item.acronym.startsWith(q)) rank = 3;
    else if (item.lower.includes(q)) rank = 2;
    else if (item.acronym && item.acronym.includes(q)) rank = 1;

    if (rank > 0) results.push({ name: item.name, rank });
    if (results.length >= max * 4) break; // widen before trimming
  }

  results.sort((a, b) => b.rank - a.rank || a.name.length - b.name.length);
  return results.slice(0, max).map((r) => r.name);
}

// ---------------------------------------------------------------- single ----

export function Combobox({
  name,
  label,
  options,
  initial,
  placeholder,
  aliases,
  hint,
}: {
  name: string;
  label: string;
  options: string[];
  initial?: string;
  placeholder?: string;
  aliases?: Record<string, string[]>;
  hint?: string;
}) {
  const inputId = useId();
  const [query, setQuery] = useState(initial ?? "");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const index = useMemo(() => buildIndex(options), [options]);
  const filtered = useMemo(
    () => filterOptions(query, index, aliases, 10),
    [query, index, aliases]
  );

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function select(value: string) {
    setQuery(value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlighted]) select(filtered[highlighted]);
      else setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label htmlFor={inputId} className="eyebrow">
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlighted(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="input"
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-64 overflow-y-auto rounded border shadow-lg"
          style={{
            background: "var(--bg-elev)",
            borderColor: "var(--rule)",
          }}
        >
          {filtered.map((opt, i) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                select(opt);
              }}
              onMouseEnter={() => setHighlighted(i)}
              className="block w-full text-left px-3 py-2 text-sm"
              style={{
                background: i === highlighted ? "var(--bg-side)" : "transparent",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      <input type="hidden" name={name} value={query} />
      {hint && <span className="text-xs text-[color:var(--muted)]">{hint}</span>}
    </div>
  );
}

// ----------------------------------------------------------------- multi ----

export function MultiCombobox({
  name,
  label,
  options,
  initial,
  placeholder,
  disabled,
  hint,
}: {
  name: string;
  label?: string;
  options: string[];
  initial: string[];
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
}) {
  const inputId = useId();
  const [values, setValues] = useState<string[]>(initial);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const index = useMemo(() => buildIndex(options), [options]);
  const filtered = useMemo(() => {
    const matches = filterOptions(query, index, undefined, 10);
    const existing = new Set(values.map((v) => v.toLowerCase()));
    return matches.filter((m) => !existing.has(m.toLowerCase()));
  }, [query, index, values]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function add(val: string) {
    const t = val.trim();
    if (!t) return;
    if (values.some((v) => v.toLowerCase() === t.toLowerCase())) {
      setQuery("");
      return;
    }
    setValues([...values, t]);
    setQuery("");
    setHighlighted(0);
  }
  function remove(i: number) {
    setValues(values.filter((_, j) => j !== i));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (filtered[highlighted] && query) add(filtered[highlighted]);
      else add(query);
    } else if (e.key === "Backspace" && !query && values.length > 0) {
      remove(values.length - 1);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="eyebrow">
          {label}
        </label>
      )}
      <div
        className={`flex flex-wrap gap-1.5 p-2 border rounded min-h-[46px] items-center ${
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
        style={{
          background: "var(--bg-elev)",
          borderColor: "var(--rule)",
        }}
      >
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-sm rounded-full"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent-ink)",
            }}
          >
            {v}
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove ${v}`}
              className="opacity-60 hover:opacity-100 text-base leading-none px-1"
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlighted(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Keep any typed draft when they click elsewhere, don't auto-add.
            // Clicking an option is handled via onMouseDown.
            setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={onKeyDown}
          placeholder={values.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="flex-1 min-w-[140px] bg-transparent outline-none text-sm py-1 px-1"
          autoComplete="off"
        />
      </div>
      {open && filtered.length > 0 && !disabled && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-64 overflow-y-auto rounded border shadow-lg"
          style={{
            background: "var(--bg-elev)",
            borderColor: "var(--rule)",
          }}
        >
          {filtered.map((opt, i) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                add(opt);
              }}
              onMouseEnter={() => setHighlighted(i)}
              className="block w-full text-left px-3 py-2 text-sm"
              style={{
                background: i === highlighted ? "var(--bg-side)" : "transparent",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      <input type="hidden" name={name} value={values.join(", ")} />
      {hint && <span className="text-xs text-[color:var(--muted)]">{hint}</span>}
    </div>
  );
}
