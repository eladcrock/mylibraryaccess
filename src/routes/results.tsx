import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { BookmarkCheck, BookmarkPlus, ExternalLink, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/results")({
  validateSearch: (s: Record<string, unknown>) => ({
    state: typeof s.state === "string" ? s.state : "",
    county: typeof s.county === "string" ? s.county : "",
    resident: s.resident === "1",
    property: s.property === "1",
    student: s.student === "1",
  }),
  head: () => ({
    meta: [
      { title: "Your eligible library cards - Library Card Finder" },
      { name: "description", content: "Library cards you qualify for, based on where you live." },
    ],
  }),
  component: ResultsPage,
});

type System = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  apply_url: string | null;
  fee_cents: number;
  online_signup: boolean;
};

function ResultsPage() {
  const { state, county, resident, property } = Route.useSearch();
  const { user } = useAuth();
  const [systems, setSystems] = useState<System[] | null>(null);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileText, setProfileText] = useState<string>("");

  useEffect(() => {
    (async () => {
      // Naive eligibility: any rule whose scope matches the user's selections
      let q = supabase
        .from("eligibility_rules")
        .select("library_system_id,rule_type,scope_state_id,scope_county_id");
      const { data: rules } = await q;
      const matchedSystemIds = new Set<string>();
      for (const r of rules ?? []) {
        if (r.rule_type === "us_resident") matchedSystemIds.add(r.library_system_id);
        if (r.rule_type === "resident_of_state" && r.scope_state_id === state)
          matchedSystemIds.add(r.library_system_id);
        if (r.rule_type === "resident_of_county" && resident && r.scope_county_id === county)
          matchedSystemIds.add(r.library_system_id);
        if (r.rule_type === "property_owner" && property && r.scope_county_id === county)
          matchedSystemIds.add(r.library_system_id);
        if (r.rule_type === "reciprocal" && r.scope_state_id === state)
          matchedSystemIds.add(r.library_system_id);
      }
      const ids = Array.from(matchedSystemIds);
      if (ids.length === 0) {
        setSystems([]);
        return;
      }
      const { data: sys } = await supabase
        .from("library_systems")
        .select("id,name,slug,description,apply_url,fee_cents,online_signup")
        .in("id", ids)
        .order("name");
      setSystems(sys ?? []);
    })();
  }, [state, county, resident, property]);

  useEffect(() => {
    if (!user) {
      setFavIds(new Set());
      return;
    }
    supabase
      .from("favorites")
      .select("library_system_id")
      .eq("user_id", user.id)
      .then(({ data }) => setFavIds(new Set((data ?? []).map((f) => f.library_system_id))));
  }, [user]);

  useEffect(() => {
    if (!user) {
      setHasProfile(false);
      setProfileText("");
      return;
    }
    supabase
      .from("applicant_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setHasProfile(false);
          return;
        }
        setHasProfile(true);
        const lines: string[] = [];
        const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");
        if (fullName) lines.push(`Name: ${fullName}`);
        if (data.date_of_birth) lines.push(`Date of birth: ${data.date_of_birth}`);
        if (data.email) lines.push(`Email: ${data.email}`);
        if (data.phone) lines.push(`Phone: ${data.phone}`);
        const addr = [
          data.address_line1,
          data.address_line2,
          [data.city, data.state, data.postal_code].filter(Boolean).join(", "),
        ].filter(Boolean).join("\n");
        if (addr) lines.push(`Address:\n${addr}`);
        setProfileText(lines.join("\n"));
      });
  }, [user]);

  async function quickApply(url: string) {
    try {
      await navigator.clipboard.writeText(profileText);
      toast.success("Your info is copied. Paste into the library form.");
    } catch {
      toast.message("Opening application", {
        description: "Couldn't copy to clipboard automatically — copy from your profile page.",
      });
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function toggleFavorite(systemId: string) {
    if (!user) return;
    setSavingId(systemId);
    const isFav = favIds.has(systemId);
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("library_system_id", systemId);
      setFavIds((prev) => {
        const next = new Set(prev);
        next.delete(systemId);
        return next;
      });
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, library_system_id: systemId });
      setFavIds((prev) => new Set(prev).add(systemId));
    }
    setSavingId(null);
  }

  if (!systems) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <h1 className="font-display text-3xl text-foreground sm:text-4xl">
        Your eligible library cards
      </h1>
      <p className="mt-3 text-muted-foreground">
        {systems.length} card{systems.length === 1 ? "" : "s"} match your answers.{" "}
        {user ? (
          <>Save the ones you have to view them on <Link to="/my-benefits" className="text-accent underline">My benefits</Link>.</>
        ) : (
          <>
            <Link to="/login" search={{ redirect: "/my-benefits", mode: "signin" }} className="text-accent underline">
              Sign in
            </Link>{" "}
            to save your cards and see all benefits in one place.
          </>
        )}
      </p>

      {systems.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-paper/40 p-8 text-center">
          <p className="text-muted-foreground">
            We don't have data for that area yet.{" "}
            <Link to="/request-region" className="text-accent underline">Request this region</Link>.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {systems.map((s) => {
            const isFav = favIds.has(s.id);
            return (
              <li key={s.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-xl text-foreground">{s.name}</h3>
                    {s.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {s.fee_cents > 0 ? `Fee: $${(s.fee_cents / 100).toFixed(0)}` : "Free"} ·{" "}
                      {s.online_signup ? "Online signup" : "In-person signup"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {s.apply_url ? (
                      hasProfile && profileText ? (
                        <button
                          type="button"
                          onClick={() => quickApply(s.apply_url!)}
                          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                        >
                          <Zap className="h-3.5 w-3.5" /> Quick apply
                        </button>
                      ) : (
                        <a
                          href={s.apply_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                        >
                          Apply <ExternalLink className="h-3 w-3" />
                        </a>
                      )
                    ) : null}
                    {user ? (
                      <Button
                        type="button"
                        variant={isFav ? "secondary" : "outline"}
                        size="sm"
                        disabled={savingId === s.id}
                        onClick={() => toggleFavorite(s.id)}
                      >
                        {isFav ? (
                          <><BookmarkCheck className="mr-1 h-4 w-4" /> Saved</>
                        ) : (
                          <><BookmarkPlus className="mr-1 h-4 w-4" /> Save</>
                        )}
                      </Button>
                    ) : (
                      <Link
                        to="/login"
                        search={{ redirect: "/results", mode: "signin" }}
                        className="inline-flex items-center gap-1 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent/10"
                      >
                        <BookmarkPlus className="h-4 w-4" /> Sign in to save
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}