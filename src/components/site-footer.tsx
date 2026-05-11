import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-paper/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p>© {new Date().getFullYear()} Library Card Finder · Digital Access for All</p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link to="/about" className="hover:text-foreground">
            About & mission
          </Link>
          <Link to="/request-region" className="hover:text-foreground">
            Request a region
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link to="/security" className="hover:text-foreground">
            Security
          </Link>
        </nav>
      </div>
    </footer>
  );
}