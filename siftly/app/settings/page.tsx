import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ThemePicker from "@/components/theme-picker";
import {
  AccountInfoForm,
  EmailForm,
  PasswordForm,
} from "@/components/account-forms";

// Reads session cookies — not instant-renderable.
export const instant = false;

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, school, graduation_year, enrollment_type, majors, minors, concentrations, preferred_locations, work_style, location_any, skills, interests, phone, country, language"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="flex flex-col flex-1">
      <header className="max-w-3xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display text-xl">
          Siftly
        </Link>
        <Link href="/dashboard" className="btn btn-ghost text-sm">
          Back to dashboard
        </Link>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-6 pb-24">
        <p className="eyebrow mb-3">Account</p>
        <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] mb-10">
          Your account.
        </h1>

        {/* --- Profile (user icon) --- */}
        <AccountSection
          icon={<UserIcon />}
          title="Profile"
          sub="What Claude uses to score matches. Edit anytime."
        >
          <ProfileSummary profile={profile} userEmail={user.email ?? ""} />
          <Link href="/onboarding" className="btn btn-primary mt-4 self-start">
            Edit profile
          </Link>
        </AccountSection>

        {/* --- Settings (gear) --- */}
        <AccountSection
          icon={<GearIcon />}
          title="Settings"
          sub="Change the login you use for Siftly."
        >
          <div className="flex flex-col gap-8">
            <SettingGroup label="Email">
              <EmailForm currentEmail={user.email ?? ""} />
            </SettingGroup>
            <SettingGroup label="Password">
              <PasswordForm />
            </SettingGroup>
          </div>
        </AccountSection>

        {/* --- Preferences (globe) --- */}
        <AccountSection
          icon={<GlobeIcon />}
          title="Preferences"
          sub="Phone, country, and language. Siftly is English-only today — your language picks save for when we add translations later."
        >
          <AccountInfoForm
            initialPhone={profile?.phone}
            initialCountry={profile?.country}
            initialLanguage={profile?.language}
          />
        </AccountSection>

        {/* --- Appearance (palette) --- */}
        <AccountSection
          icon={<PaletteIcon />}
          title="Appearance"
          sub="Default is Dark. Your choice stays on this browser."
        >
          <ThemePicker />
        </AccountSection>

        {/* --- Sign out --- */}
        <div className="pt-4">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="btn btn-ghost"
              style={{ color: "var(--danger)" }}
            >
              Sign out
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

// -------------------------------------------- profile summary component ----

type ProfileRow = {
  display_name: string | null;
  school: string | null;
  graduation_year: number | null;
  enrollment_type: string | null;
  majors: string[] | null;
  minors: string[] | null;
  concentrations: string[] | null;
  preferred_locations: string[] | null;
  work_style: string[] | null;
  location_any: boolean | null;
  skills: string[] | null;
  interests: string[] | null;
};

function ProfileSummary({
  profile,
  userEmail,
}: {
  profile: ProfileRow | null;
  userEmail: string;
}) {
  const displayName = profile?.display_name || userEmail.split("@")[0];
  const enrollmentLabel = {
    undergrad: "Undergraduate",
    masters: "Master's",
    newgrad: "New grad",
    jobseeker: "Job seeker",
  }[profile?.enrollment_type ?? ""] ?? "—";

  const locations =
    profile?.location_any
      ? "Anywhere in the US"
      : profile?.preferred_locations?.length
        ? profile.preferred_locations.join(", ")
        : "—";

  const workStyle =
    profile?.work_style?.length
      ? profile.work_style
          .map((w) =>
            w === "in_person"
              ? "In-person"
              : w[0].toUpperCase() + w.slice(1)
          )
          .join(", ")
      : "—";

  return (
    <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
      <ProfileRow label="Display name" value={displayName} />
      <ProfileRow label="School" value={profile?.school || "—"} />
      <ProfileRow label="Graduation year" value={profile?.graduation_year?.toString() || "—"} />
      <ProfileRow label="Enrollment" value={enrollmentLabel} />
      <ProfileRow label="Major(s)" value={profile?.majors?.join(", ") || "—"} />
      <ProfileRow label="Minor(s)" value={profile?.minors?.join(", ") || "—"} />
      <ProfileRow label="Concentration(s)" value={profile?.concentrations?.join(", ") || "—"} />
      <ProfileRow label="Work style" value={workStyle} />
      <ProfileRow label="Locations" value={locations} span2 />
      <ProfileRow
        label="Skills"
        value={
          profile?.skills?.length
            ? `${profile.skills.length} tagged`
            : "—"
        }
      />
      <ProfileRow
        label="Interests"
        value={
          profile?.interests?.length
            ? `${profile.interests.length} tagged`
            : "—"
        }
      />
    </dl>
  );
}

function ProfileRow({
  label,
  value,
  span2,
}: {
  label: string;
  value: string;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <dt className="eyebrow mb-1">{label}</dt>
      <dd className="text-[color:var(--ink-soft)]">{value}</dd>
    </div>
  );
}

// ---------------------------------------------------------- section shell ---

function AccountSection({
  icon,
  title,
  sub,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 mb-12 pb-12 border-b border-[color:var(--rule)]">
      <div className="flex gap-4 items-start">
        <span
          className="mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: "var(--accent-soft)",
            color: "var(--accent-ink)",
          }}
          aria-hidden
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl mb-1">{title}</h2>
          <p className="text-sm text-[color:var(--muted)] leading-relaxed max-w-xl">
            {sub}
          </p>
        </div>
      </div>
      <div className="pl-12 flex flex-col">{children}</div>
    </section>
  );
}

function SettingGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="eyebrow">{label}</p>
      {children}
    </div>
  );
}

// ---------------------------------------------------------- icons (SVG) ----

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function GearIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg {...iconProps}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.5-1.1-.2-.2-.3-.6-.3-1 0-.9.7-1.6 1.6-1.6H17c2.8 0 5-2.2 5-5C22 6.1 17.5 2 12 2z" />
    </svg>
  );
}
