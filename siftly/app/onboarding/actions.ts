"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = { error?: string } | null;

function splitCSV(v: FormDataEntryValue | null): string[] {
  if (typeof v !== "string") return [];
  // Dedupe while preserving order.
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of v.split(",")) {
    const s = raw.trim();
    if (s && !seen.has(s.toLowerCase())) {
      seen.add(s.toLowerCase());
      out.push(s);
    }
  }
  return out;
}

function text(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed || null;
}

export async function saveProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You're signed out. Sign in and try again." };
  }

  const gradYearRaw = formData.get("graduation_year");
  let graduation_year: number | null = null;
  if (typeof gradYearRaw === "string" && gradYearRaw.trim()) {
    const n = parseInt(gradYearRaw, 10);
    if (Number.isNaN(n) || n < 2020 || n > 2040) {
      return { error: "Graduation year should be something like 2029." };
    }
    graduation_year = n;
  }

  const enrollment = text(formData.get("enrollment_type"));
  const allowedEnrollment = ["undergrad", "masters", "newgrad", "jobseeker"];
  if (enrollment && !allowedEnrollment.includes(enrollment)) {
    return { error: "Pick one of the enrollment options." };
  }

  const payload = {
    user_id: user.id,
    display_name: text(formData.get("display_name")),
    school: text(formData.get("school")),
    enrollment_type: enrollment,
    graduation_year,
    majors: splitCSV(formData.get("majors")),
    minors: splitCSV(formData.get("minors")),
    skills: splitCSV(formData.get("skills")),
    interests: splitCSV(formData.get("interests")),
    preferred_locations: splitCSV(formData.get("preferred_locations")),
    background_notes: text(formData.get("background_notes")),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    return { error: `Could not save: ${error.message}` };
  }

  redirect("/dashboard?saved=1");
}
