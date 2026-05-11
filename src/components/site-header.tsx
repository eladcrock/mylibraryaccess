import { Link, useNavigate } from "@tanstack/react-router";
import { Library, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    setOpen(false);
    navigate({ to: "/" });
  }

  const navLinkClass = "rounded-md px-2 py-1.5 hover:text-foreground";
  const activeProps = { className: "text-foreground font-medium" };

  const navLinks = (
    <>
      <Link
        to="/"
        activeOptions={{ exact: true }}
        activeProps={activeProps}
        className={navLinkClass}
        onClick={() => setOpen(false)}
      >
        Home
      </Link>
      <Link
        to="/get-started"
        activeProps={activeProps}
        className={navLinkClass}
        onClick={() => setOpen(false)}
      >
        {user ? "Find more cards" : "Find my cards"}
      </Link>
      {user ? (
        <>
          <Link
            to="/my-benefits"
            activeProps={activeProps}
            className={navLinkClass}
            onClick={() => setOpen(false)}
          >
            My benefits
          </Link>
          <Link
            to="/profile"
            activeProps={activeProps}
            className={navLinkClass}
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
        </>
      ) : null}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg gradient-civic text-primary-foreground">
            <Library className="h-5 w-5" />
          </span>
          <span className="font-display text-lg leading-none hidden xs:inline sm:inline">
            Library Card Finder
          </span>
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-4 text-sm text-muted-foreground md:flex">
          {navLinks}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {loading ? null : user ? (
            <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
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
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <Menu className="h-5 w-5" style={{ display: "none" }} /> : null}
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 text-sm text-muted-foreground">
            {navLinks}
            <div className="mt-2 border-t border-border/60 pt-3">
              {loading ? null : user ? (
                <button
                  type="button"
                  onClick={signOut}
                  className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              ) : (
                <div className="flex flex-col gap-1">
                  <Link
                    to="/login"
                    search={{ redirect: "/my-benefits", mode: "signin" }}
                    className="rounded-md px-2 py-1.5 hover:text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/get-started"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                    onClick={() => setOpen(false)}
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}