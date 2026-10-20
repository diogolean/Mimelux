import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
function classes(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

export type MarkVariant = "heart" | "spark";

/** Geometric P. The counter stays open so the letter reads at 16px. */
const patronageStem =
  "M7 5.2h9.4c4.35 0 7.15 2.55 7.15 6.35s-2.8 6.35-7.15 6.35H11.35V26.8H7V5.2zm4.35 3.35v6h4.85c1.95 0 3.15-1.1 3.15-2.95s-1.2-2.95-3.15-2.95H11.35z";

/** Concept A, default: a mint heart tucked under the bowl — patronage. */
const patronageHeart =
  "M23.5 18.35c.98-1.22 2.9-1.26 3.9-.04.78.94.82 2.28.12 3.24L23.5 26.05l-4.02-4.5c-.7-.96-.66-2.3.12-3.24 1-1.22 2.92-1.18 3.9.04z";

/** Concept B: the same P with a four-point spark instead of the heart. */
const patronageSpark =
  "M23.7 17.15l1.2 3.25 3.4 1.2-3.4 1.2-1.2 3.25-1.2-3.25-3.4-1.2 3.4-1.2z";

export function Mark({
  variant = "heart",
  className,
  title,
}: {
  variant?: MarkVariant;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path fill="currentColor" fillRule="evenodd" d={patronageStem} />
      <path
        fill="var(--accent, #62D4C8)"
        d={variant === "spark" ? patronageSpark : patronageHeart}
      />
    </svg>
  );
}

export function Logo({
  compact = false,
  className,
  tone = "auto",
  mark = "heart",
}: {
  compact?: boolean;
  className?: string;
  tone?: "auto" | "onDark";
  mark?: MarkVariant;
}) {
  const onDark = tone === "onDark";
  return (
    <span
      className={classes(
        "inline-flex items-center gap-2.5",
        compact ? "text-xl" : "text-3xl",
        className,
      )}
    >
      <span
        className={classes(
          "grid size-8 shrink-0 place-items-center rounded-[10px]",
          onDark ? "bg-white text-ink" : "bg-foreground text-background",
        )}
      >
        <Mark variant={mark} className="size-[22px]" />
      </span>
      <span
        className={classes(
          "font-medium tracking-[-0.055em]",
          onDark ? "text-white" : "text-foreground",
        )}
      >
        Patro
        <span className={classes("font-semibold", onDark ? "text-primary" : "text-primary-strong")}>
          cino
        </span>
      </span>
    </span>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "dark";
  size?: "sm" | "md" | "lg" | "icon";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-primary text-ink shadow-[0_10px_28px_color-mix(in_srgb,var(--primary)_28%,transparent)] hover:brightness-105",
    secondary:
      "bg-surface text-foreground hover:bg-primary/15",
    outline:
      "border border-border bg-elevated/65 text-foreground hover:bg-elevated",
    ghost:
      "bg-transparent text-foreground hover:bg-surface",
    dark: "bg-foreground text-background shadow-xl hover:opacity-90",
  };
  const sizes = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-5 text-sm",
    lg: "h-13 px-7 text-sm",
    icon: "size-11 p-0",
  };

  return (
    <button
      type={type}
      className={classes(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-bold transition duration-200 active:scale-[.97] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function Pill({
  children,
  active,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={classes(
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold",
        active
          ? "bg-ink text-white dark:bg-primary dark:text-ink"
          : "bg-surface text-ink dark:bg-white/10 dark:text-white/75",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
