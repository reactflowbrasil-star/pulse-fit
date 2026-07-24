
-- whatsapp_verifications
CREATE TABLE public.whatsapp_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  telefone TEXT NOT NULL,
  codigo TEXT NOT NULL,
  expira_em TIMESTAMPTZ NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_wa_verif_user ON public.whatsapp_verifications(user_id);
CREATE INDEX idx_wa_verif_lookup ON public.whatsapp_verifications(user_id, telefone, usado);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_verifications TO authenticated;
GRANT ALL ON public.whatsapp_verifications TO service_role;
ALTER TABLE public.whatsapp_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wa verifications"
  ON public.whatsapp_verifications FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- atividades_diarias
CREATE TABLE public.atividades_diarias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  passos INT NOT NULL DEFAULT 0,
  passos_meta INT NOT NULL DEFAULT 10000,
  calorias INT NOT NULL DEFAULT 0,
  calorias_meta INT NOT NULL DEFAULT 600,
  agua_litros NUMERIC(5,2) NOT NULL DEFAULT 0,
  agua_meta NUMERIC(5,2) NOT NULL DEFAULT 2.5,
  ativo_min INT NOT NULL DEFAULT 0,
  ativo_meta INT NOT NULL DEFAULT 60,
  distancia_km NUMERIC(6,2) NOT NULL DEFAULT 0,
  distancia_meta NUMERIC(6,2) NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_atividades_user_data ON public.atividades_diarias(user_id, data);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.atividades_diarias TO authenticated;
GRANT ALL ON public.atividades_diarias TO service_role;
ALTER TABLE public.atividades_diarias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own atividades"
  ON public.atividades_diarias FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_atividades_updated
  BEFORE UPDATE ON public.atividades_diarias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- treinos
CREATE TABLE public.treinos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  distancia_km NUMERIC(6,2) NOT NULL DEFAULT 0,
  data TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_treinos_user_data ON public.treinos(user_id, data DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.treinos TO authenticated;
GRANT ALL ON public.treinos TO service_role;
ALTER TABLE public.treinos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own treinos"
  ON public.treinos FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
