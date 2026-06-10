"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { supabaseBrowser } from "@/lib/supabase/client";

export function PhotoUpload({
  userId,
  name,
  value,
  onChange,
}: {
  userId: string;
  name: string | null | undefined;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlField, setShowUrlField] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Images need to be under 5 MB.");
      return;
    }
    setUploading(true);
    const supabase = supabaseBrowser();
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${userId}/${Date.now()}.${ext || "jpg"}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (uploadError) {
      setError("Upload failed — try a different photo, or paste a URL instead.");
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex items-start gap-4">
      <Avatar name={name} photoUrl={value || null} size="xl" />
      <div className="flex-1 space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta disabled:opacity-60"
          >
            {uploading ? "Uploading…" : value ? "Change photo" : "Upload a photo"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-sm font-semibold text-ink-soft hover:text-ink"
            >
              Remove
            </button>
          )}
        </div>
        {showUrlField ? (
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-terracotta"
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowUrlField(true)}
            className="text-xs font-semibold text-ink-soft underline-offset-2 hover:underline"
          >
            or paste an image URL
          </button>
        )}
        {error && <p className="text-sm font-medium text-terracotta-deep">{error}</p>}
      </div>
    </div>
  );
}
