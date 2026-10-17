import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
function classes(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

export function Logo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={classes(
        "inline-flex items-center gap-2.5",
        compact ? "text-xl" : "text-3xl",
        className,
      )}
    >
      <span className="relative grid size-8 place-items-center rounded-[10px] bg-foreground text-[15px] font-semibold leading-none tracking-[-0.04em] text-background">
        F
        <i className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-primary ring-2 ring-background" />
      </span>
      <span className="font-medium tracking-[-0.055em] text-foreground">
        Fan<span className="font-semibold text-primary-strong">Mimo</span>
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
