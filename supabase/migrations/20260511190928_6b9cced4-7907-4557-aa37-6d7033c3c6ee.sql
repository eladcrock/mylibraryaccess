-- Add per-card URL for each library benefit
ALTER TABLE public.library_benefits
ADD COLUMN IF NOT EXISTS url text;

-- Backfill: extract the first http(s) URL from existing notes
UPDATE public.library_benefits
SET url = (regexp_match(notes, 'https?://[^\s)]+'))[1]
WHERE url IS NULL
  AND notes ~ 'https?://';