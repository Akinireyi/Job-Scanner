"use server";

import Anthropic from "@anthropic-ai/sdk";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = { error?: string } | null;

// -------------------------------------------------- parse uploaded resume ----

export type ParsedResume = {
  display_name?: string | null;
  school?: string | null;
  graduation_year?: number | null;
  enrollment_type?: "undergrad" | "masters" | "newgrad" | "jobseeker" | null;
  majors?: string[];
  minors?: string[];
  concentrations?: string[];
  skills?: string[];
  interests?: string[];
  preferred_locations?: string[];
  background_notes?: string | null;
};

const RESUME_PROMPT = `Extract structured profile data from this resume. Return STRICT JSON only, no prose, no code fences.

Schema (omit a key you cannot reasonably infer — never guess):
{
  "display_name": "First Last as shown at top of resume",
  "school": "Most recent or current school name",
  "graduation_year": 2029,
  "enrollment_type": "undergrad" | "masters" | "newgrad" | "jobseeker",
  "majors": ["Computer Science"],
  "minors": ["Business"],
  "concentrations": ["AI"],
  "skills": ["Python", "React", "Figma", "financial modeling", "Spanish"],
  "interests": ["AI/ML", "fintech", "climate"],
  "preferred_locations": ["San Francisco, CA"],
  "background_notes": "One sentence summary of notable achievements, standout projects, or honors. Include GPA only if strong."
}

Rules:
- enrollment_type: "undergrad" if still in undergrad. "masters" if in a master's program. "newgrad" if graduated within the last 12 months. Otherwise "jobseeker".
- interests: infer from projects, clubs, extracurriculars, work experience — not just explicit "Interests" sections.
- preferred_locations: only include if the resume states a location preference.
- Return ONLY the JSON object.`;

export async function parseResume(
  path: string
): Promise<{ data?: ParsedResume; error?: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: "Resume parsing is not configured yet (missing ANTHROPIC_API_KEY)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're signed out. Sign in and try again." };

  // Make sure the path belongs to this user — defense in depth beyond RLS.
  if (!path.startsWith(`${user.id}/`)) {
    return { error: "That file isn't yours." };
  }

  const { data: file, error: dlErr } = await supabase.storage
    .from("resumes")
    .download(path);
  if (dlErr || !file) {
    return { error: dlErr?.message ?? "Could not fetch the uploaded file." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) return { error: "Uploaded file is empty." };
  if (buffer.length > 10 * 1024 * 1024) {
    return { error: "Resume is over 10 MB." };
  }
  const base64 = buffer.toString("base64");

  let text = "";
  try {
    const anthropic = new Anthropic();
    const response = await anthropic.messages.create({
      model: "claude-haiku-5-5",
      max_tokens: 2048,
      output_config: { effort: "low" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            },
            { type: "text", text: RESUME_PROMPT },
          ],
        },
      ],
    });

    for (const block of response.content) {
      if (block.type === "text") text += block.text;
    }
  } catch (e) {
    return {
      error: `Claude couldn't read the resume: ${e instanceof Error ? e.message : "unknown"}`,
    };
  }

  // Trim code fences if the model ignored instructions.
  let json = text.trim();
  if (json.startsWith("```")) {
    json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }

  let parsed: ParsedResume;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { error: "Claude returned something that wasn't valid JSON." };
  }

  // Remember the file path on the profile row so we can show the current
  // resume name on later visits.
  await supabase
    .from("profiles")
    .update({ resume_file_path: path, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  return { data: parsed };
}

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
