import type { ReactNode } from "react";

type TagVariant = "source" | "target" | "neutral";

interface TagProps {
  children: ReactNode;
  variant?: TagVariant;
  className?: string;
}

const variantStyles: Record<TagVariant, string> = {
  source: "bg-tag-source-bg text-tag-source-text",
  target: "bg-tag-target-bg text-tag-target-text",
  neutral: "bg-input-bg text-muted",
};

export function Tag({
  children,
  variant = "neutral",
  className = "",
}: TagProps) {
  return (
    <span
      className={`inline-flex cursor-default items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
