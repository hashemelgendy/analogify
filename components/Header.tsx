import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="flex cursor-default items-center justify-between gap-4">
      <Logo />
      <p className="text-right text-sm text-muted-light">
        Learning, made familiar
      </p>
    </header>
  );
}
