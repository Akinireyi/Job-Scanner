import Link from "next/link";
import AuthForm from "@/components/auth-form";

// Reads ?mode=... from the URL — not instant-renderable.
export const instant = false;

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "signin";

  return (
    <div className="flex flex-col flex-1">
      <header className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center">
        <Link href="/" className="font-display text-xl">Siftly</Link>
      </header>
      <main className="flex-1 flex items-start justify-center px-6 pt-8 pb-24">
        <div className="w-full max-w-sm">
          <p className="eyebrow mb-3">
            {mode === "signup" ? "Welcome" : "Welcome back"}
          </p>
          <h1 className="font-display text-3xl mb-6">
            {mode === "signup"
              ? "Create your Siftly account."
              : "Sign in to Siftly."}
          </h1>
          <AuthForm initialMode={mode} />
        </div>
      </main>
    </div>
  );
}
