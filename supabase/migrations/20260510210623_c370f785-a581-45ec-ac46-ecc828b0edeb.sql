
CREATE TYPE public.region_request_status AS ENUM ('new', 'reviewed', 'added', 'rejected');

CREATE TABLE public.region_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region text NOT NULL,
  system_name text,
  system_url text,
  email text,
  notes text,
  status public.region_request_status NOT NULL DEFAULT 'new',
  source_ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT region_length CHECK (char_length(region) BETWEEN 2 AND 200),
  CONSTRAINT system_name_length CHECK (system_name IS NULL OR char_length(system_name) <= 200),
  CONSTRAINT system_url_length CHECK (system_url IS NULL OR char_length(system_url) <= 500),
  CONSTRAINT email_length CHECK (email IS NULL OR char_length(email) <= 320),
  CONSTRAINT notes_length CHECK (notes IS NULL OR char_length(notes) <= 2000)
);

ALTER TABLE public.region_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit region requests"
ON public.region_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "admins read region requests"
ON public.region_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update region requests"
ON public.region_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER region_requests_touch_updated_at
BEFORE UPDATE ON public.region_requests
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_region_requests_status_created ON public.region_requests (status, created_at DESC);
