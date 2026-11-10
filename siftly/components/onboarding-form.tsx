"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveProfile, type ProfileFormState } from "@/app/onboarding/actions";

export type InitialProfile = {
  display_name?: string | null;
  school?: string | null;
  enrollment_type?: string | null;
  graduation_year?: number | null;
  majors?: string[] | null;
  minors?: string[] | null;
  skills?: string[] | null;
  interests?: string[] | null;
  preferred_locations?: string[] | null;
  background_notes?: string | null;
};

function list(arr: string[] | null | undefined): string {
  return arr?.join(", ") ?? "";
}

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
            hint="Used to figure out your current class, auto-updates yearly."
          />
        </div>
      </Section>

      {/* 02 — Study */}
      <Section
        num="02"
        title="What you study"
        sub="Comma-separated. Majors first, then minors if you have one."
      >
        <div className="grid gap-4">
          <Field
            label="Major(s)"
            name="majors"
            placeholder="Computer Science, Business"
            defaultValue={list(initial.majors)}
          />
          <Field
            label="Minor(s)"
            name="minors"
            placeholder="Mathematics (optional)"
            defaultValue={list(initial.minors)}
          />
        </div>
      </Section>

      {/* 03 — Skills + Interests */}
      <Section
        num="03"
        title="What you're good at and what you care about"
        sub="Comma-separated. The more specific, the better Claude can tailor scoring."
      >
        <div className="grid gap-4">
          <TextareaField
            label="Skills"
            name="skills"
            placeholder="Python, JavaScript, React, SQL, data analysis, product sense"
            defaultValue={list(initial.skills)}
          />
          <TextareaField
            label="Interests"
            name="interests"
            placeholder="AI/ML, consumer apps, education, climate, developer tools"
            defaultValue={list(initial.interests)}
          />
        </div>
      </Section>

      {/* 04 — Where */}
      <Section
        num="04"
        title="Where you'd work"
        sub='Cities, regions, or "Remote."'
      >
        <Field
          label="Locations"
          name="preferred_locations"
          placeholder="SF Bay Area, NYC, Seattle, Boston, Remote"
          defaultValue={list(initial.preferred_locations)}
        />
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
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending}
        >
          {isPending ? "Saving…" : "Save and continue"}
        </button>
        <Link href="/dashboard" className="btn btn-ghost text-sm">
          Skip for now
        </Link>
      </div>
    </form>
  );
}

// ---------- tiny field primitives ----------

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
    <section className="flex flex-col gap-4">
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
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="eyebrow">{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="input"
      />
      {hint && (
        <span className="text-xs text-[color:var(--muted)]">{hint}</span>
      )}
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
      <select
        name={name}
        defaultValue={defaultValue}
        className="input"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
