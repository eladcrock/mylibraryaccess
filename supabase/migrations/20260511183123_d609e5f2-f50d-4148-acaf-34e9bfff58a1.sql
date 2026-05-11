CREATE TABLE public.applicant_profiles (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  date_of_birth DATE,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.applicant_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own applicant profile"
  ON public.applicant_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users insert own applicant profile"
  ON public.applicant_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users update own applicant profile"
  ON public.applicant_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users delete own applicant profile"
  ON public.applicant_profiles FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER applicant_profiles_touch
  BEFORE UPDATE ON public.applicant_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();