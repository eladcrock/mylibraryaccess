
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.jurisdiction_type AS ENUM ('city', 'county', 'consortium', 'state');
CREATE TYPE public.rule_type AS ENUM (
  'resident_of_county',
  'resident_of_city',
  'resident_of_state',
  'us_resident',
  'property_owner',
  'student',
  'educator',
  'employee',
  'reciprocal',
  'paid_nonresident'
);
CREATE TYPE public.benefit_category AS ENUM (
  'streaming','ebooks','audiobooks','learning','news','museum','languages','career','makerspace','research','music'
);
CREATE TYPE public.correction_status AS ENUM ('pending','accepted','rejected');
CREATE TYPE public.scrape_status AS ENUM ('queued','running','succeeded','failed');

-- Geography
CREATE TABLE public.states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE public.counties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES public.states(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fips TEXT,
  UNIQUE(state_id, name)
);
CREATE INDEX idx_counties_state ON public.counties(state_id);

-- Library systems
CREATE TABLE public.library_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  jurisdiction_type public.jurisdiction_type NOT NULL,
  primary_state_id UUID REFERENCES public.states(id),
  primary_county_id UUID REFERENCES public.counties(id),
  primary_city TEXT,
  website TEXT,
  apply_url TEXT,
  online_signup BOOLEAN NOT NULL DEFAULT false,
  fee_cents INTEGER NOT NULL DEFAULT 0,
  fee_notes TEXT,
  description TEXT,
  highlights TEXT,
  last_verified_at TIMESTAMPTZ,
  confidence_score INTEGER NOT NULL DEFAULT 80,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_library_systems_state ON public.library_systems(primary_state_id);
CREATE INDEX idx_library_systems_county ON public.library_systems(primary_county_id);

-- Eligibility rules
CREATE TABLE public.eligibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_system_id UUID NOT NULL REFERENCES public.library_systems(id) ON DELETE CASCADE,
  rule_type public.rule_type NOT NULL,
  scope_state_id UUID REFERENCES public.states(id),
  scope_county_id UUID REFERENCES public.counties(id),
  scope_city TEXT,
  requires_in_person BOOLEAN NOT NULL DEFAULT false,
  paid BOOLEAN NOT NULL DEFAULT false,
  fee_cents INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  priority INTEGER NOT NULL DEFAULT 100
);
CREATE INDEX idx_elig_lib ON public.eligibility_rules(library_system_id);

-- Benefits catalog
CREATE TABLE public.benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category public.benefit_category NOT NULL,
  icon TEXT,
  description TEXT
);

CREATE TABLE public.library_benefits (
  library_system_id UUID NOT NULL REFERENCES public.library_systems(id) ON DELETE CASCADE,
  benefit_id UUID NOT NULL REFERENCES public.benefits(id) ON DELETE CASCADE,
  limit_text TEXT,
  notes TEXT,
  PRIMARY KEY(library_system_id, benefit_id)
);

CREATE TABLE public.reciprocity (
  library_system_id UUID NOT NULL REFERENCES public.library_systems(id) ON DELETE CASCADE,
  reciprocal_with_id UUID NOT NULL REFERENCES public.library_systems(id) ON DELETE CASCADE,
  notes TEXT,
  PRIMARY KEY(library_system_id, reciprocal_with_id)
);

-- Profiles + roles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Favorites
CREATE TABLE public.favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  library_system_id UUID NOT NULL REFERENCES public.library_systems(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, library_system_id)
);

-- Suggested corrections
CREATE TABLE public.suggested_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_system_id UUID NOT NULL REFERENCES public.library_systems(id) ON DELETE CASCADE,
  submitter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitter_email TEXT,
  field TEXT NOT NULL,
  suggested_value TEXT NOT NULL,
  status public.correction_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_corrections_lib ON public.suggested_corrections(library_system_id);

-- Scrape jobs
CREATE TABLE public.scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_system_id UUID NOT NULL REFERENCES public.library_systems(id) ON DELETE CASCADE,
  status public.scrape_status NOT NULL DEFAULT 'queued',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  diff_json JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER touch_library_systems
  BEFORE UPDATE ON public.library_systems
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Enable RLS
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reciprocity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggested_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;

-- Public read for catalog
CREATE POLICY "public read states" ON public.states FOR SELECT USING (true);
CREATE POLICY "public read counties" ON public.counties FOR SELECT USING (true);
CREATE POLICY "public read library_systems" ON public.library_systems FOR SELECT USING (true);
CREATE POLICY "public read eligibility_rules" ON public.eligibility_rules FOR SELECT USING (true);
CREATE POLICY "public read benefits" ON public.benefits FOR SELECT USING (true);
CREATE POLICY "public read library_benefits" ON public.library_benefits FOR SELECT USING (true);
CREATE POLICY "public read reciprocity" ON public.reciprocity FOR SELECT USING (true);

-- Admin write for catalog
CREATE POLICY "admin write states" ON public.states FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write counties" ON public.counties FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write library_systems" ON public.library_systems FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write eligibility_rules" ON public.eligibility_rules FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write benefits" ON public.benefits FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write library_benefits" ON public.library_benefits FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write reciprocity" ON public.reciprocity FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Profiles
CREATE POLICY "users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admins read all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(),'admin'));

-- Roles
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Favorites
CREATE POLICY "users manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Suggested corrections
CREATE POLICY "anyone can submit corrections" ON public.suggested_corrections FOR INSERT WITH CHECK (true);
CREATE POLICY "users read own corrections" ON public.suggested_corrections FOR SELECT USING (auth.uid() = submitter_user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage corrections" ON public.suggested_corrections FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Scrape jobs (admin only)
CREATE POLICY "admins manage scrape_jobs" ON public.scrape_jobs FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
