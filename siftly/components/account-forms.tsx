"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import {
  updateAccountInfo,
  updateEmail,
  updatePassword,
  type FormState,
} from "@/app/settings/actions";
import { COUNTRIES } from "@/data/countries";
import { LANGUAGES } from "@/data/languages";
import { DIAL_CODES } from "@/data/dial-codes";

// ---------------------------------------------------------- change email ----

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    updateEmail,
    null
  );

  return (
    <form action={action} className="flex flex-col gap-2">
      <p className="text-sm text-[color:var(--muted)] mb-1">
        Current:{" "}
        <span className="text-[color:var(--ink)]">{currentEmail}</span>
      </p>
      <label className="flex flex-col gap-1.5">
        <span className="eyebrow">New email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="input"
          placeholder="you@example.com"
        />
      </label>
      <FormFeedback state={state} />
      <button
        type="submit"
        disabled={isPending}
        className="btn btn-secondary self-start mt-1"
      >
        {isPending ? "Sending…" : "Change email"}
      </button>
    </form>
  );
}

// -------------------------------------------------------- change password ---

export function PasswordForm() {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    updatePassword,
    null
  );

  return (
    <form action={action} className="flex flex-col gap-2">
      <label className="flex flex-col gap-1.5">
        <span className="eyebrow">New password</span>
        <input
          type="password"
          name="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="input"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="eyebrow">Confirm new password</span>
        <input
          type="password"
          name="confirm"
          required
          minLength={6}
          autoComplete="new-password"
          className="input"
        />
      </label>
      <FormFeedback state={state} />
      <button
        type="submit"
        disabled={isPending}
        className="btn btn-secondary self-start mt-1"
      >
        {isPending ? "Updating…" : "Change password"}
      </button>
    </form>
  );
}

// ------------------------------------------- phone / country / language ----
// Outer component owns useActionState + success handling. Inner is keyed by
// server values so it fully remounts when the DB changes — fixes the bug
// where language reverted to "English" after save (previously the select was
// uncontrolled with defaultValue and never re-read the new prop).

export function AccountInfoForm({
  initialPhone,
  initialCountry,
  initialLanguage,
}: {
  initialPhone?: string | null;
  initialCountry?: string | null;
  initialLanguage?: string | null;
}) {
  const router = useRouter();
  const [state, action, isPending] = useActionState<FormState, FormData>(
    updateAccountInfo,
    null
  );

  // On successful save, force a re-fetch of the server component so our
  // `initial*` props actually update (Next.js otherwise keeps a cached
  // version of the query result).
  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state, router]);

  const innerKey = `${initialPhone ?? ""}|${initialCountry ?? ""}|${initialLanguage ?? ""}`;

  return (
    <AccountInfoInner
      key={innerKey}
      initialPhone={initialPhone}
      initialCountry={initialCountry}
      initialLanguage={initialLanguage}
      action={action}
      isPending={isPending}
      state={state}
    />
  );
}

function AccountInfoInner({
  initialPhone,
  initialCountry,
  initialLanguage,
  action,
  isPending,
  state,
}: {
  initialPhone?: string | null;
  initialCountry?: string | null;
  initialLanguage?: string | null;
  action: (formData: FormData) => void;
  isPending: boolean;
  state: FormState;
}) {
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [country, setCountry] = useState(initialCountry ?? "");
  const [language, setLanguage] = useState(initialLanguage ?? "English");

  function handleCountryChange(newCountry: string) {
    const newCode = DIAL_CODES[newCountry] ?? "";
    const oldCode = country ? DIAL_CODES[country] ?? "" : "";

    if (oldCode && phone.trim().startsWith(oldCode)) {
      const rest = phone.trim().slice(oldCode.length);
      setPhone((newCode + rest).trim());
    } else if (!phone.trim() && newCode) {
      setPhone(newCode + " ");
    }
    setCountry(newCountry);
  }

  const currentCode = country ? DIAL_CODES[country] : undefined;

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="eyebrow">Phone number</span>
        <input
          type="tel"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={currentCode ? `${currentCode} 555 123 4567` : "+1 555 123 4567"}
          autoComplete="tel"
          className="input"
        />
        <span className="text-xs text-[color:var(--muted)]">
          {currentCode
            ? `Prefilled with ${country}'s country code (${currentCode}). Edit the rest.`
            : "Optional. Not used for anything yet — saved for future 2FA and alerts."}
        </span>
      </label>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Country</span>
          <select
            name="country"
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="input"
          >
            <option value="">Pick a country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Language</span>
          <select
            name="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <span className="text-xs text-[color:var(--muted)]">
            Siftly&rsquo;s UI stays English for now. Your pick is saved so we
            can translate later and so Claude can write match reasons in your
            language.
          </span>
        </label>
      </div>

      <FormFeedback state={state} />
      <button
        type="submit"
        disabled={isPending}
        className="btn btn-secondary self-start mt-1"
      >
        {isPending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------- shared bits ----

function FormFeedback({ state }: { state: FormState }) {
  if (!state) return null;
  if (state.error) {
    return (
      <p className="text-sm" style={{ color: "var(--danger)" }}>
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="text-sm" style={{ color: "var(--accent-ink)" }}>
        {state.success}
      </p>
    );
  }
  return null;
}
