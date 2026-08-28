"use client";

import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: "sm" | "md";
}

export default function PillButton({ active, size = "md", className, ...rest }: Props) {
  return (
    <button
      className={clsx(
        "pill-btn border whitespace-nowrap",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        active
          ? "bg-[var(--accent-green-soft)] border-[var(--accent-green)] text-[var(--accent-green)]"
          : "bg-transparent border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]",
        className
      )}
      {...rest}
    />
  );
}
