import { writeFileSync } from "node:fs";

const KEY = process.env.LOVABLE_API_KEY!;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

import { createClient } from "@supabase/supabase-js";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BENEFITS = [
  { slug: "brainfuse", name: "Brainfuse HelpNow (online tutoring/homework help)" },
  { slug: "consumer-reports", name: "Consumer Reports digital access" },
  { slug: "hoopla", name: "Hoopla (digital movies/music/books)" },
  { slug: "kanopy", name: "Kanopy (streaming films)" },
  { slug: "libby", name: "Libby / OverDrive (ebooks/audiobooks)" },
  { slug: "library-of-things", name: "Library of Things (non-book lending: tools, instruments, telescopes, GoPros, kitchen gear, games, etc.)" },
  { slug: "linkedin-learning", name: "LinkedIn Learning" },
  { slug: "makerspace", name: "Makerspace / 3D printing / media lab / sewing / recording studio" },
  { slug: "mango", name: "Mango Languages" },
  { slug: "museum-passes", name: "Discover & Go or museum/cultural passes" },
  { slug: "nyt", name: "New York Times digital access" },
  { slug: "rosetta-stone", name: "Rosetta Stone language learning" },
  { slug: "state-park-pass", name: "California State Park pass / Discover & Go state parks" },
  { slug: "study-meeting-rooms", name: "Bookable study rooms or meeting rooms" },
  { slug: "tutor-com", name: "Tutor.com online tutoring" },
  { slug: "hotspot-lending", name: "Wi-Fi hotspot lending" },
];

async function audit(systemName: string, website: string) {
  const list = BENEFITS.map(b => `- ${b.slug}: ${b.name}`).join("\n");
  const prompt = `You are auditing ${systemName} (${website}) for which of these patron benefits they currently offer.

Benefits to check:
${list}

For EACH benefit, decide present (true/false) based on what this library system actually offers to cardholders as of 2025. Be accurate; do not guess. If you are unsure, set present=false.

Return STRICT JSON: { "findings": [{ "slug": "...", "present": boolean, "limit_text": string|null }] }
- limit_text: short specific note (<=80 chars), e.g. "10 plays/month" for Kanopy, "Octavia Lab + Memory Lab" for makerspace, "Tool Lending Library" for library-of-things. null if generic.
Include all ${BENEFITS.length} slugs.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) { console.error(await res.text()); return []; }
  const data = await res.json();
  try { return JSON.parse(data.choices[0].message.content).findings ?? []; }
  catch { return []; }
}

async function main() {
  const onlySlugs = process.argv.slice(2);
  const { data: systems } = await supabase.from("library_systems").select("id, slug, name, website").order("name");
  const targets = onlySlugs.length ? systems!.filter(s => onlySlugs.includes(s.slug)) : systems!;
  const { data: benefits } = await supabase.from("benefits").select("id, slug");
  const benefitIdBySlug = new Map(benefits!.map(b => [b.slug, b.id]));

  const lines: string[] = [`# Full library benefits audit — ${new Date().toISOString()}`, ""];
  const sqlInserts: string[] = [];

  for (const sys of targets) {
    console.log(`\n→ ${sys.name}`);
    lines.push(`## ${sys.name} (${sys.slug})`, "");
    const findings = await audit(sys.name, sys.website || "");
    const { data: existing } = await supabase.from("library_benefits").select("benefit_id, limit_text").eq("library_system_id", sys.id);
    const existingMap = new Map(existing!.map(e => [e.benefit_id, e.limit_text]));

    for (const f of findings) {
      const bid = benefitIdBySlug.get(f.slug);
      if (!bid) continue;
      const has = existingMap.has(bid);
      let mark = "";
      if (f.present && !has) {
        mark = "🟢 NEW (not in DB)";
        const lt = f.limit_text ? `'${f.limit_text.replace(/'/g, "''")}'` : "NULL";
        sqlInserts.push(`INSERT INTO library_benefits (library_system_id, benefit_id, limit_text) VALUES ('${sys.id}', '${bid}', ${lt});`);
      } else if (!f.present && has) mark = "🟡 in DB but AI says absent";
      else if (f.present && has) mark = "✅";
      else mark = "⚪";
      lines.push(`- **${f.slug}** ${mark}${f.limit_text ? ` — ${f.limit_text}` : ""}`);
    }
    lines.push("");
  }

  writeFileSync("/tmp/audit-full.md", lines.join("\n"));
  writeFileSync("/tmp/audit-inserts.sql", sqlInserts.join("\n"));
  console.log(`\nWrote /tmp/audit-full.md and /tmp/audit-inserts.sql (${sqlInserts.length} new rows)`);
}
main();
