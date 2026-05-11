import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitRegionRequest } from "@/lib/region-requests.functions";

export const Route = createFileRoute("/request-region")({
  head: () => ({
    meta: [
      { title: "Request a library region - Library Card Finder" },
      {
        name: "description",
        content:
          "Don't see your county or city yet? Tell us which library system to add next.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RequestRegionPage,
});

function RequestRegionPage() {
  const submit = useServerFn(submitRegionRequest);
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("submitting");
    setErrorMsg(null);
    try {
      await submit({
        data: {
          region: String(fd.get("region") ?? ""),
          systemName: String(fd.get("systemName") ?? ""),
          systemUrl: String(fd.get("systemUrl") ?? ""),
          email: String(fd.get("email") ?? ""),
          notes: String(fd.get("notes") ?? ""),
          website: String(fd.get("website") ?? ""),
        },
      });
      setStatus("ok");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  }

  if (status === "ok") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
        <h1 className="mt-4 font-display text-3xl text-foreground">Thanks - request received</h1>
        <p className="mt-3 text-muted-foreground">
          We'll review your suggestion and add it to our roadmap. If you left an email,
          we'll let you know once the region is live.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="flex items-center gap-2 text-sm text-accent">
        <MapPin className="h-4 w-4" />
        <span>Help us grow</span>
      </div>
      <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
        Request a library region
      </h1>
      <p className="mt-3 text-muted-foreground">
        We're starting with California and expanding nationwide. Tell us which county,
        city, or specific library system you'd like us to add - the more detail, the better.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="region">Region <span className="text-destructive">*</span></Label>
          <Input
            id="region"
            name="region"
            required
            maxLength={200}
            placeholder="e.g. Travis County, TX or Brooklyn, NY"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="systemName">Library system (optional)</Label>
          <Input
            id="systemName"
            name="systemName"
            maxLength={200}
            placeholder="e.g. Austin Public Library"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="systemUrl">Website (optional)</Label>
          <Input
            id="systemUrl"
            name="systemUrl"
            type="url"
            maxLength={500}
            placeholder="https://library.austintexas.gov"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="email">Your email (optional)</Label>
          <Input
            id="email"
            name="email"
            type="email"
            maxLength={320}
            placeholder="So we can let you know when it's live"
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            We only use it to notify you about this request.
          </p>
        </div>

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            name="notes"
            maxLength={2000}
            rows={4}
            placeholder="Anything special about eligibility, fees, reciprocity, etc."
            className="mt-1.5"
          />
        </div>

        {/* Honeypot */}
        <div className="hidden" aria-hidden="true">
          <label>
            Leave this field empty
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {errorMsg ? (
          <p className="text-sm text-destructive">{errorMsg}</p>
        ) : null}

        <Button type="submit" disabled={status === "submitting"} className="w-full sm:w-auto">
          {status === "submitting" ? "Sending…" : "Submit request"}
        </Button>
      </form>
    </div>
  );
}