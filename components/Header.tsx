import Link from "next/link";
import { AuthControls } from "./AuthControls";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";

interface HeaderProps {
  /** Optional right-side content (shown next to auth + language; replaces tagline) */
  trailing?: React.ReactNode;
  /** Show brand tagline when no custom trailing content (desktop only) */
  showTagline?: boolean;
  tagline?: string;
}

export function Header({
  trailing,
  showTagline = true,
  tagline = "Illuminate your understanding",
}: HeaderProps = {}) {
  return (
    <header className="flex cursor-default items-center justify-between gap-4">
      <Link
        href="/"
        className="cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Logo />
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        {trailing ??
          (showTagline ? (
            <p className="hidden text-end text-sm text-muted-light md:block">
              {tagline}
            </p>
          ) : null)}
        <AuthControls />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
