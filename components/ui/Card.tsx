import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "dark";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "bg-surface text-foreground shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)]",
  dark: "bg-trail text-white shadow-[0_8px_32px_rgba(15,20,36,0.18)]",
};

export function Card({
  children,
  variant = "default",
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`cursor-default rounded-3xl p-6 sm:p-8 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
