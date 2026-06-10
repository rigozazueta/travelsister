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
        "inline-flex items-center rounded-md px-3 py-1.5 text-[12px] font-medium tracking-[0.02em] transition-colors",
        onClick && "cursor-pointer",
        selected
          ? "border border-ink bg-ink text-cream"
          : highlight
            ? "border border-sage/50 bg-sage/10 text-sage-deep"
            : "border border-ink/10 bg-white/60 text-ink-soft",
        onClick && !selected && "hover:border-ink/30 hover:text-ink"
      )}
    >
      {label}
    </Tag>
  );
}
