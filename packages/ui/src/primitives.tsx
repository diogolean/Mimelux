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

/** Apoio, kept as an alternative: a mint heart under the bowl. */
const patronageHeart =
  "M22.4 15.2c1.55-1.85 4.55-1.7 6.05.25 1.15 1.5 1.05 3.65-.15 5.15L22.4 27.2l-5.9-6.6c-1.2-1.5-1.3-3.65-.15-5.15 1.5-1.95 4.5-2.1 6.05-.25z";

/** Centelha, the default: the same P with a mint four-point spark. */
const patronageSpark =
  "M23.2 13.6l1.85 4.85 5.05 1.85-5.05 1.85-1.85 4.85-1.85-4.85-5.05-1.85 5.05-1.85z";

export type StarConceptId = "a" | "b" | "c" | "d" | "e" | "f";

export const starConcepts: Array<{ id: StarConceptId; name: string; line: string }> = [
  { id: "a", name: "Vazio", line: "Five-point star cut out of the bowl" },
  { id: "b", name: "Cauda", line: "The stem ends in a shooting-star tail" },
  { id: "c", name: "Núcleo", line: "Five-point star fills the counter" },
  { id: "d", name: "Norte", line: "Asymmetric north-star compass" },
  { id: "e", name: "Coroa", line: "Crown peaks over a heart, reading as a star" },
  { id: "f", name: "Traço", line: "One monoline stroke traces the star" },
];

const accent = "var(--accent, #62D4C8)";

function StarGlyph({ id }: { id: StarConceptId }) {
  if (id === "a") {
    return (
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M6.2 4.2h9.8c4.9 0 8 2.85 8 6.9s-3.1 6.9-8 6.9H10.6V27.8H6.2V4.2zM16.4 6.4l1.12 3.16 3.35.09-2.66 2.04.95 3.21L16.4 13l-2.76 1.9.95-3.21-2.66-2.04 3.35-.09L16.4 6.4z"
      />
    );
  }
  if (id === "b") {
    return (
      <>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M4.6 4.2h8.4c3.9 0 6.3 2.25 6.3 5.5s-2.4 5.5-6.3 5.5H8.8V27.8H4.6V4.2zm4.2 3.1v4.7h3.8c1.6 0 2.55-.85 2.55-2.35S14.2 7.3 12.6 7.3H8.8z"
        />
        <path fill="currentColor" d="M8.8 16.4 19.4 18.8 20.2 23.6 8.8 21.4Z" />
        <path
          fill={accent}
          d="M23.6 13l1.53 4.3 4.56.12-3.62 2.78 1.29 4.38L23.6 22l-3.76 2.58 1.29-4.38-3.62-2.78 4.56-.12L23.6 13z"
        />
      </>
    );
  }
  if (id === "c") {
    return (
      <>
        <path fill="currentColor" fillRule="evenodd" d={patronageStem} />
        <path
          fill={accent}
          d="M16.3 4.9l1.5 4.24 4.49.11-3.56 2.74 1.27 4.31L16.3 13.75l-3.7 2.55 1.27-4.31-3.56-2.74 4.49-.11L16.3 4.9z"
        />
      </>
    );
  }
  if (id === "d") {
    return (
      <>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M4.4 5.2h7.6c3.4 0 5.5 2 5.5 5s-2.1 5-5.5 5H8.4v11.4H4.4V5.2zm4 3v4h3.2c1.35 0 2.15-.75 2.15-2s-.8-2-2.15-2H8.4z"
        />
        <path
          fill={accent}
          d="M22.4 3.6l1.55 8.7 7.15 1.7-6.9 2.15-.7 6.55-2.15-6.15-6.35-2.35 6.7-2.05 1.7-8.55z"
        />
        <circle cx="23.2" cy="15.6" r="1.7" fill="currentColor" />
      </>
    );
  }
  if (id === "e") {
    return (
      <>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M4.4 5.2h7.6c3.4 0 5.5 2 5.5 5s-2.1 5-5.5 5H8.4v11.4H4.4V5.2zm4 3v4h3.2c1.35 0 2.15-.75 2.15-2s-.8-2-2.15-2H8.4z"
        />
        <path
          fill={accent}
          d="M23 18.2c0 0-5.4-3.6-5.4 1.1 0 2.6 2.6 4.5 5.4 7.4 2.8-2.9 5.4-4.8 5.4-7.4 0-4.7-5.4-1.1-5.4-1.1z"
        />
        <path fill={accent} d="M18.2 17.4 20.2 10.2 21.8 16.2 23 8.2 24.2 16.2 25.8 10.4 27.8 17.4 23 18.4Z" />
      </>
    );
  }
  return (
    <>
      <path
        d="M8 28V12.07H10.4L16.26 11.93 18.2 6.4 20.14 11.93 26 12.07 21.34 15.62 23.02 21.23 18.2 17.9 13.38 21.23 15.06 15.62 10.4 12.07"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18.2" cy="14.6" r="1.35" fill={accent} />
    </>
  );
}

export function StarMark({
  id,
  className,
  title,
}: {
  id: StarConceptId;
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
      <StarGlyph id={id} />
    </svg>
  );
}

export function Mark({
  variant = "spark",
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
  mark = "spark",
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
