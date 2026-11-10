import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Dashboard reads per-user session cookies — can't be instant-rendered.
export const instant = false;

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Profile may not exist yet if the SQL schema hasn't been run.
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const name =
    profile?.display_name || user.email?.split("@")[0] || "there";

  const navItems = [
    { label: "New matches", n: 0, selected: true },
    { label: "Saved", n: 0 },
    { label: "Applied", n: 0 },
    { label: "All matches", n: 0 },
  ];

  return (
    <div
      className="flex-1 grid"
      style={{ gridTemplateColumns: "220px 1fr", minHeight: "100vh" }}
    >
      {/* Sidebar */}
      <aside
        className="px-5 py-8 border-r border-[color:var(--rule)] flex flex-col"
        style={{ background: "var(--bg-side)" }}
      >
        <Link href="/" className="font-display text-xl block mb-6">
          Siftly
        </Link>

        <p className="eyebrow mb-3">This week</p>
        <ul className="flex flex-col gap-0.5 mb-6">
          {navItems.map((item) => (
            <li
              key={item.label}
              className="flex justify-between items-center text-sm px-2.5 py-1.5 rounded"
              style={
                item.selected
                  ? { background: "var(--ink)", color: "var(--bg)" }
                  : undefined
              }
            >
              <span>{item.label}</span>
              <span
                className="text-xs tabular-nums"
                style={{
                  color: item.selected ? "#c3c3bf" : "var(--muted)",
                }}
              >
                {item.n}
              </span>
            </li>
          ))}
        </ul>

        <p className="eyebrow mb-3 mt-2">Account</p>
        <p className="text-xs text-[color:var(--muted)] mb-3 truncate">
          {user.email}
        </p>
        <form action="/auth/signout" method="post" className="mt-auto">
          <button
            type="submit"
            className="btn btn-ghost text-sm w-full justify-start px-2.5"
          >
            Sign out
          </button>
        </form>
      </aside>

      {/* Main */}
      <main className="px-10 py-12 min-w-0">
        <p className="eyebrow mb-3">Dashboard</p>
        <h1 className="font-display text-3xl mb-2">
          Welcome to Siftly,{" "}
          <em className="text-[color:var(--accent)] italic font-normal">
            {name}
          </em>
          .
        </h1>
        <p className="text-[color:var(--ink-soft)] max-w-xl leading-relaxed mb-10">
          Your matches will appear here once we&rsquo;ve scored your first
          batch. Finish your profile first so Claude has something to score
          against.
        </p>

        <div className="card p-6 max-w-xl">
          <p className="eyebrow mb-2">Coming next</p>
          <h2 className="font-display text-xl mb-3">
            Set up your profile &mdash; 3 minutes.
          </h2>
          <p className="text-sm text-[color:var(--ink-soft)] leading-relaxed mb-5">
            Major, graduation year, where you&rsquo;d work, companies you care
            about, and your resume (if you have one). Once you&rsquo;re done,
            Siftly starts scoring new internships for you.
          </p>
          <Link href="/onboarding" className="btn btn-primary">
            Set up my profile
          </Link>
        </div>
      </main>
    </div>
  );
}
