import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/get-started")({
  head: () => ({
    meta: [
      { title: "Find my library cards — Library Card Finder" },
      {
        name: "description",
        content: "Answer a few quick questions and see every public library card you qualify for.",
      },
    ],
  }),
  component: GetStartedPage,
});

type State = { id: string; name: string; code: string };
type County = { id: string; name: string; state_id: string };

function GetStartedPage() {
  const navigate = useNavigate();
  const [states, setStates] = useState<State[] | null>(null);
  const [counties, setCounties] = useState<County[]>([]);
  const [stateId, setStateId] = useState<string | undefined>(undefined);
  const [countyId, setCountyId] = useState<string | undefined>(undefined);
  const [resident, setResident] = useState(true);
  const [propertyOwner, setPropertyOwner] = useState(false);
  const [student, setStudent] = useState(false);
  const [loadingCounties, setLoadingCounties] = useState(false);

  useEffect(() => {
    supabase.from("states").select("id,name,code").order("name").then(({ data }) => {
      setStates(data ?? []);
      const ca = (data ?? []).find((s) => s.code === "CA");
      if (ca) setStateId(ca.id);
    });
  }, []);

  useEffect(() => {
    if (!stateId) {
      setCounties([]);
      return;
    }
    setLoadingCounties(true);
    supabase
      .from("counties")
      .select("id,name,state_id")
      .eq("state_id", stateId)
      .order("name")
      .then(({ data }) => {
        setCounties(data ?? []);
        setLoadingCounties(false);
      });
  }, [stateId]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (stateId) params.set("state", stateId);
    if (countyId) params.set("county", countyId);
    if (resident) params.set("resident", "1");
    if (propertyOwner) params.set("property", "1");
    if (student) params.set("student", "1");
    navigate({
      to: "/results",
      search: {
        state: stateId ?? "",
        county: countyId ?? "",
        resident,
        property: propertyOwner,
        student,
      },
    });
  }

  if (!states) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:py-16">
      <p className="text-sm uppercase tracking-wide text-accent">Step 1 of 1</p>
      <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
        Find my library cards
      </h1>
      <p className="mt-3 text-muted-foreground">
        Tell us where you live and a few quick details. We'll list every public library card
        you qualify for, plus the benefits each one unlocks.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div>
          <Label>State</Label>
          <Select value={stateId} onValueChange={(v) => { setStateId(v); setCountyId(undefined); }}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose a state" /></SelectTrigger>
            <SelectContent>
              {states.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {states.length === 1 ? (
            <p className="mt-1.5 text-xs text-muted-foreground">
              We're starting with California.{" "}
              <Link to="/request-region" className="underline">Request another region</Link>.
            </p>
          ) : null}
        </div>

        <div>
          <Label>County</Label>
          <Select value={countyId} onValueChange={setCountyId} disabled={!stateId || loadingCounties}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder={loadingCounties ? "Loading…" : "Choose a county"} />
            </SelectTrigger>
            <SelectContent>
              {counties.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <fieldset className="space-y-3 rounded-lg border border-border bg-paper/40 p-4">
          <legend className="px-1 text-sm font-medium text-foreground">Anything else?</legend>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={resident} onCheckedChange={(v) => setResident(v === true)} />
            <span>I live in this county</span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={propertyOwner} onCheckedChange={(v) => setPropertyOwner(v === true)} />
            <span>I own property here (some libraries grant cards to owners)</span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={student} onCheckedChange={(v) => setStudent(v === true)} />
            <span>I attend school or work here</span>
          </label>
        </fieldset>

        <Button type="submit" className="w-full sm:w-auto" disabled={!stateId}>
          See my eligible cards
        </Button>
      </form>
    </div>
  );
}