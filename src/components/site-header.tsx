import { Link } from "@tanstack/react-router";
import { Library } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg gradient-civic text-primary-foreground">
            <Library className="h-5 w-5" />
          </span>
          <span className="font-display text-lg leading-none">
            Library Card Finder
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <Link to="/" activeProps={{ className: "text-foreground" }} className="hover:text-foreground">
            Home
          </Link>
          <a href="/get-started" className="hover:text-foreground">
            Find my cards
          </a>
        </nav>
        <a
          href="/get-started"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          Get started
        </a>
      </div>
    </header>
  );
}