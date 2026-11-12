"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; success?: string } | null;

// ---------------------------------------------------------- change email ----

export async function updateEmail(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = (formData.get("email") as string | null)?.trim();
  if (!email) return { error: "Enter an email address." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "That email doesn't look right." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email });
  if (error) return { error: error.message };

  revalidatePath("/settings");
  return {
    success:
      "Check both inboxes — Supabase sends a confirmation link to the new email, and the old one gets a heads-up. Email changes after you click the link.",
  };
}

// ------------------------------------------------------- change password ----

export async function updatePassword(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const password = formData.get("password") as string | null;
  const confirm = formData.get("confirm") as string | null;

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords don't match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { success: "Password updated." };
}

// --------------------------------------------- phone / country / language ---

export async function updateAccountInfo(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're signed out. Sign in and try again." };

  const phone = (formData.get("phone") as string | null)?.trim() || null;
  const country = (formData.get("country") as string | null)?.trim() || null;
  const language =
    (formData.get("language") as string | null)?.trim() || "English";

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: user.id,
        phone,
        country,
        language,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) return { error: `Could not save: ${error.message}` };

  revalidatePath("/settings");
  return { success: "Saved." };
}
