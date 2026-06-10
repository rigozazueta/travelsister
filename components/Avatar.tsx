import { avatarPalette, cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  photoUrl,
  size = "md",
  className,
}: {
  name: string | null | undefined;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-16 w-16 text-lg",
    xl: "h-24 w-24 text-2xl",
  };

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name ?? "Member"}
        className={cn(
          "rounded-full object-cover ring-2 ring-white shrink-0",
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br flex items-center justify-center font-semibold text-white ring-2 ring-white shrink-0",
        avatarPalette(name ?? "sister"),
        sizes[size],
        className
      )}
      aria-label={name ?? "Member"}
    >
      {initials(name)}
    </div>
  );
}
