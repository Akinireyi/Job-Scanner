"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { parseResume, type ParsedResume } from "@/app/onboarding/actions";

type Stage = "idle" | "uploading" | "parsing" | "done" | "error";

export default function ResumeUpload({
  onParsed,
}: {
  onParsed: (p: ParsedResume) => void;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setMessage(null);
    setFileName(file.name);

    if (file.type !== "application/pdf") {
      setStage("error");
      setMessage("Resume must be a PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setStage("error");
      setMessage("Resume must be under 10 MB.");
      return;
    }

    try {
      setStage("uploading");

      const supabase = createClient();
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr || !user) throw new Error("Please sign in again.");

      const path = `${user.id}/resume-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage
        .from("resumes")
        .upload(path, file, {
          contentType: "application/pdf",
          upsert: false,
        });
      if (upErr) throw new Error(upErr.message);

      setStage("parsing");
      const result = await parseResume(path);
      if (result.error) throw new Error(result.error);

      const data = result.data ?? {};
      onParsed(data);
      setStage("done");
      setMessage(
        `Pre-filled from ${file.name}. Review each field and edit anything Claude got wrong.`
      );
    } catch (e) {
      setStage("error");
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  function openPicker() {
    inputRef.current?.click();
  }

  const working = stage === "uploading" || stage === "parsing";

  return (
    <div
      className="card p-4"
      style={{ background: "var(--bg-side)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow mb-1">Resume</p>
          <p className="text-sm text-[color:var(--ink-soft)]">
            Upload a PDF &mdash; Claude reads it and pre-fills the form.
          </p>
        </div>
        <button
          type="button"
          onClick={openPicker}
          disabled={working}
          className="btn btn-outline flex-shrink-0"
        >
          {stage === "idle" && "Upload resume"}
          {stage === "uploading" && "Uploading…"}
          {stage === "parsing" && "Claude reading…"}
          {stage === "done" && "Upload different"}
          {stage === "error" && "Try again"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {message && (
        <p
          className="text-xs mt-3 leading-relaxed"
          style={{
            color:
              stage === "error"
                ? "var(--danger)"
                : stage === "done"
                  ? "var(--accent-ink)"
                  : "var(--muted)",
          }}
        >
          {stage === "done" && <strong>{fileName} </strong>}
          {message}
        </p>
      )}
      {working && !message && fileName && (
        <p className="text-xs mt-3 text-[color:var(--muted)]">
          {fileName}
        </p>
      )}
    </div>
  );
}
