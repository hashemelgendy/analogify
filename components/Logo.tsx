export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex cursor-default items-center gap-2.5 ${className}`}>
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary shadow-sm shadow-primary/25"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="h-4 w-4 text-white"
          aria-hidden
        >
          <path
            d="M3 11.5L8 3.5L13 11.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.2 11.5H10.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-foreground">
        Analogify
      </span>
    </div>
  );
}
