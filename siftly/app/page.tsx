import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <header className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <span className="font-display text-xl">Siftly</span>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost">Sign in</Link>
          <Link href="/login?mode=signup" className="btn btn-primary">Get started</Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-24 sm:pt-28 sm:pb-32">
          <p className="eyebrow mb-5">A tailored matcher for college</p>
          <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] mb-6">
            Find the internship that{" "}
            <em className="text-[color:var(--accent)] italic font-normal">
              actually fits
            </em>
            .
          </h1>
          <p className="text-lg text-[color:var(--ink-soft)] max-w-xl leading-relaxed mb-8">
            Siftly reads your resume, learns what you care about, and scores
            every new internship against you &mdash; so the matches that reach
            your inbox are the ones worth your time.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/login?mode=signup" className="btn btn-primary">
              Get started &mdash; it&rsquo;s free
            </Link>
            <Link href="/login" className="btn btn-secondary">Sign in</Link>
          </div>
        </section>

        <section
          className="border-t border-[color:var(--rule)]"
          style={{ background: "var(--bg-side)" }}
        >
          <div className="max-w-5xl mx-auto px-6 py-20 sm:py-24">
            <p className="eyebrow mb-3 text-center">How it works</p>
            <h2 className="font-display text-3xl sm:text-4xl text-center mb-12">
              Three quiet steps between you and the match.
            </h2>
            <ol className="grid sm:grid-cols-3 gap-10">
              <li>
                <p className="font-display text-5xl text-[color:var(--accent)] mb-2">01</p>
                <h3 className="font-display text-xl mb-2">Tell Siftly about you</h3>
                <p className="text-[color:var(--ink-soft)] leading-relaxed">
                  Major, year, places you&rsquo;d work, companies you care about.
                  Upload your resume. Three minutes.
                </p>
              </li>
              <li>
                <p className="font-display text-5xl text-[color:var(--accent)] mb-2">02</p>
                <h3 className="font-display text-xl mb-2">We score the internet</h3>
                <p className="text-[color:var(--ink-soft)] leading-relaxed">
                  Every new internship gets read by Claude and scored 1&ndash;10
                  against <em>your</em> profile, with a one-line reason for each
                  score.
                </p>
              </li>
              <li>
                <p className="font-display text-5xl text-[color:var(--accent)] mb-2">03</p>
                <h3 className="font-display text-xl mb-2">You see what fits</h3>
                <p className="text-[color:var(--ink-soft)] leading-relaxed">
                  Strong matches land in your dashboard. Email digests are
                  optional &mdash; you turn them on when you want.
                </p>
              </li>
            </ol>
          </div>
        </section>

        <section>
          <div className="max-w-3xl mx-auto px-6 py-20">
            <p className="eyebrow mb-3">Built for every stage</p>
            <h2 className="font-display text-3xl sm:text-4xl mb-5">
              Freshman year through first full-time offer.
            </h2>
            <p className="text-[color:var(--ink-soft)] leading-relaxed">
              Whether you&rsquo;re a high school senior looking at first-year
              programs, a junior hunting for a summer internship, or a new grad
              working through full-time roles, Siftly tailors to where you are.
              Update your graduation year once &mdash; it figures out the rest.
            </p>
          </div>
        </section>
      </main>

      <footer
        className="border-t border-[color:var(--rule)] mt-auto"
        style={{ background: "var(--bg-side)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-10 flex items-center justify-between text-[color:var(--muted)] text-sm">
          <span className="font-display text-base">Siftly</span>
          <span>&copy; 2026</span>
        </div>
      </footer>
    </div>
  );
}
