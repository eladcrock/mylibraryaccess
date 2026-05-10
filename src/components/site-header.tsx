import { Link, useNavigate } from "@tanstack/react-router";
import { Library, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
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
          <Link to="/get-started" activeProps={{ className: "text-foreground" }} className="hover:text-foreground">
            Find my cards
          </Link>
          {user ? (
            <Link to="/my-benefits" activeProps={{ className: "text-foreground" }} className="hover:text-foreground">
              My benefits
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          {loading ? null : user ? (
            <>
              <Link
                to="/my-benefits"
                className="hidden rounded-md border border-input px-3 py-2 text-sm font-medium text-foreground hover:bg-accent/10 sm:inline-flex"
              >
                My benefits
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                search={{ redirect: "/my-benefits", mode: "signin" }}
                className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to="/get-started"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}