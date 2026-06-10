"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

type Lead = {
  id: string;
  email: string;
  name: string;
  source: string;
  created_at: string;
};

type Report = {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  details: string;
  status: "open" | "resolved";
  created_at: string;
};

type Tab = "overview" | "members" | "leads" | "reports";

export default function AdminPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [members, setMembers] = useState<Profile[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [circleJoins, setCircleJoins] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: me } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (!me?.is_admin) {
        setAuthorized(false);
        return;
      }
      setAuthorized(true);

      const [{ data: memberRows }, { data: leadRows }, { data: reportRows }, { count }] =
        await Promise.all([
          supabase.from("users").select("*").order("created_at", { ascending: false }),
          supabase.from("funnel_leads").select("*").order("created_at", { ascending: false }),
          supabase.from("member_reports").select("*").order("created_at", { ascending: false }),
          supabase.from("trip_members").select("*", { count: "exact", head: true }),
        ]);
      setMembers((memberRows ?? []) as Profile[]);
      setLeads((leadRows ?? []) as Lead[]);
      setReports((reportRows ?? []) as Report[]);
      setCircleJoins(count ?? 0);
    })();
  }, [supabase]);

  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const openReports = reports.filter((r) => r.status === "open");

  async function setVerification(memberId: string, status: "verified" | "pending") {
    await supabase.from("users").update({ verification_status: status }).eq("id", memberId);
    setMembers((ms) =>
      ms.map((m) => (m.id === memberId ? { ...m, verification_status: status } : m))
    );
  }

  async function resolveReport(reportId: string) {
    await supabase
      .from("member_reports")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", reportId);
    setReports((rs) =>
      rs.map((r) => (r.id === reportId ? { ...r, status: "resolved" as const } : r))
    );
  }

  async function copyLeadEmails() {
    await navigator.clipboard.writeText(leads.map((l) => l.email).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (authorized === null) {
    return <p className="py-24 text-center text-ink-soft">Checking access…</p>;
  }

  if (!authorized) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-2xl font-medium text-ink">Admins only</p>
        <p className="mt-2 text-sm text-ink-soft">
          This area is for the Nomara team. If that’s you, ask a teammate to flag your
          account as admin.
        </p>
      </div>
    );
  }

  const stats = [
    { label: "Members", value: members.length },
    { label: "Funnel leads", value: leads.length },
    { label: "Open reports", value: openReports.length },
    { label: "Trip circle joins", value: circleJoins },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-[2rem] font-light tracking-[-0.01em] text-ink">Nomara admin</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Community health, funnel leads, and safety reports.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["overview", "members", "leads", "reports"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg px-5 py-2.5 text-sm font-semibold capitalize transition-colors",
              tab === t ? "bg-ink text-cream" : "bg-white text-ink-soft shadow-card hover:text-ink"
            )}
          >
            {t}
            {t === "reports" && openReports.length > 0 && (
              <span className="ml-2 rounded-lg bg-terracotta px-2 py-0.5 text-xs text-white">
                {openReports.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-white p-5 text-center shadow-card">
              <p className="font-display text-[2rem] font-light tracking-[-0.01em] text-terracotta">{s.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === "members" && (
        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-card"
            >
              <Avatar name={m.full_name} photoUrl={m.profile_photo_url} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {m.full_name || "(onboarding not finished)"}
                  {m.is_admin && (
                    <span className="ml-2 rounded-full bg-gold/30 px-2 py-0.5 text-[10px] font-semibold uppercase">
                      admin
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-ink-soft">
                  {m.email} · {m.location ?? "—"} · joined {timeAgo(m.created_at)}
                </p>
              </div>
              <button
                onClick={() =>
                  setVerification(
                    m.id,
                    m.verification_status === "verified" ? "pending" : "verified"
                  )
                }
                className={cn(
                  "rounded-lg px-4 py-2 text-xs font-semibold transition-colors",
                  m.verification_status === "verified"
                    ? "bg-sage text-white hover:bg-sage-deep"
                    : "border border-sand-deep text-ink-soft hover:bg-sand"
                )}
              >
                {m.verification_status === "verified" ? "✓ Verified" : "Mark verified"}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "leads" && (
        <div className="space-y-3">
          <button
            onClick={copyLeadEmails}
            disabled={leads.length === 0}
            className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-cream hover:bg-terracotta disabled:opacity-50"
          >
            {copied ? "Copied ✓" : `Copy ${leads.length} emails`}
          </button>
          {leads.length === 0 ? (
            <p className="rounded-xl bg-white p-8 text-center text-sm text-ink-soft shadow-card">
              No leads yet — share the landing page to start collecting.
            </p>
          ) : (
            <div className="space-y-2">
              {leads.map((l) => (
                <div
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-5 py-3 shadow-card"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{l.email}</p>
                    <p className="text-xs text-ink-soft">
                      {l.name || "—"} · via {l.source}
                    </p>
                  </div>
                  <span className="text-xs text-ink-soft">{timeAgo(l.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-2">
          {reports.length === 0 && (
            <p className="rounded-xl bg-white p-8 text-center text-sm text-ink-soft shadow-card">
              No reports — a quiet queue is a healthy community.
            </p>
          )}
          {reports.map((r) => {
            const reported = memberById.get(r.reported_user_id);
            const reporter = memberById.get(r.reporter_id);
            return (
              <div
                key={r.id}
                className={cn(
                  "rounded-xl bg-white p-5 shadow-card",
                  r.status === "resolved" && "opacity-60"
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">
                    {reported?.full_name ?? "Unknown"}{" "}
                    <span className="font-semibold text-terracotta">· {r.reason}</span>
                  </p>
                  {r.status === "open" ? (
                    <button
                      onClick={() => resolveReport(r.id)}
                      className="rounded-lg bg-terracotta px-4 py-2 text-xs font-semibold text-white hover:bg-terracotta-deep"
                    >
                      Mark resolved
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-sage-deep">✓ Resolved</span>
                  )}
                </div>
                {r.details && <p className="mt-2 text-sm text-ink-soft">“{r.details}”</p>}
                <p className="mt-2 text-xs text-ink-soft">
                  Reported by {reporter?.full_name ?? "a member"} · {timeAgo(r.created_at)} ·{" "}
                  {reported?.email}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
