import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({
    meta: [
      { title: "My library wallet - Library Card Finder" },
      {
        name: "description",
        content: "Store your library card numbers and PINs in one place for quick reference.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WalletPage,
});

type LibrarySystem = { id: string; name: string };

type Card = {
  id: string;
  library_system_id: string | null;
  custom_label: string | null;
  card_number: string;
  pin: string | null;
  notes: string | null;
  library?: LibrarySystem | null;
};

type FormState = {
  library_system_id: string;
  custom_label: string;
  card_number: string;
  pin: string;
  notes: string;
};

const emptyForm: FormState = {
  library_system_id: "",
  custom_label: "",
  card_number: "",
  pin: "",
  notes: "",
};

function WalletPage() {
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [libraries, setLibraries] = useState<LibrarySystem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [cardsRes, libsRes] = await Promise.all([
        supabase
          .from("library_cards")
          .select("id, library_system_id, custom_label, card_number, pin, notes")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("library_systems").select("id, name").order("name"),
      ]);
      if (cancelled) return;
      const libs = (libsRes.data ?? []) as LibrarySystem[];
      const libMap = new Map(libs.map((l) => [l.id, l]));
      if (cardsRes.error) toast.error(cardsRes.error.message);
      else
        setCards(
          (cardsRes.data ?? []).map((c) => ({
            ...(c as Card),
            library: c.library_system_id ? libMap.get(c.library_system_id) ?? null : null,
          })),
        );
      setLibraries(libs);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(card: Card) {
    setEditingId(card.id);
    setForm({
      library_system_id: card.library_system_id ?? "",
      custom_label: card.custom_label ?? "",
      card_number: card.card_number,
      pin: card.pin ?? "",
      notes: card.notes ?? "",
    });
    setDialogOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.card_number.trim()) {
      toast.error("Card number is required.");
      return;
    }
    if (!form.library_system_id && !form.custom_label.trim()) {
      toast.error("Pick a library or add a custom label.");
      return;
    }
    setSaving(true);
    const payload = {
      user_id: user.id,
      library_system_id: form.library_system_id || null,
      custom_label: form.custom_label.trim() || null,
      card_number: form.card_number.trim(),
      pin: form.pin.trim() || null,
      notes: form.notes.trim() || null,
    };
    const libMap = new Map(libraries.map((l) => [l.id, l]));
    function withLib(c: Card): Card {
      return { ...c, library: c.library_system_id ? libMap.get(c.library_system_id) ?? null : null };
    }
    if (editingId) {
      const { data, error } = await supabase
        .from("library_cards")
        .update(payload)
        .eq("id", editingId)
        .select("id, library_system_id, custom_label, card_number, pin, notes")
        .single();
      setSaving(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      setCards((prev) => prev.map((c) => (c.id === editingId ? withLib(data as Card) : c)));
      toast.success("Card updated.");
    } else {
      const { data, error } = await supabase
        .from("library_cards")
        .insert(payload)
        .select("id, library_system_id, custom_label, card_number, pin, notes")
        .single();
      setSaving(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      setCards((prev) => [withLib(data as Card), ...prev]);
      toast.success("Card saved.");
    }
    setDialogOpen(false);
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this card from your wallet?")) return;
    const { error } = await supabase.from("library_cards").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setCards((prev) => prev.filter((c) => c.id !== id));
    toast.success("Card deleted.");
  }

  if (!loaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-accent">Personal</p>
          <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
            My library wallet
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Keep your library card numbers and PINs in one place. Numbers and PINs are
            hidden by default; tap the eye icon to reveal. Visible only to you.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}>
              <Plus className="mr-1 h-4 w-4" /> Add card
            </Button>
          </DialogTrigger>
          <CardDialog
            form={form}
            setForm={setForm}
            libraries={libraries}
            saving={saving}
            editing={!!editingId}
            onSubmit={onSubmit}
          />
        </Dialog>
      </div>

      <div className="mt-8">
        {cards.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <Wallet className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-medium text-foreground">No cards saved yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first library card to keep its number and PIN handy.
            </p>
            <Button className="mt-4" onClick={openAdd}>
              <Plus className="mr-1 h-4 w-4" /> Add your first card
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {cards.map((c) => (
              <CardRow key={c.id} card={c} onEdit={() => openEdit(c)} onDelete={() => onDelete(c.id)} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CardRow({
  card,
  onEdit,
  onDelete,
}: {
  card: Card;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showNumber, setShowNumber] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const title = card.library?.name || card.custom_label || "Library card";

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied.`);
    } catch {
      toast.error("Copy failed.");
    }
  }

  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="font-medium text-foreground">{title}</h2>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit} aria-label="Edit card">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            aria-label="Delete card"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SecretField
          label="Card number"
          value={card.card_number}
          shown={showNumber}
          onToggle={() => setShowNumber((v) => !v)}
          onCopy={() => copy(card.card_number, "Card number")}
        />
        {card.pin ? (
          <SecretField
            label="PIN"
            value={card.pin}
            shown={showPin}
            onToggle={() => setShowPin((v) => !v)}
            onCopy={() => copy(card.pin!, "PIN")}
          />
        ) : null}
      </div>
      {card.notes ? (
        <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{card.notes}</p>
      ) : null}
    </li>
  );
}

function SecretField({
  label,
  value,
  shown,
  onToggle,
  onCopy,
}: {
  label: string;
  value: string;
  shown: boolean;
  onToggle: () => void;
  onCopy: () => void;
}) {
  const masked = useMemo(() => "•".repeat(Math.max(4, Math.min(value.length, 16))), [value]);
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-1">
        <code className="flex-1 rounded-md bg-muted px-2 py-1.5 font-mono text-sm">
          {shown ? value : masked}
        </code>
        <Button size="sm" variant="ghost" onClick={onToggle} aria-label={shown ? "Hide" : "Show"}>
          {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCopy} aria-label={`Copy ${label}`}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function CardDialog({
  form,
  setForm,
  libraries,
  saving,
  editing,
  onSubmit,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  libraries: LibrarySystem[];
  saving: boolean;
  editing: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{editing ? "Edit card" : "Add a card"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label>Library</Label>
          <Select
            value={form.library_system_id || "__custom__"}
            onValueChange={(v) =>
              update("library_system_id", v === "__custom__" ? "" : v)
            }
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Pick a library" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__custom__">Other (use a custom label)</SelectItem>
              {libraries.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {!form.library_system_id ? (
          <div>
            <Label htmlFor="custom_label">Custom label</Label>
            <Input
              id="custom_label"
              value={form.custom_label}
              onChange={(e) => update("custom_label", e.target.value)}
              placeholder="e.g. Hometown Library"
              className="mt-1.5"
            />
          </div>
        ) : null}
        <div>
          <Label htmlFor="card_number">Card number</Label>
          <Input
            id="card_number"
            value={form.card_number}
            onChange={(e) => update("card_number", e.target.value)}
            className="mt-1.5"
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="pin">PIN (optional)</Label>
          <Input
            id="pin"
            value={form.pin}
            onChange={(e) => update("pin", e.target.value)}
            className="mt-1.5"
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            className="mt-1.5"
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add card"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}