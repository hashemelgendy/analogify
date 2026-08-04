import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  className?: string;
}

export function Textarea({
  label,
  id,
  className = "",
  ...props
}: TextareaProps) {
  const textareaId =
    id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex w-full flex-col gap-2.5">
      {label ? (
        <label
          htmlFor={textareaId}
          className="cursor-default text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-light"
        >
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        className={`w-full cursor-text resize-y rounded-2xl border border-border/80 bg-input-bg px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted-light outline-none transition-shadow focus:border-primary/30 focus:bg-white focus:ring-2 focus:ring-primary/20 ${className}`}
        {...props}
      />
    </div>
  );
}
