import { Card } from "./ui";
import type { LearningTrailItem } from "@/types/explanation";

export type { LearningTrailItem };

interface LearningTrailProps {
  items: LearningTrailItem[];
  heading?: string;
  eyebrow?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 shrink-0 text-white/90"
      aria-hidden
    >
      <path d="M10 17.2s-5.8-3.6-7.6-6.5C1 8.3 1.6 5.4 4.2 4.5c1.6-.6 3.3 0 4.2 1.3.9-1.3 2.6-1.9 4.2-1.3 2.6.9 3.2 3.8 1.8 6.2-1.8 2.9-7.4 6.5-7.4 6.5z" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4 shrink-0 text-white/90"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 15L15 5M8 5h7v7"
      />
    </svg>
  );
}

export function LearningTrail({
  items,
  eyebrow = "Your learning trail",
  heading = "Keep your best “aha!” moments close.",
  viewAllHref = "#history",
  viewAllLabel = "View saved explanations →",
}: LearningTrailProps) {
  return (
    <Card variant="dark" className="flex flex-col gap-5">
      <div className="cursor-default">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-muted">
          {eyebrow}
        </p>
        <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          {heading}
        </h3>
      </div>

      <ul className="flex flex-col gap-3.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex cursor-default items-start gap-3 text-[15px] text-white/95"
          >
            {item.icon === "heart" ? <HeartIcon /> : <TrendIcon />}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>

      <a
        href={viewAllHref}
        className="mt-1 inline-flex w-fit cursor-pointer items-center text-sm font-medium text-primary-muted transition-colors hover:text-white"
      >
        {viewAllLabel}
      </a>
    </Card>
  );
}
