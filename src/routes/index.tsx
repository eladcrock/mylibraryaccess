import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Film, GraduationCap, Landmark, Newspaper, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Library Card Finder — Discover every library card you qualify for" },
      { name: "description", content: "Find every public library card you're eligible for in California. Compare Kanopy, Hoopla, Libby, LinkedIn Learning and more — free." },
      { property: "og:title", content: "Library Card Finder" },
      { property: "og:description", content: "Discover every library card you qualify for and what each one unlocks." },
    ],
  }),
  component: Index,
});

function Index() {
  const benefits = [
    { icon: Film, name: "Kanopy", desc: "Indie films & docs" },
    { icon: BookOpen, name: "Libby", desc: "Ebooks & audiobooks" },
    { icon: GraduationCap, name: "LinkedIn Learning", desc: "Pro courses" },
    { icon: Newspaper, name: "NYT", desc: "Digital access" },
    { icon: Landmark, name: "Museum passes", desc: "Free entry" },
    { icon: ShieldCheck, name: "Consumer Reports", desc: "Reviews & ratings" },
  ];
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-paper/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:py-28 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              Now serving California · 12 systems mapped
            </span>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] text-foreground sm:text-6xl">
              Find every library card<br />you're eligible for.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Many California residents qualify for far more library cards than they realize.
              Answer a few questions and we'll show you every card you can apply for — and what
              each one unlocks.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/get-started"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Find my library cards <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                search={{ redirect: "/my-benefits", mode: "signin" }}
                className="inline-flex items-center rounded-md border border-input bg-background px-5 py-3 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
              >
                Sign in
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Free · No account required · Updated monthly
            </p>
          </div>
          <div className="relative hidden lg:block">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-primary/5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl">San Francisco Public Library</h3>
                <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                  Eligible now
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Free for any California resident
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                {["Kanopy", "Libby", "LinkedIn", "NYT", "Museum", "Rosetta"].map((b) => (
                  <span
                    key={b}
                    className="rounded-md border border-border bg-paper/60 px-2 py-2 text-center text-muted-foreground"
                  >
                    {b}
                  </span>
                ))}
              </div>
              <button className="mt-5 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                Apply online
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured benefits */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl text-foreground">What library cards unlock</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Premium digital services worth hundreds of dollars per year — included with most cards.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {benefits.map(({ icon: Icon, name, desc }) => (
            <div
              key={name}
              className="rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Icon className="h-5 w-5 text-accent" />
              <p className="mt-3 font-medium text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border/60 bg-paper/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-3xl text-foreground">How it works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              { n: "01", t: "Tell us where you live", d: "State, county, and a few optional details." },
              { n: "02", t: "See every eligible card", d: "Sorted by what's free, paid, or in-person." },
              { n: "03", t: "Apply online in minutes", d: "Direct links straight to each library's signup." },
            ].map((s) => (
              <div key={s.n}>
                <span className="font-display text-3xl text-accent">{s.n}</span>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link
              to="/get-started"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
            >
              Start the 30-second survey <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Request a region */}
      <section className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-xl text-foreground">
              Don't see your area?
            </h3>
            <p className="text-sm text-muted-foreground">
              We're starting with California. Tell us where to expand next.
            </p>
          </div>
          <Link
            to="/request-region"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent/10"
          >
            Request a region <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
