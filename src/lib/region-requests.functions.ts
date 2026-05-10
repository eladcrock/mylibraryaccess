import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createHash } from "crypto";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  region: z.string().trim().min(2, "Tell us the region").max(200),
  systemName: z.string().trim().max(200).optional().or(z.literal("")),
  systemUrl: z
    .string()
    .trim()
    .max(500)
    .url("Must be a valid URL starting with http(s)://")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(320)
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  // honeypot — must be empty
  website: z.string().max(0).optional().or(z.literal("")),
});

export const submitRegionRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    if (data.website && data.website.length > 0) {
      // Silently succeed for bots
      return { ok: true };
    }

    const ip =
      getRequestHeader("cf-connecting-ip") ||
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const ipHash = createHash("sha256")
      .update(`${ip}:${process.env.SUPABASE_PROJECT_ID ?? "lcf"}`)
      .digest("hex");

    const { error } = await supabase.from("region_requests").insert({
      region: data.region,
      system_name: data.systemName || null,
      system_url: data.systemUrl || null,
      email: data.email || null,
      notes: data.notes || null,
      source_ip_hash: ipHash,
    });

    if (error) {
      console.error("submitRegionRequest insert failed", error);
      throw new Error("Could not save your request. Please try again.");
    }

    return { ok: true };
  });