import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-baseline gap-2", className)}>
      <span className="font-display text-2xl font-semibold tracking-tight text-ink">
        travel<span className="italic text-terracotta">sister</span>
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft group-hover:text-terracotta transition-colors">
        by Nomara
      </span>
    </Link>
  );
}
