import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Loader2 } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Pulse Fit" },
      { name: "description", content: "Acesse sua conta Pulse Fit com o Google." },
      { property: "og:title", content: "Entrar — Pulse Fit" },
      { property: "og:description", content: "Acesse sua conta Pulse Fit com o Google." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/whatsapp-setup" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((evt, session) => {
      if (evt === "SIGNED_IN" && session) navigate({ to: "/whatsapp-setup" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const signInGoogle = async () => {
    setLoading(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error instanceof Error ? result.error.message : "Falha ao entrar.");
      setLoading(false);
    }
  };

  return (
    <MobileFrame>
      <StatusBar />
      <main className="flex flex-1 flex-col justify-between px-6 py-10">
        <div>
          <p className="font-display text-xs uppercase tracking-widest text-primary">Pulse Fit</p>
          <h1 className="mt-3 font-display text-4xl leading-none">Bora treinar?</h1>
          <p className="mt-3 text-sm text-text-tertiary">
            Entre com sua conta Google para receber treinos personalizados e lembretes no WhatsApp.
          </p>
        </div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <button
            onClick={signInGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-primary py-4 font-bold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
            Continuar com Google
          </button>
          {error && <p className="text-center text-xs text-red-400">{error}</p>}
          <Link to="/" className="block text-center text-xs text-text-tertiary underline">
            Continuar sem entrar
          </Link>
        </motion.div>
      </main>
    </MobileFrame>
  );
}
