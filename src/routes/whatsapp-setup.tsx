import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, MessageCircle, Loader2, ShieldCheck } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuth } from "@/hooks/useAuth";
import { getMe } from "@/lib/auth.functions";
import {
  enviarCodigoWhatsapp,
  verificarCodigoWhatsapp,
} from "@/lib/wa-link.functions";

export const Route = createFileRoute("/whatsapp-setup")({
  head: () => ({
    meta: [
      { title: "Confirmar WhatsApp — Pulse Fit" },
      { name: "description", content: "Cadastre e confirme seu WhatsApp para receber lembretes de treino." },
      { property: "og:title", content: "Confirmar WhatsApp — Pulse Fit" },
      { property: "og:description", content: "Cadastre e confirme seu WhatsApp para receber lembretes de treino." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: OnboardingWhatsappPage,
});

function OnboardingWhatsappPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => getMe(),
    enabled: !!session,
  });

  const requestFn = useServerFn(enviarCodigoWhatsapp);
  const confirmFn = useServerFn(verificarCodigoWhatsapp);

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code" | "done">("phone");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (me.data?.profile?.whatsapp_verified) setStep("done");
    else if (me.data?.profile?.whatsapp_number) {
      setPhone(String(me.data.profile.whatsapp_number).replace(/@.*/, ""));
    }
  }, [me.data]);

  const requestMut = useMutation({
    mutationFn: (p: string) => requestFn({ data: { whatsapp: p } }),
    onSuccess: (res) => {
      if (res.ok) { setStep("code"); setError(null); }
      else setError(res.error);
    },
    onError: (err: Error) => setError(err.message),
  });

  const confirmMut = useMutation({
    mutationFn: (c: string) => confirmFn({ data: { whatsapp: phone.trim(), codigo: c } }),
    onSuccess: (res) => {
      if (res.ok) { setStep("done"); setError(null); me.refetch(); }
      else setError(res.error);
    },
    onError: (err: Error) => setError(err.message),
  });

  if (loading || !session) {
    return <MobileFrame><StatusBar /><Loading /></MobileFrame>;
  }

  return (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader title="Confirmar WhatsApp" onBack={() => navigate({ to: "/" })} />
      <main className="flex-1 space-y-4 px-5 py-4">
        <div className="rounded-3xl bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/20 text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg">Bot Pulse Fit no WhatsApp</p>
              <p className="text-xs text-text-tertiary">Vamos enviar um código de 6 dígitos para confirmar seu número.</p>
            </div>
          </div>
        </div>

        {step === "phone" && (
          <form
            onSubmit={(e) => { e.preventDefault(); if (phone.trim()) requestMut.mutate(phone.trim()); }}
            className="space-y-3 rounded-3xl bg-surface p-5"
          >
            <label className="text-xs font-bold uppercase tracking-widest text-text-tertiary">
              Seu WhatsApp (com DDD)
            </label>
            <input
              inputMode="tel"
              placeholder="Ex: 62 98204-5202"
              className="w-full rounded-2xl bg-surface-elevated px-4 py-3 text-base outline-none placeholder:text-text-tertiary"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={32}
            />
            <button
              type="submit"
              disabled={requestMut.isPending || !phone.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {requestMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enviar código pelo WhatsApp
            </button>
          </form>
        )}

        {step === "code" && (
          <form
            onSubmit={(e) => { e.preventDefault(); if (code.length === 6) confirmMut.mutate(code); }}
            className="space-y-3 rounded-3xl bg-surface p-5"
          >
            <p className="text-sm">Digite o código de 6 dígitos que enviamos para <b>{phone}</b>.</p>
            <input
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="w-full rounded-2xl bg-surface-elevated px-4 py-4 text-center font-display text-3xl tracking-[0.5em] outline-none"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            <button
              type="submit"
              disabled={confirmMut.isPending || code.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {confirmMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Confirmar
            </button>
            <button
              type="button"
              onClick={() => { setStep("phone"); setCode(""); setError(null); }}
              className="w-full text-center text-xs text-text-tertiary underline"
            >
              Reenviar / mudar número
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-3 rounded-3xl bg-surface p-5 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/20 text-primary">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="font-display text-2xl">WhatsApp confirmado!</p>
            <p className="text-xs text-text-tertiary">Você já recebeu a mensagem de boas-vindas. A partir de agora, o bot vai te enviar lembretes.</p>
            <button
              onClick={() => navigate({ to: "/" })}
              className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground shadow-glow"
            >
              Ir para o app
            </button>
          </div>
        )}

        {error && <p className="text-center text-sm text-red-400">{error}</p>}
      </main>
    </MobileFrame>
  );
}

function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
