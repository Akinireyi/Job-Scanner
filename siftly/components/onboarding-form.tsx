"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { saveProfile, type ProfileFormState } from "@/app/onboarding/actions";
import schoolsData from "@/data/us-schools.json";

const US_SCHOOLS = (schoolsData as { schools: string[] }).schools;

const GRAD_YEAR_SUGGESTIONS = (() => {
  const base = new Date().getFullYear();
  const years: string[] = [];
  // 1 year back, 6 years forward — covers freshmen through grad students.
  for (let y = base - 1; y <= base + 6; y++) years.push(String(y));
  return years;
})();

export type InitialProfile = {
  display_name?: string | null;
  school?: string | null;
  enrollment_type?: string | null;
  graduation_year?: number | null;
  majors?: string[] | null;
  minors?: string[] | null;
  concentrations?: string[] | null;
  skills?: string[] | null;
  interests?: string[] | null;
  preferred_locations?: string[] | null;
  work_style?: string[] | null;
  location_any?: boolean | null;
  background_notes?: string | null;
};

export default function OnboardingForm({
  initial,
}: {
  initial: InitialProfile;
}) {
  const [state, formAction, isPending] = useActionState<ProfileFormState, FormData>(
    saveProfile,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-12">
      {/* 01 — About */}
      <Section num="01" title="About you" sub="Who you are, where you are in school.">
        <ResumePlaceholder />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Display name"
            name="display_name"
            defaultValue={initial.display_name ?? ""}
            placeholder="Inika"
          />
          <Field
            label="School"
            name="school"
            placeholder="Indiana University"
            defaultValue={initial.school ?? ""}
            listId="us-schools-list"
            hint="US universities + community colleges. Type anything if yours isn't suggested."
          />
          <SelectField
            label="Enrollment"
            name="enrollment_type"
            defaultValue={initial.enrollment_type ?? "undergrad"}
            options={[
              { value: "undergrad", label: "Undergraduate" },
              { value: "masters", label: "Master's" },
              { value: "newgrad", label: "New grad" },
              { value: "jobseeker", label: "Job seeker" },
            ]}
          />
          <Field
            label="Graduation year"
            name="graduation_year"
            type="number"
            placeholder="2029"
            defaultValue={initial.graduation_year?.toString() ?? ""}
            listId="grad-year-list"
            hint="Any year — Siftly figures out your class from this."
          />
        </div>
        <SchoolsDatalist />
        <GradYearDatalist />
      </Section>

      {/* 02 — Study */}
      <Section
        num="02"
        title="What you study"
        sub="Add as many majors, minors, or concentrations as you have."
      >
        <div className="grid sm:grid-cols-3 gap-6">
          <AddMoreList
            label="Major(s)"
            name="majors"
            addLabel="+ Add major"
            placeholder="Computer Science"
            initial={initial.majors ?? []}
          />
          <AddMoreList
            label="Minor(s)"
            name="minors"
            addLabel="+ Add minor"
            placeholder="Business"
            initial={initial.minors ?? []}
          />
          <AddMoreList
            label="Concentration(s)"
            name="concentrations"
            addLabel="+ Add concentration"
            placeholder="AI"
            initial={initial.concentrations ?? []}
          />
        </div>
      </Section>

      {/* 03 — Skills + Interests */}
      <Section
        num="03"
        title="What you're good at and what you care about"
        sub="Type a skill or interest, then press Enter or comma to add it as a chip."
      >
        <div className="grid gap-5">
          <ChipInput
            label="Skills"
            name="skills"
            placeholder="Python"
            initial={initial.skills ?? []}
          />
          <ChipInput
            label="Interests"
            name="interests"
            placeholder="AI/ML"
            initial={initial.interests ?? []}
          />
        </div>
      </Section>

      {/* 04 — Where + work style */}
      <Section
        num="04"
        title="Where you'd work"
        sub="Pick the setups you're open to and the places you'd go."
      >
        <div className="flex flex-col gap-5">
          <div>
            <p className="eyebrow mb-2">Work style</p>
            <WorkStyleChips initial={initial.work_style ?? []} />
          </div>
          <LocationsBlock
            initialLocations={initial.preferred_locations ?? []}
            initialAnyPref={initial.location_any ?? false}
          />
        </div>
      </Section>

      {/* 05 — Notes */}
      <Section
        num="05"
        title="Anything else"
        sub="Companies to always boost or skip, projects worth highlighting, GPA if strong. Claude reads this as extra context on every score."
      >
        <TextareaField
          label="Background notes"
          name="background_notes"
          rows={5}
          placeholder="e.g. Boost: Anthropic, Microsoft, Khan Academy. Skip: defense contractors. Projects: AI chatbot for Bellevue LifeSpring on the Claude API."
          defaultValue={initial.background_notes ?? ""}
        />
      </Section>

      {state?.error && (
        <p className="text-sm" style={{ color: "var(--danger)" }}>
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-6 border-t border-[color:var(--rule)]">
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? "Saving…" : "Save and continue"}
        </button>
        <Link href="/dashboard" className="btn btn-ghost text-sm">
          Skip for now
        </Link>
      </div>
    </form>
  );
}

// ========================================================================
// Primitives
// ========================================================================

function Section({
  num,
  title,
  sub,
  children,
}: {
  num: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div>
        <p className="font-display text-3xl text-[color:var(--accent)] mb-1">
          {num}
        </p>
        <h2 className="font-display text-2xl mb-1">{title}</h2>
        <p className="text-sm text-[color:var(--muted)] leading-relaxed max-w-xl">
          {sub}
        </p>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  hint,
  listId,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  hint?: string;
  listId?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="eyebrow">{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        list={listId}
        className="input"
      />
      {hint && <span className="text-xs text-[color:var(--muted)]">{hint}</span>}
    </label>
  );
}

function TextareaField({
  label,
  name,
  placeholder,
  defaultValue,
  rows = 3,
}: {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="eyebrow">{label}</span>
      <textarea
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        rows={rows}
        className="input"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="eyebrow">{label}</span>
      <select name={name} defaultValue={defaultValue} className="input">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SchoolsDatalist() {
  return (
    <datalist id="us-schools-list">
      {US_SCHOOLS.map((s) => (
        <option key={s} value={s} />
      ))}
    </datalist>
  );
}

function GradYearDatalist() {
  return (
    <datalist id="grad-year-list">
      {GRAD_YEAR_SUGGESTIONS.map((y) => (
        <option key={y} value={y} />
      ))}
    </datalist>
  );
}

function ResumePlaceholder() {
  return (
    <div
      className="card p-4 flex items-center justify-between gap-4"
      style={{ background: "var(--bg-side)" }}
    >
      <div>
        <p className="eyebrow mb-1">Resume</p>
        <p className="text-sm text-[color:var(--ink-soft)]">
          Upload a PDF and Siftly will auto-fill the rest.{" "}
          <span className="text-[color:var(--muted)]">Coming soon.</span>
        </p>
      </div>
      <button type="button" className="btn btn-outline" disabled>
        Upload resume &middot; soon
      </button>
    </div>
  );
}

// ---- + Add list (majors, minors, concentrations) ----

function AddMoreList({
  label,
  name,
  addLabel,
  placeholder,
  initial,
}: {
  label: string;
  name: string;
  addLabel: string;
  placeholder?: string;
  initial: string[];
}) {
  const [values, setValues] = useState<string[]>(
    initial.length > 0 ? initial : [""]
  );

  const update = (i: number, v: string) => {
    const next = [...values];
    next[i] = v;
    setValues(next);
  };
  const remove = (i: number) => {
    if (values.length === 1) {
      setValues([""]);
    } else {
      setValues(values.filter((_, j) => j !== i));
    }
  };
  const add = () => setValues([...values, ""]);

  return (
    <div className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      <div className="flex flex-col gap-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              name={name}
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className="input flex-1"
            />
            {(values.length > 1 || v !== "") && (
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove`}
                className="text-[color:var(--muted)] hover:text-[color:var(--ink)] text-xl leading-none px-2"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="btn btn-ghost text-xs self-start px-0"
      >
        {addLabel}
      </button>
    </div>
  );
}

// ---- Chip input (skills, interests, locations) ----

function ChipInput({
  label,
  name,
  placeholder,
  initial,
  disabled = false,
}: {
  label?: string;
  name: string;
  placeholder?: string;
  initial: string[];
  disabled?: boolean;
}) {
  const [values, setValues] = useState<string[]>(initial);
  const [input, setInput] = useState("");
  const inputId = useId();

  const add = (val: string) => {
    const t = val.trim();
    if (!t) return;
    if (values.map((v) => v.toLowerCase()).includes(t.toLowerCase())) return;
    setValues([...values, t]);
    setInput("");
  };
  const remove = (i: number) => setValues(values.filter((_, j) => j !== i));

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="eyebrow">
          {label}
        </label>
      )}
      <div
        className={`flex flex-wrap gap-1.5 p-2 border rounded min-h-[46px] items-center transition-opacity ${
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(input);
            } else if (e.key === "Backspace" && !input && values.length > 0) {
              remove(values.length - 1);
            }
          }}
          onBlur={() => add(input)}
          placeholder={values.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm py-1 px-1"
        />
      </div>
      <input type="hidden" name={name} value={values.join(", ")} />
    </div>
  );
}

// ---- Work style chips (checkbox group styled like chips) ----

function WorkStyleChips({ initial }: { initial: string[] }) {
  const options = [
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" },
    { value: "in_person", label: "In-person" },
  ];
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));

  const toggle = (v: string) => {
    const next = new Set(selected);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setSelected(next);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const isOn = selected.has(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={{
              background: isOn ? "var(--ink)" : "transparent",
              color: isOn ? "var(--bg)" : "var(--ink)",
              border: `1px solid ${isOn ? "var(--ink)" : "var(--rule)"}`,
            }}
          >
            {o.label}
          </button>
        );
      })}
      {/* Hidden inputs for form submission */}
      {Array.from(selected).map((v) => (
        <input key={v} type="hidden" name="work_style" value={v} />
      ))}
    </div>
  );
}

// ---- Locations block with No-preference toggle ----

function LocationsBlock({
  initialLocations,
  initialAnyPref,
}: {
  initialLocations: string[];
  initialAnyPref: boolean;
}) {
  const [anyPref, setAnyPref] = useState(initialAnyPref);

  return (
    <div className="flex flex-col gap-3">
      <p className="eyebrow">Locations</p>
      <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          name="location_any"
          checked={anyPref}
          onChange={(e) => setAnyPref(e.target.checked)}
          className="w-4 h-4 accent-[color:var(--accent)]"
        />
        <span>No preference &mdash; match anywhere in the US</span>
      </label>
      <ChipInput
        name="preferred_locations"
        placeholder="SF Bay Area, NYC, Seattle..."
        initial={initialLocations}
        disabled={anyPref}
      />
    </div>
  );
}
