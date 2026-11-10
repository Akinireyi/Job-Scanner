import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingForm, {
  type InitialProfile,
} from "@/components/onboarding-form";

// Reads per-user session cookies — can't be instant-rendered.
export const instant = false;

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, school, enrollment_type, graduation_year, majors, minors, skills, interests, preferred_locations, background_notes"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const initial: InitialProfile = profile ?? {};

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
        <p className="eyebrow mb-3">Onboarding</p>
        <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] mb-4">
          Tell Siftly{" "}
          <em className="text-[color:var(--accent)] italic font-normal">
            about you
          </em>
          .
        </h1>
        <p className="text-[color:var(--ink-soft)] max-w-xl leading-relaxed mb-12">
          Claude uses this to score every new internship against you. Rough is
          fine — you can edit anytime from settings.
        </p>

        <OnboardingForm initial={initial} />
      </main>
    </div>
  );
}
