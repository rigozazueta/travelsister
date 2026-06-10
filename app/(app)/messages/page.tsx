"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { DirectMessage, Profile } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

type Thread = {
  conversationId: string;
  updatedAt: string;
  other: Profile;
  lastMessage: DirectMessage | null;
};

export default function MessagesPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: mine } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      const convIds = (mine ?? []).map((m) => m.conversation_id as string);
      if (convIds.length === 0) {
        setLoading(false);
        return;
      }

      const [{ data: convs }, { data: participants }, { data: recent }] = await Promise.all([
        supabase.from("conversations").select("id, updated_at").in("id", convIds),
        supabase
          .from("conversation_participants")
          .select("conversation_id, user_id")
          .in("conversation_id", convIds)
          .neq("user_id", user.id),
        supabase
          .from("direct_messages")
          .select("*")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: false })
          .limit(200),
      ]);

      const otherIds = [...new Set((participants ?? []).map((p) => p.user_id as string))];
      const { data: profiles } = otherIds.length
        ? await supabase.from("users").select("*").in("id", otherIds)
        : { data: [] };
      const profileById = new Map(((profiles ?? []) as Profile[]).map((p) => [p.id, p]));
      const otherByConv = new Map(
        (participants ?? []).map((p) => [p.conversation_id as string, p.user_id as string])
      );
      const lastByConv = new Map<string, DirectMessage>();
      ((recent ?? []) as DirectMessage[]).forEach((m) => {
        if (!lastByConv.has(m.conversation_id)) lastByConv.set(m.conversation_id, m);
      });

      const list = ((convs ?? []) as { id: string; updated_at: string }[])
        .map((c) => {
          const other = profileById.get(otherByConv.get(c.id) ?? "");
          if (!other) return null;
          return {
            conversationId: c.id,
            updatedAt: c.updated_at,
            other,
            lastMessage: lastByConv.get(c.id) ?? null,
          };
        })
        .filter((t): t is Thread => !!t)
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

      setThreads(list);
      setLoading(false);
    })();
  }, [supabase]);

  if (loading) {
    return <p className="py-24 text-center text-ink-soft">Opening your inbox…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-ink">Messages</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Conversations only happen between connected sisters.
      </p>

      {threads.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-card">
          <p className="text-3xl">💬</p>
          <p className="mt-3 font-display text-xl font-semibold text-ink">No messages yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
            Match with a sister in Discover and the conversation starts here.
          </p>
          <Link
            href="/discover"
            className="mt-5 inline-block rounded-full bg-terracotta px-6 py-3 text-sm font-bold text-white hover:bg-terracotta-deep"
          >
            Find your people
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {threads.map((t) => (
            <Link
              key={t.conversationId}
              href={`/messages/${t.conversationId}`}
              className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
              <Avatar name={t.other.full_name} photoUrl={t.other.profile_photo_url} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate font-display text-lg font-semibold text-ink">
                    {t.other.full_name}
                  </p>
                  <span className="shrink-0 text-xs text-ink-soft">
                    {timeAgo(t.lastMessage?.created_at ?? t.updatedAt)}
                  </span>
                </div>
                <p className="truncate text-sm text-ink-soft">
                  {t.lastMessage?.content ?? "Say hi ✿"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
