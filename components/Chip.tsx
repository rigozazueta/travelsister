"use client";

import { cn } from "@/lib/utils";

export function Chip({
  label,
  selected,
  highlight,
  onClick,
}: {
  label: string;
  selected?: boolean;
  highlight?: boolean;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
        onClick && "cursor-pointer hover:-translate-y-0.5",
        selected
          ? "border-terracotta bg-terracotta text-white shadow-card"
          : highlight
            ? "border-sage bg-sage/15 text-sage-deep"
            : "border-sand-deep bg-white/70 text-ink-soft"
      )}
    >
      {label}
    </Tag>
  );
}
