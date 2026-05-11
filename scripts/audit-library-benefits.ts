/**
 * Audit non-book benefits for each library system.
 *
 * Usage:
 *   bun scripts/audit-library-benefits.ts                    # all systems
 *   bun scripts/audit-library-benefits.ts oakland berkeley   # specific slugs
 *
 * Requires env: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, LOVABLE_API_KEY
 *
 * For each library system, fetches the site, asks Gemini to extract
 * non-book offerings (Library of Things, makerspace, 3D printing, study/meeting
 * rooms, hotspot lending, tool lending, etc.), and prints a diff vs. the
 * benefits we already have stored.
 *
 * Output: /tmp/library-benefits-audit.md
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}
if (!LOVABLE_API_KEY) {
  console.error("Missing LOVABLE_API_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TRACKED_SLUGS = [
  "library-of-things",
  "makerspace",
  "study-meeting-rooms",
  "hotspot-lending",
] as const;

type Finding = {
  benefit_slug: (typeof TRACKED_SLUGS)[number];
  present: boolean;
  description: string;
  source_url: string | null;
};

async function fetchSiteText(url: string): Promise<string> {
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return "";
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 12000);
  } catch {
    return "";
  }
}

async function askAI(systemName: string, website: string, pageText: string): Promise<Finding[]> {
  const prompt = `You are auditing the website for ${systemName} (${website}).

From the page text below, decide whether the library appears to offer each benefit.
Return STRICT JSON: { "findings": Finding[] } where Finding =
  { "benefit_slug": "library-of-things"|"makerspace"|"study-meeting-rooms"|"hotspot-lending",
    "present": boolean,
    "description": string (<= 120 chars; concise specifics),
    "source_url": string|null (best matching page on the library site) }.

Definitions:
- library-of-things: borrowing non-book items (sewing machines, tools, telescopes, instruments, kitchen gear, board games, etc.). Tool Lending Library counts.
- makerspace: 3D printing, laser cutting, sewing machines on-site, recording studio, media lab, innovation lab, MakerSpace, Octavia Lab, IDEA Lab, etc.
- study-meeting-rooms: bookable study rooms or meeting rooms inside branches.
- hotspot-lending: mobile Wi-Fi hotspot lending.

If the page doesn't mention something but the library plausibly has it, set present=false.

PAGE TEXT:
${pageText}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    console.error(`  AI call failed: ${res.status} ${await res.text()}`);
    return [];
  }
  const data = await res.json();
  try {
    const parsed = JSON.parse(data.choices[0].message.content);
    return parsed.findings ?? [];
  } catch {
    return [];
  }
}

async function main() {
  const onlySlugs = process.argv.slice(2);

  const { data: systems } = await supabase
    .from("library_systems")
    .select("id, slug, name, website")
    .order("name");
  if (!systems) {
    console.error("Failed to load library systems");
    return;
  }

  const targets = onlySlugs.length
    ? systems.filter((s) => onlySlugs.includes(s.slug))
    : systems;

  const { data: benefits } = await supabase
    .from("benefits")
    .select("id, slug")
    .in("slug", TRACKED_SLUGS as unknown as string[]);
  const benefitIdBySlug = new Map((benefits ?? []).map((b) => [b.slug, b.id]));

  const lines: string[] = [`# Library benefits audit — ${new Date().toISOString()}`, ""];

  for (const sys of targets) {
    if (!sys.website) continue;
    console.log(`\n→ ${sys.name}`);
    lines.push(`## ${sys.name}`, `Website: ${sys.website}`, "");

    const text = await fetchSiteText(sys.website);
    if (!text) {
      lines.push("- ⚠️ Could not fetch site", "");
      continue;
    }

    const findings = await askAI(sys.name, sys.website, text);

    const { data: existing } = await supabase
      .from("library_benefits")
      .select("benefit_id, limit_text, notes")
      .eq("library_system_id", sys.id);
    const existingBenefitIds = new Set((existing ?? []).map((e) => e.benefit_id));

    for (const f of findings) {
      const ben = benefitIdBySlug.get(f.benefit_slug);
      if (!ben) continue;
      const has = existingBenefitIds.has(ben);
      let mark = "";
      if (f.present && !has) mark = "🟢 NEW";
      else if (!f.present && has) mark = "🟡 NOT FOUND on site (we have it)";
      else if (f.present && has) mark = "✅ confirmed";
      else mark = "⚪ neither";
      lines.push(`- **${f.benefit_slug}** ${mark} — ${f.description}${f.source_url ? ` (${f.source_url})` : ""}`);
    }
    lines.push("");
  }

  const out = "/tmp/library-benefits-audit.md";
  writeFileSync(out, lines.join("\n"));
  console.log(`\nWrote ${out}`);
}

main();