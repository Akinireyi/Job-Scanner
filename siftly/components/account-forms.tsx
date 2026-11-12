"use client";

import { useActionState } from "react";
import {
  updateAccountInfo,
  updateEmail,
  updatePassword,
  type FormState,
} from "@/app/settings/actions";
import { COUNTRIES } from "@/data/countries";
import { LANGUAGES } from "@/data/languages";

// -------------------------------------------------------- change email ----

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

// ------------------------------------------------------ change password ----

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

export function AccountInfoForm({
  initialPhone,
  initialCountry,
  initialLanguage,
}: {
  initialPhone?: string | null;
  initialCountry?: string | null;
  initialLanguage?: string | null;
}) {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    updateAccountInfo,
    null
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="eyebrow">Phone number</span>
        <input
          type="tel"
          name="phone"
          defaultValue={initialPhone ?? ""}
          placeholder="+1 555 123 4567"
          autoComplete="tel"
          className="input"
        />
        <span className="text-xs text-[color:var(--muted)]">
          Optional. Not used for anything yet — saved for future 2FA and alerts.
        </span>
      </label>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Country</span>
          <input
            type="text"
            name="country"
            defaultValue={initialCountry ?? ""}
            placeholder="United States"
            list="siftly-countries"
            autoComplete="country-name"
            className="input"
          />
          <datalist id="siftly-countries">
            {COUNTRIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Language</span>
          <select
            name="language"
            defaultValue={initialLanguage ?? "English"}
            className="input"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
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
