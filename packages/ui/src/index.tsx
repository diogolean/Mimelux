import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { palette, tokens } from "./tokens";

function classes(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span
      className={classes(
        "inline-flex items-center gap-2 font-black tracking-[-0.06em] text-ink dark:text-background",
        compact ? "text-xl" : "text-3xl",
        className,
      )}
    >
      <span className="relative grid size-8 place-items-center rounded-[11px] bg-ink text-background dark:bg-background dark:text-ink">
        <Sparkles className="size-4" strokeWidth={2.4} />
        <i className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-primary" />
      </span>
      Mimelux
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
    primary: "bg-primary text-ink shadow-[0_10px_28px_rgba(233,161,94,.28)] hover:brightness-105",
    secondary: "bg-surface text-ink hover:bg-[#eaded0] dark:bg-white/10 dark:text-background",
    outline: "border border-black/10 bg-white/55 text-ink hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-background",
    ghost: "bg-transparent text-ink hover:bg-black/5 dark:text-background dark:hover:bg-white/10",
    dark: "bg-ink text-background shadow-xl hover:bg-[#303039] dark:bg-background dark:text-ink",
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
}: HTMLAttributes<HTMLSpanElement> & { active?: boolean; children: ReactNode }) {
  return (
    <span
      className={classes(
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold",
        active ? "bg-ink text-white dark:bg-primary dark:text-ink" : "bg-surface text-ink dark:bg-white/10 dark:text-white/75",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { palette, tokens };
