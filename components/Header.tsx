import Link from "next/link";
import { Logo } from "./Logo";

interface HeaderProps {
  /** Optional right-side content (defaults to brand tagline) */
  trailing?: React.ReactNode;
}

export function Header({ trailing }: HeaderProps = {}) {
  return (
    <header className="flex cursor-default items-center justify-between gap-4">
      <Link
        href="/"
        className="cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Logo />
      </Link>
      {trailing ?? (
        <p className="text-right text-sm text-muted-light">
          Illuminate your understanding
        </p>
      )}
    </header>
  );
}
