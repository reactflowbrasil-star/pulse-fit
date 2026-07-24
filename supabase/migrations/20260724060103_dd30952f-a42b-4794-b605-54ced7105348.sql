ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nome text,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS whatsapp_verificado boolean NOT NULL DEFAULT false;