"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { SAFETY_EMAIL } from "@/lib/constants";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { DirectMessage, Profile } from "@/lib/types";
import { cn, firstName } from "@/lib/utils";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: conversationId } = use(params);
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [meId, setMeId] = useState<string | null>(null);
  const [other, setOther] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    const { data } = await supabase
      .from("direct_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(500);
    if (data) setMessages(data as DirectMessage[]);
  }, [supabase, conversationId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setMeId(user.id);

      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId)
        .neq("user_id", user.id);
      const otherId = participants?.[0]?.user_id as string | undefined;
      if (otherId) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", otherId)
          .single();
        if (!cancelled) setOther(profile as Profile);
      }

      await loadMessages();
    })();

    // Realtime + a gentle polling fallback.
    const channel = supabase
      .channel(`dm-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as DirectMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
          );
        }
      )
      .subscribe();
    const poll = setInterval(loadMessages, 6000);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [supabase, conversationId, loadMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !meId || sending) return;
    setSending(true);
    setDraft("");

    const { data, error } = await supabase
      .from("direct_messages")
      .insert({ conversation_id: conversationId, sender_id: meId, content })
      .select()
      .single();

    if (!error && data) {
      setMessages((prev) =>
        prev.some((m) => m.id === (data as DirectMessage).id)
          ? prev
          : [...prev, data as DirectMessage]
      );
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    } else if (error) {
      setDraft(content);
    }
    setSending(false);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-180px)] max-w-2xl flex-col md:h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-card">
        <Link href="/messages" className="px-1 text-xl text-ink-soft hover:text-ink">
          ←
        </Link>
        {other && (
          <>
            <Avatar name={other.full_name} photoUrl={other.profile_photo_url} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg font-semibold text-ink">
                {other.full_name}
              </p>
              <p className="truncate text-xs text-ink-soft">{other.location}</p>
            </div>
            <Link
              href="/trips"
              className="hidden rounded-full bg-sand px-4 py-2 text-xs font-bold text-ink hover:bg-sand-deep sm:block"
            >
              Find a trip together 🌍
            </Link>
          </>
        )}
      </div>

      <p className="mx-auto mt-3 max-w-md text-center text-[11px] leading-relaxed text-ink-soft">
        Be kind, trust your gut, and keep first meetups public. Anything off?{" "}
        <a href={`mailto:${SAFETY_EMAIL}`} className="font-semibold text-terracotta hover:underline">
          Tell us
        </a>
        .
      </p>

      {/* Messages */}
      <div className="mt-2 flex-1 space-y-2.5 overflow-y-auto px-1 py-4">
        {messages.length === 0 && other && (
          <p className="pt-10 text-center text-sm text-ink-soft">
            Say hi to {firstName(other.full_name)} — ask about her dream trip ✿
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === meId;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[78%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed shadow-card",
                  mine
                    ? "rounded-br-md bg-terracotta text-white"
                    : "rounded-bl-md bg-white text-ink"
                )}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <form onSubmit={send} className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={other ? `Message ${firstName(other.full_name)}…` : "Message…"}
          className="flex-1 rounded-full border border-sand-deep bg-white px-5 py-3 text-sm outline-none placeholder:text-ink-soft/50 focus:border-terracotta"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="rounded-full bg-terracotta px-6 py-3 text-sm font-bold text-white hover:bg-terracotta-deep disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
