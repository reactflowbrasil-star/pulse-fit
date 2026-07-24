
-- whatsapp_verifications: telefone -> whatsapp
ALTER TABLE public.whatsapp_verifications RENAME COLUMN telefone TO whatsapp;

-- atividades_diarias: renomeações de metas/campos
ALTER TABLE public.atividades_diarias RENAME COLUMN passos_meta TO meta_passos;
ALTER TABLE public.atividades_diarias RENAME COLUMN calorias_meta TO meta_calorias;
ALTER TABLE public.atividades_diarias RENAME COLUMN agua_litros TO agua_ml;
ALTER TABLE public.atividades_diarias RENAME COLUMN agua_meta TO meta_agua_ml;
ALTER TABLE public.atividades_diarias RENAME COLUMN ativo_min TO minutos_ativo;
ALTER TABLE public.atividades_diarias RENAME COLUMN ativo_meta TO meta_minutos;
ALTER TABLE public.atividades_diarias RENAME COLUMN distancia_meta TO meta_distancia_km;

-- Ajusta tipos/defaults conforme spec
ALTER TABLE public.atividades_diarias
  ALTER COLUMN agua_ml TYPE integer USING (agua_ml)::integer,
  ALTER COLUMN meta_agua_ml TYPE integer USING (meta_agua_ml)::integer,
  ALTER COLUMN passos SET DEFAULT 0,
  ALTER COLUMN meta_passos SET DEFAULT 16000,
  ALTER COLUMN calorias SET DEFAULT 0,
  ALTER COLUMN meta_calorias SET DEFAULT 680,
  ALTER COLUMN agua_ml SET DEFAULT 0,
  ALTER COLUMN meta_agua_ml SET DEFAULT 2500,
  ALTER COLUMN minutos_ativo SET DEFAULT 0,
  ALTER COLUMN meta_minutos SET DEFAULT 60,
  ALTER COLUMN distancia_km SET DEFAULT 0,
  ALTER COLUMN meta_distancia_km SET DEFAULT 8,
  ALTER COLUMN data SET DEFAULT current_date;

-- Único por (user_id, data)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'atividades_diarias_user_data_unique'
  ) THEN
    ALTER TABLE public.atividades_diarias
      ADD CONSTRAINT atividades_diarias_user_data_unique UNIQUE (user_id, data);
  END IF;
END $$;
