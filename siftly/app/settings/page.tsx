import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ThemePicker from "@/components/theme-picker";

// Reads session cookies — not instant-renderable.
export const instant = false;

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
        <p className="eyebrow mb-3">Settings</p>
        <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] mb-10">
          Settings.
        </h1>

        <section className="flex flex-col gap-5">
          <div>
            <p className="eyebrow mb-1">01</p>
            <h2 className="font-display text-2xl mb-1">Appearance</h2>
            <p className="text-sm text-[color:var(--muted)] leading-relaxed max-w-xl">
              Three options, simple. Default is Dark. Your choice stays on this
              browser.
            </p>
          </div>
          <ThemePicker />
        </section>

        <section className="flex flex-col gap-3 mt-12 pt-8 border-t border-[color:var(--rule)]">
          <div>
            <p className="eyebrow mb-1">02</p>
            <h2 className="font-display text-2xl mb-1">Account</h2>
            <p className="text-sm text-[color:var(--muted)] leading-relaxed">
              Signed in as <span className="text-[color:var(--ink)]">{user.email}</span>.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/onboarding" className="btn btn-secondary">
              Edit profile
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="btn btn-ghost">
                Sign out
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
