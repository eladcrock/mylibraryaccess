
DROP POLICY "anyone can submit region requests" ON public.region_requests;

CREATE POLICY "anyone can submit region requests"
ON public.region_requests
FOR INSERT
WITH CHECK (
  char_length(region) BETWEEN 2 AND 200
  AND (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  AND (system_url IS NULL OR system_url ~* '^https?://')
  AND (notes IS NULL OR char_length(notes) <= 2000)
  AND status = 'new'
);
