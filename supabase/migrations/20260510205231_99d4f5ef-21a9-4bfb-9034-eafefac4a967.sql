
-- Fix search_path on touch_updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Lock down SECURITY DEFINER functions: revoke from anon/authenticated, keep for postgres + service_role
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
-- has_role is intentionally callable by authenticated (used in RLS via auth.uid()); RLS evaluates as definer anyway
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Tighten suggested_corrections insert: must reference a real library row
DROP POLICY IF EXISTS "anyone can submit corrections" ON public.suggested_corrections;
CREATE POLICY "submit corrections for real libraries"
ON public.suggested_corrections
FOR INSERT
WITH CHECK (
  library_system_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.library_systems ls WHERE ls.id = library_system_id)
  AND length(suggested_value) > 0 AND length(suggested_value) <= 2000
  AND length(field) > 0 AND length(field) <= 100
);
