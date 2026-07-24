
CREATE TABLE public.whatsapp_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_url text,
  instance_name text,
  webhook_token text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  singleton boolean NOT NULL DEFAULT true,
  UNIQUE (singleton)
);
GRANT ALL ON public.whatsapp_config TO service_role;
ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  direction text NOT NULL CHECK (direction IN ('outbound','inbound')),
  remote_jid text NOT NULL,
  message_id text,
  content text,
  media_url text,
  media_type text,
  template_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','delivered','read','failed','received')),
  error text,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.whatsapp_messages (remote_jid, created_at DESC);
CREATE INDEX ON public.whatsapp_messages (message_id);
GRANT ALL ON public.whatsapp_messages TO service_role;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.whatsapp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  remote_jid text NOT NULL UNIQUE,
  display_name text,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.whatsapp_sessions TO service_role;
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER wa_cfg_updated BEFORE UPDATE ON public.whatsapp_config FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER wa_msg_updated BEFORE UPDATE ON public.whatsapp_messages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER wa_ses_updated BEFORE UPDATE ON public.whatsapp_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
