"use client";

import { useState } from "react";
import { REPORT_REASONS } from "@/lib/constants";
import { supabaseBrowser } from "@/lib/supabase/client";
import { firstName } from "@/lib/utils";

export function ReportModal({
  reporterId,
  target,
  onClose,
  onDone,
}: {
  reporterId: string;
  target: { id: string; full_name: string | null };
  onClose: () => void;
  /** Called after a successful report; `blocked` reflects the checkbox. */
  onDone: (blocked: boolean) => void;
}) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const supabase = supabaseBrowser();

    const { error: reportError } = await supabase.from("member_reports").insert({
      reporter_id: reporterId,
      reported_user_id: target.id,
      reason,
      details: details.trim(),
    });
    if (reportError) {
      setError("Couldn't send the report — please try again.");
      setSubmitting(false);
      return;
    }
    if (alsoBlock) {
      await supabase.rpc("block_member", { p_user: target.id });
    }
    setSubmitting(false);
    onDone(alsoBlock);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-5 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="animate-pop w-full max-w-sm space-y-4 rounded-[2rem] bg-cream p-7 shadow-soft"
      >
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">
            Report {firstName(target.full_name)}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            A human on the Nomara team reviews every report. She won’t know it came
            from you.
          </p>
        </div>

        <div className="space-y-1.5">
          {REPORT_REASONS.map((r) => (
            <label
              key={r}
              className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-card"
            >
              <input
                type="radio"
                name="reason"
                checked={reason === r}
                onChange={() => setReason(r)}
                className="h-4 w-4 accent-terracotta"
              />
              {r}
            </label>
          ))}
        </div>

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={2}
          placeholder="Anything else we should know? (optional)"
          className="w-full rounded-2xl border border-sand-deep bg-white px-4 py-2.5 text-sm outline-none focus:border-terracotta"
        />

        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={alsoBlock}
            onChange={(e) => setAlsoBlock(e.target.checked)}
            className="h-4 w-4 accent-terracotta"
          />
          Also block her (you won’t see each other again)
        </label>

        {error && <p className="text-sm font-medium text-terracotta-deep">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-sand-deep py-3 text-sm font-bold text-ink-soft hover:bg-sand"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-full bg-terracotta py-3 text-sm font-bold text-white hover:bg-terracotta-deep disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send report"}
          </button>
        </div>
      </form>
    </div>
  );
}
