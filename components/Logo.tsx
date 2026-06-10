import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  tone = "dark",
}: {
  href?: string;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-baseline gap-3", className)}>
      <span
        className={cn(
          "font-display text-[1.55rem] font-medium tracking-tight",
          tone === "dark" ? "text-ink" : "text-cream"
        )}
      >
        travel<span className="italic font-normal text-terracotta">sister</span>
      </span>
      <span
        className={cn(
          "hidden text-[10px] font-semibold uppercase tracking-[0.3em] sm:inline",
          tone === "dark" ? "text-ink-soft" : "text-cream/60"
        )}
      >
        Nomara
      </span>
    </Link>
  );
}
