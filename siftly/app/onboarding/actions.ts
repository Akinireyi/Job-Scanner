"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = { error?: string } | null;

// Deduplicated, trimmed list from multiple inputs with the same name.
function multi(fd: FormData, name: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of fd.getAll(name)) {
    if (typeof raw !== "string") continue;
    const s = raw.trim();
    if (s && !seen.has(s.toLowerCase())) {
      seen.add(s.toLowerCase());
      out.push(s);
    }
  }
  return out;
}

// Deduplicated, trimmed list from a single comma-separated hidden input.
function csv(fd: FormData, name: string): string[] {
  const v = fd.get(name);
  if (typeof v !== "string") return [];
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

function text(fd: FormData, name: string): string | null {
  const v = fd.get(name);
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s || null;
}

const allowedEnrollment = ["undergrad", "masters", "newgrad", "jobseeker"];
const allowedWorkStyle = ["remote", "hybrid", "in_person"];

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

  // Graduation year — any integer is fine. Siftly's for the long haul.
  let graduation_year: number | null = null;
  const gy = formData.get("graduation_year");
  if (typeof gy === "string" && gy.trim()) {
    const n = parseInt(gy, 10);
    if (Number.isNaN(n)) {
      return { error: "Graduation year must be a number." };
    }
    graduation_year = n;
  }

  const enrollment = text(formData, "enrollment_type");
  if (enrollment && !allowedEnrollment.includes(enrollment)) {
    return { error: "Pick one of the enrollment options." };
  }

  const work_style = multi(formData, "work_style").filter((v) =>
    allowedWorkStyle.includes(v)
  );
  const location_any = formData.get("location_any") === "on";
  const preferred_locations = location_any ? [] : csv(formData, "preferred_locations");

  const payload = {
    user_id: user.id,
    display_name: text(formData, "display_name"),
    school: text(formData, "school"),
    enrollment_type: enrollment,
    graduation_year,
    majors: multi(formData, "majors"),
    minors: multi(formData, "minors"),
    concentrations: multi(formData, "concentrations"),
    skills: csv(formData, "skills"),
    interests: csv(formData, "interests"),
    preferred_locations,
    work_style,
    location_any,
    background_notes: text(formData, "background_notes"),
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
