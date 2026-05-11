import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, BookmarkPlus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/my-benefits")({
  head: () => ({
    meta: [
      { title: "My benefits — Library Card Finder" },
      { name: "description", content: "Every benefit unlocked by your saved library cards, side by side." },
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
  library_system_id: string;
  library_system_name: string;
  library_system_slug: string;
  limit_text: string | null;
  notes: string | null;
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
          supabase.from("library_systems").select("id,name,slug").in("id", ids),
          supabase
            .from("library_benefits")
            .select("library_system_id,benefit_id,limit_text,notes")
            .in("library_system_id", ids),
          supabase.from("benefits").select("id,name,category,description"),
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
          library_system_id: sys.id,
          library_system_name: sys.name,
          library_system_slug: sys.slug,
          limit_text: lb.limit_text,
          notes: lb.notes,
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
        Every benefit unlocked by the library cards you've saved, with the per-card limits
        side by side. The more cards you hold, the more you can borrow.
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
        <div className="mt-10 space-y-6">
          {grouped!.map(({ benefit, systems }) => (
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
                <table className="w-full text-sm">
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
                            {s.library_system_name}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {s.limit_text ?? <span className="text-muted-foreground">No limit listed</span>}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {s.notes ?? "—"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}