import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Application profile - Library Card Finder" },
      {
        name: "description",
        content: "Save your applicant info once for one-tap Quick apply on every library card.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

type Profile = {
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  date_of_birth: string;
  email: string;
  phone: string;
};

const empty: Profile = {
  first_name: "",
  last_name: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  date_of_birth: "",
  email: "",
  phone: "",
};

function ProfilePage() {
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<Profile>(empty);
  const [hasSaved, setHasSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("applicant_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile({
            first_name: data.first_name ?? "",
            last_name: data.last_name ?? "",
            address_line1: data.address_line1 ?? "",
            address_line2: data.address_line2 ?? "",
            city: data.city ?? "",
            state: data.state ?? "",
            postal_code: data.postal_code ?? "",
            date_of_birth: data.date_of_birth ?? "",
            email: data.email ?? user.email ?? "",
            phone: data.phone ?? "",
          });
          setHasSaved(true);
        } else {
          setProfile((p) => ({ ...p, email: user.email ?? "" }));
        }
        setLoaded(true);
      });
  }, [user]);

  function update<K extends keyof Profile>(k: K, v: Profile[K]) {
    setProfile((p) => ({ ...p, [k]: v }));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      ...profile,
      date_of_birth: profile.date_of_birth || null,
    };
    const { error } = await supabase
      .from("applicant_profiles")
      .upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setHasSaved(true);
    toast.success("Profile saved. Quick apply is now enabled.");
  }

  async function onDelete() {
    if (!user) return;
    if (!confirm("Delete your saved applicant info? This can't be undone.")) return;
    const { error } = await supabase
      .from("applicant_profiles")
      .delete()
      .eq("user_id", user.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setProfile({ ...empty, email: user.email ?? "" });
    setHasSaved(false);
    toast.success("Profile deleted.");
  }

  if (!loaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <p className="text-sm uppercase tracking-wide text-accent">Optional</p>
      <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
        Application profile
      </h1>
      <p className="mt-3 text-muted-foreground">
        Save your info once and we'll enable <strong>Quick apply</strong> on every card. When
        you click it, we open the library's signup page and copy your details to your
        clipboard so you can paste straight into their form. Your info stays private to your
        account and is only sent to libraries when you paste it yourself.
      </p>

      <form onSubmit={onSave} className="mt-8 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="first_name">First name</Label>
            <Input id="first_name" value={profile.first_name} onChange={(e) => update("first_name", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="last_name">Last name</Label>
            <Input id="last_name" value={profile.last_name} onChange={(e) => update("last_name", e.target.value)} className="mt-1.5" />
          </div>
        </div>

        <div>
          <Label htmlFor="address_line1">Address</Label>
          <Input id="address_line1" value={profile.address_line1} onChange={(e) => update("address_line1", e.target.value)} className="mt-1.5" placeholder="Street address" />
          <Input value={profile.address_line2} onChange={(e) => update("address_line2", e.target.value)} className="mt-2" placeholder="Apt, suite, etc. (optional)" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={profile.city} onChange={(e) => update("city", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" value={profile.state} onChange={(e) => update("state", e.target.value)} className="mt-1.5" placeholder="CA" maxLength={2} />
          </div>
          <div>
            <Label htmlFor="postal_code">ZIP</Label>
            <Input id="postal_code" value={profile.postal_code} onChange={(e) => update("postal_code", e.target.value)} className="mt-1.5" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="date_of_birth">Date of birth</Label>
            <Input id="date_of_birth" type="date" value={profile.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" value={profile.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1.5" />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={profile.email} onChange={(e) => update("email", e.target.value)} className="mt-1.5" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : hasSaved ? "Update profile" : "Save profile"}
            </Button>
            <Link
              to="/my-benefits"
              className="inline-flex items-center rounded-md border border-input px-4 py-2 text-sm hover:bg-accent/10"
            >
              Back to my benefits
            </Link>
          </div>
          {hasSaved ? (
            <Button type="button" variant="ghost" onClick={onDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}