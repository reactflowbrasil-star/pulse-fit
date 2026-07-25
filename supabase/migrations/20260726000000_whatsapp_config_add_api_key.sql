-- Adiciona coluna api_key para armazenar a chave da Evolution API de forma segura
ALTER TABLE public.whatsapp_config
  ADD COLUMN IF NOT EXISTS api_key text;

-- Garante que service_role continua tendo acesso
GRANT ALL ON public.whatsapp_config TO service_role;
