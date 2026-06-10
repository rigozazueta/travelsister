"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export function EmailCapture({ source = "landing" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "already" | "error">(
    "idle"
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("saving");
    const { error } = await supabaseBrowser()
      .from("funnel_leads")
      .insert({ email: email.trim().toLowerCase(), name: name.trim(), source });
    if (!error) setState("done");
    else if (error.code === "23505") setState("already");
    else setState("error");
  }

  if (state === "done" || state === "already") {
    return (
      <div className="animate-pop rounded-2xl bg-sage/15 px-6 py-5 text-center">
        <p className="font-display text-xl font-semibold text-sage-deep">
          {state === "done" ? "You're on the list ✿" : "You're already on the list ✿"}
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          We’ll send you the next women’s trip drops and retreat invites.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="First name"
        className="rounded-full border border-sand-deep bg-white px-5 py-3 text-sm outline-none placeholder:text-ink-soft/60 focus:border-terracotta sm:w-40"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="flex-1 rounded-full border border-sand-deep bg-white px-5 py-3 text-sm outline-none placeholder:text-ink-soft/60 focus:border-terracotta"
      />
      <button
        type="submit"
        disabled={state === "saving"}
        className="rounded-full bg-terracotta px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-terracotta-deep disabled:opacity-60"
      >
        {state === "saving" ? "Joining…" : "Get trip drops"}
      </button>
      {state === "error" && (
        <p className="text-sm text-terracotta sm:self-center">
          Something went wrong — try again?
        </p>
      )}
    </form>
  );
}
