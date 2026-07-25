-- ============================================================
-- NVIDIA API Management Tables
-- ============================================================

CREATE TABLE public.nvidia_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  api_key text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_validated_at timestamptz,
  last_validation_ok boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.nvidia_api_keys (is_active);
GRANT ALL ON public.nvidia_api_keys TO service_role;
ALTER TABLE public.nvidia_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gerencia chaves NVIDIA" ON public.nvidia_api_keys
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.nvidia_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  max_tokens int NOT NULL DEFAULT 4096,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.nvidia_models TO service_role;
ALTER TABLE public.nvidia_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gerencia modelos NVIDIA" ON public.nvidia_models
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuários autenticados veem modelos ativos" ON public.nvidia_models
  FOR SELECT TO authenticated
  USING (is_enabled = true);

CREATE TABLE public.nvidia_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.nvidia_settings TO service_role;
ALTER TABLE public.nvidia_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gerencia settings NVIDIA" ON public.nvidia_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER nvidia_keys_updated BEFORE UPDATE ON public.nvidia_api_keys
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Default settings
INSERT INTO public.nvidia_settings (key, value) VALUES
  ('base_url', '"https://integrate.api.nvidia.com/v1"'),
  ('default_model', '"nvidia/llama-3.1-nemotron-70b-instruct"'),
  ('max_tokens_default', '4096'),
  ('temperature_default', '0.7')
ON CONFLICT (key) DO NOTHING;

-- Seed popular NVIDIA models
INSERT INTO public.nvidia_models (model_id, display_name, description, category, max_tokens) VALUES
  ('nvidia/llama-3.1-nemotron-70b-instruct', 'Nemotron 70B Instruct', 'Modelo de instrução de 70B parâmetros', 'text', 4096),
  ('nvidia/llama-3.1-nemotron-8b-instruct', 'Nemotron 8B Instruct', 'Modelo leve de 8B parâmetros', 'text', 4096),
  ('nvidia/llama-3.3-70b-instruct', 'Llama 3.3 70B Instruct', 'Meta Llama 3.3 70B', 'text', 4096),
  ('nvidia/llama-3.1-8b-instruct', 'Llama 3.1 8B Instruct', 'Meta Llama 3.1 8B', 'text', 4096),
  ('nvidia/nemotron-mini-4b-instruct', 'Nemotron Mini 4B', 'Modelo ultra leve', 'text', 4096),
  ('meta/llama-3.1-405b-instruct', 'Llama 3.1 405B Instruct', 'Maior modelo Llama', 'text', 4096),
  ('meta/llama-3.1-70b-instruct', 'Llama 3.1 70B Instruct', 'Meta Llama 3.1 70B', 'text', 4096),
  ('meta/llama-3.1-8b-instruct', 'Llama 3.1 8B Instruct', 'Meta Llama 3.1 8B', 'text', 4096),
  ('google/gemma-2-27b-it', 'Gemma 2 27B IT', 'Google Gemma 2', 'text', 4096),
  ('mistralai/mistral-large-2-instruct', 'Mistral Large 2', 'Mistral Large v2', 'text', 4096),
  ('mistralai/mixtral-8x22b-instruct-v01', 'Mixtral 8x22B', 'Mixture of Experts', 'text', 4096),
  ('nvidia/starcoder2-15b', 'StarCoder2 15B', 'Código e programação', 'code', 16384),
  ('nvidia/nemotron-4-340b-instruct', 'Nemotron 4 340B', 'Modelo premium de 340B', 'text', 4096)
ON CONFLICT (model_id) DO NOTHING;
