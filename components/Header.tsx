import Link from "next/link";
import type { ReactNode } from "react";
import { AuthControls } from "./AuthControls";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";

interface HeaderProps {
  /** Left of logo (e.g. burger menu on mobile) */
  leading?: ReactNode;
  /** Optional right-side content (shown next to auth + language; replaces tagline) */
  trailing?: ReactNode;
  /** Show brand tagline when no custom trailing content (desktop only) */
  showTagline?: boolean;
  tagline?: string;
  className?: string;
}

export function Header({
  leading,
  trailing,
  showTagline = true,
  tagline = "Illuminate your understanding",
  className = "",
}: HeaderProps = {}) {
  return (
    <header
      className={`flex cursor-default items-center justify-between gap-3 sm:gap-4 ${className}`.trim()}
    >
      <div className="flex min-w-0 items-center gap-2">
        {leading}
        <Link
          href="/"
          className="cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Logo />
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {trailing ??
          (showTagline ? (
            <p className="hidden text-end text-sm text-muted-light lg:block">
              {tagline}
            </p>
          ) : null)}
        <AuthControls />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
