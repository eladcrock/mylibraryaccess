import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, BookmarkPlus, ExternalLink, ArrowUpRight } from "lucide-react";
import bannerDigital from "@/assets/banner-digital.jpg";
import bannerInPerson from "@/assets/banner-inperson.jpg";

const DIGITAL_CATEGORIES = new Set([
  "streaming",
  "ebooks",
  "learning",
  "news",
  "languages",
  "research",
  "career",
]);

function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2 hover:opacity-80 break-words"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function NotesCell({ row }: { row: Row }) {
  // Strip any URL already inside notes — we render it as a separate link below.
  const noteText = row.notes?.replace(/https?:\/\/[^\s)]+/g, "").replace(/\s+/g, " ").trim() ?? "";
  const fallback = row.url ?? row.library_website ?? null;
  if (!noteText && !fallback) return <>-</>;
  return (
    <div className="space-y-1">
      {noteText && <div>{noteText}</div>}
      {fallback && (
        <a
          href={fallback}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-accent underline underline-offset-2 hover:opacity-80"
        >
          {row.url ? "Learn more" : `Visit ${row.library_system_name}`}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

function stripLibrary(name: string) {
  return name.replace(/\s*\bLibrary\b\s*/gi, " ").replace(/\s+/g, " ").trim();
}

function MobileLinkButton({ row }: { row: Row }) {
  const fallback = row.url ?? row.library_website ?? null;
  if (!fallback) return null;
  return (
    <a
      href={fallback}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={row.url ? "Learn more" : `Visit ${row.library_system_name}`}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-accent hover:bg-accent/10"
    >
      <ArrowUpRight className="h-4 w-4" />
    </a>
  );
}

export const Route = createFileRoute("/_authenticated/my-benefits")({
  head: () => ({
    meta: [
      { title: "My benefits - Library Card Finder" },
      { name: "description", content: "Included benefits unlocked by your saved library cards, side by side." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyBenefitsPage,
});

type Row = {
  benefit_id: string;
  benefit_name: string;
  benefit_category: string;
  benefit_description: string | null;
  benefit_url: string | null;
  library_system_id: string;
  library_system_name: string;
  library_system_slug: string;
  limit_text: string | null;
  notes: string | null;
  url: string | null;
  library_website: string | null;
};

function MyBenefitsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const { data: favs, error: favErr } = await supabase
        .from("favorites")
        .select("library_system_id")
        .eq("user_id", user.id);
      if (favErr) {
        if (!cancelled) setError(favErr.message);
        return;
      }
      const ids = (favs ?? []).map((f) => f.library_system_id);
      if (ids.length === 0) {
        if (!cancelled) setRows([]);
        return;
      }

      const [{ data: systems, error: sErr }, { data: lbs, error: lbErr }, { data: benefits, error: bErr }] =
        await Promise.all([
          supabase.from("library_systems").select("id,name,slug,website").in("id", ids),
          supabase
            .from("library_benefits")
            .select("library_system_id,benefit_id,limit_text,notes,url")
            .in("library_system_id", ids),
          supabase.from("benefits").select("id,name,category,description,url"),
        ]);

      if (sErr || lbErr || bErr) {
        if (!cancelled) setError((sErr ?? lbErr ?? bErr)!.message);
        return;
      }

      const sysMap = new Map((systems ?? []).map((s) => [s.id, s]));
      const benMap = new Map((benefits ?? []).map((b) => [b.id, b]));
      const out: Row[] = (lbs ?? []).flatMap((lb) => {
        const sys = sysMap.get(lb.library_system_id);
        const ben = benMap.get(lb.benefit_id);
        if (!sys || !ben) return [];
        return [{
          benefit_id: ben.id,
          benefit_name: ben.name,
          benefit_category: ben.category,
          benefit_description: (ben as { description?: string | null }).description ?? null,
          benefit_url: (ben as { url?: string | null }).url ?? null,
          library_system_id: sys.id,
          library_system_name: sys.name,
          library_system_slug: sys.slug,
          limit_text: lb.limit_text,
          notes: lb.notes,
          url: (lb as { url?: string | null }).url ?? null,
          library_website: (sys as { website?: string | null }).website ?? null,
        }];
      });
      if (!cancelled) setRows(out);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const grouped = useMemo(() => {
    if (!rows) return null;
    const map = new Map<string, { benefit: Row; systems: Row[] }>();
    for (const r of rows) {
      const existing = map.get(r.benefit_id);
      if (existing) existing.systems.push(r);
      else map.set(r.benefit_id, { benefit: r, systems: [r] });
    }
    return Array.from(map.values()).sort((a, b) =>
      a.benefit.benefit_name.localeCompare(b.benefit.benefit_name),
    );
  }, [rows]);

  const digitalGroups = useMemo(
    () => grouped?.filter((g) => DIGITAL_CATEGORIES.has(g.benefit.benefit_category)) ?? [],
    [grouped],
  );
  const inPersonGroups = useMemo(
    () => grouped?.filter((g) => !DIGITAL_CATEGORIES.has(g.benefit.benefit_category)) ?? [],
    [grouped],
  );

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!rows) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <p className="text-sm uppercase tracking-wide text-accent">Your library cards</p>
      <h1 className="mt-2 font-display text-4xl text-foreground">My benefits</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        These are <strong>included</strong> benefits unlocked by the library cards you've
        saved, with the per-card limits side by side. The more cards you hold, the more
        digital benefits you can access at no extra cost.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        These are the digital benefits we track. Visit each library's website or
        a branch in person to discover events, the Library of Things, museum
        passes, classes, and much more.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Did we miss something?{" "}
        <a
          href="mailto:eladcrock@gmail.com?subject=Suggested%20library%20benefit%20to%20list"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline hover:no-underline"
        >
          Click here to submit a service that should be listed.
        </a>
      </p>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-paper/40 p-10 text-center">
          <BookmarkPlus className="mx-auto h-8 w-8 text-accent" />
          <h2 className="mt-3 font-display text-xl text-foreground">No saved cards yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Find your library cards and save the ones you qualify for to build your benefits view.
          </p>
          <Link
            to="/get-started"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Find my cards
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {digitalGroups.length > 0 && (
            <BenefitSection
              title="Digital benefits"
              subtitle="Use these from anywhere with your library card."
              groups={digitalGroups}
              banner={bannerDigital}
            />
          )}
          {inPersonGroups.length > 0 && (
            <BenefitSection
              title="In-person resources"
              subtitle="Visit a branch to borrow, book, or use these in person."
              groups={inPersonGroups}
              banner={bannerInPerson}
            />
          )}
        </div>
      )}
    </div>
  );
}

function BenefitSection({
  title,
  subtitle,
  groups,
  banner,
}: {
  title: string;
  subtitle: string;
  groups: { benefit: Row; systems: Row[] }[];
  banner?: string;
}) {
  return (
    <div>
      <div
        className="relative overflow-hidden rounded-xl border border-border"
        style={
          banner
            ? {
                backgroundImage: `url(${banner})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40" />
        <div className="relative px-5 py-6 sm:px-6 sm:py-8">
          <h2 className="font-display text-2xl text-foreground drop-shadow-sm">{title}</h2>
          <p className="mt-1 text-sm text-foreground/80">{subtitle}</p>
        </div>
      </div>
      <div className="mt-6 space-y-6">
        {groups.map(({ benefit, systems }) => (
          <section
            key={benefit.benefit_id}
            className="rounded-xl border border-border bg-card p-5 sm:p-6"
          >
            <header className="flex items-baseline justify-between gap-4">
              <div>
                <h3 className="font-display text-xl text-foreground">{benefit.benefit_name}</h3>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {benefit.benefit_category}
                </p>
                {benefit.benefit_url && (
                  <a
                    href={benefit.benefit_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent underline underline-offset-2 hover:opacity-80"
                  >
                    Visit {benefit.benefit_name} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                {systems.length} card{systems.length === 1 ? "" : "s"}
              </span>
            </header>
            {benefit.benefit_description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {benefit.benefit_description}
              </p>
            )}

            <div className="mt-4 overflow-hidden rounded-lg border border-border/60">
              {/* Desktop / tablet table */}
              <table className="hidden w-full text-sm lg:table">
                <thead className="bg-paper/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Library system</th>
                    <th className="px-4 py-2 font-medium">Per-card limit</th>
                    <th className="px-4 py-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {systems
                    .slice()
                    .sort((a, b) => a.library_system_name.localeCompare(b.library_system_name))
                    .map((s) => (
                      <tr key={s.library_system_id} className="border-t border-border/60">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {stripLibrary(s.library_system_name)}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {s.limit_text ?? <span className="text-muted-foreground">No limit listed</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <NotesCell row={s} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {/* Mobile stacked list */}
              <ul className="divide-y divide-border/60 lg:hidden">
                {systems
                  .slice()
                  .sort((a, b) => a.library_system_name.localeCompare(b.library_system_name))
                  .map((s) => (
                    <li key={s.library_system_id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-foreground">
                          {stripLibrary(s.library_system_name)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {s.limit_text ?? "No limit listed"}
                        </div>
                      </div>
                      <MobileLinkButton row={s} />
                    </li>
                  ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}