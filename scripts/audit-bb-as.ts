import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_PUBLISHABLE_KEY!);
const KEY = process.env.LOVABLE_API_KEY!;

const { data: systems } = await supabase.from("library_systems").select("id, slug, name, website").order("name");

for (const s of systems!) {
  const prompt = `For ${s.name} (${s.website}), do they offer cardholder access to:
1. "Bay Beats" - SFPL's free local Bay Area music streaming/download collection
2. "Alexander Street" - streaming video/music databases (e.g. Academic Video Online, Music Online, Filmakers Library Online, Counseling & Therapy in Video, etc.)

Return STRICT JSON: {"bay_beats": boolean, "bay_beats_note": string|null, "alexander_street": boolean, "alexander_street_note": string|null}
Only true if you are confident. For Alexander Street, note which specific collection(s) if known.`;
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-2.5-pro", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" } }),
  });
  const d = await res.json();
  try {
    const j = JSON.parse(d.choices[0].message.content);
    console.log(`${s.slug.padEnd(28)} BB:${j.bay_beats?"✓":"·"} ${(j.bay_beats_note||"").slice(0,40).padEnd(42)} AS:${j.alexander_street?"✓":"·"} ${(j.alexander_street_note||"").slice(0,60)}`);
  } catch { console.log(`${s.slug} ERR`); }
}
