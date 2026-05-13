import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_PUBLISHABLE_KEY!);
const KEY = process.env.LOVABLE_API_KEY!;

const TRACKED = ["Brainfuse","Consumer Reports","Hoopla","Kanopy","Libby","OverDrive","Library of Things","LinkedIn Learning","Makerspace","3D Printing","Mango Languages","Museum Passes","Discover & Go","New York Times","Rosetta Stone","State Park Pass","Study Rooms","Meeting Rooms","Tutor.com","Wi-Fi Hotspot","Hotspot"];

const { data: systems } = await supabase.from("library_systems").select("id, slug, name, website").order("name");

const allFindings: Record<string, {libraries: string[], category: string, description: string}> = {};

for (const s of systems!) {
  const prompt = `For ${s.name} (${s.website}), list NOTABLE NAMED cardholder benefits/services they offer that are NOT in this already-tracked list: ${TRACKED.join(", ")}.

Focus on distinct, recognizable named services like: Bay Beats, Alexander Street, Pressreader, Flipster, Naxos Music Library, Gale Courses, Universal Class, Creativebug, Craftsy, Indieflix, Ancestry Library, HeritageQuest, JSTOR, Morningstar, Value Line, TumbleBooks, Khan Academy, Wall Street Journal, Washington Post, etc.

Return STRICT JSON: {"services": [{"name": "...", "category": "streaming|ebooks|learning|news|languages|research|career|music|genealogy", "description": "<60 char what it is", "limit_text": "<40 char limit if any, else null"}]}
Only include services you are confident this library actually offers as of 2025. Return up to 15.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-2.5-pro", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" } }),
  });
  if (!res.ok) { console.error(s.slug, await res.text()); continue; }
  const d = await res.json();
  try {
    const j = JSON.parse(d.choices[0].message.content);
    console.log(`\n=== ${s.name} ===`);
    for (const svc of j.services || []) {
      const key = svc.name.toLowerCase().trim();
      if (!allFindings[key]) allFindings[key] = { libraries: [], category: svc.category, description: svc.description };
      allFindings[key].libraries.push(`${s.slug}${svc.limit_text ? ` (${svc.limit_text})` : ""}`);
      console.log(`  - ${svc.name} [${svc.category}] ${svc.limit_text||""}`);
    }
  } catch(e) { console.log(s.slug, "PARSE ERR"); }
}

console.log("\n\n========= AGGREGATE (services offered by 2+ libraries) =========");
const sorted = Object.entries(allFindings).sort((a,b) => b[1].libraries.length - a[1].libraries.length);
for (const [name, info] of sorted) {
  console.log(`\n${name} [${info.category}] - ${info.libraries.length} libs`);
  console.log(`  ${info.description}`);
  console.log(`  ${info.libraries.join(", ")}`);
}

import { writeFileSync } from "node:fs";
writeFileSync("/tmp/discover.json", JSON.stringify(allFindings, null, 2));
