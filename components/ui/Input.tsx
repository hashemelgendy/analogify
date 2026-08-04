import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export function Input({ label, id, className = "", ...props }: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex w-full flex-col gap-2.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="cursor-default text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-light"
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`w-full cursor-text rounded-2xl border border-border/80 bg-input-bg px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted-light outline-none transition-shadow focus:border-primary/30 focus:bg-white focus:ring-2 focus:ring-primary/20 ${className}`}
        {...props}
      />
    </div>
  );
}
