CREATE TABLE public.library_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  library_system_id uuid,
  custom_label text,
  card_number text NOT NULL,
  pin text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.library_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own cards" ON public.library_cards
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own cards" ON public.library_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own cards" ON public.library_cards
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own cards" ON public.library_cards
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_library_cards_user_id ON public.library_cards(user_id);

CREATE TRIGGER trg_library_cards_updated_at
  BEFORE UPDATE ON public.library_cards
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();