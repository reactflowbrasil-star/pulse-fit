import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Check, Loader2, ArrowRight } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/whatsapp-setup")({
  head: () => ({ meta: [{ title: "WhatsApp — Pulse Fit" }] }),
  component: WhatsAppSetupPage,
});

function WhatsAppSetupPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "verify" | "done">("phone");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <MobileFrame>
      <ScreenHeader title="WhatsApp" onBack={() => navigate({ to: "/" })} />
      <PageTransition>
        <main className="flex flex-1 flex-col px-6 py-8">
          <div className="flex flex-1 flex-col items-center text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-success/10">
              <MessageCircle className="h-10 w-10 text-success" />
            </motion.div>
            <h2 className="font-display text-2xl font-bold">
              {step === "done" ? "Tudo pronto! 🎉" : "Conecte seu WhatsApp"}
            </h2>
            <p className="mt-2 text-sm text-text-tertiary max-w-[280px]">
              {step === "done"
                ? "Seu WhatsApp está conectado. Você receberá lembretes e treinos por aqui."
                : "Informe seu número para receber lembretes de treino e mensagens do coach."}
            </p>
          </div>

          <div className="mt-auto space-y-3 pb-6">
            {step === "phone" && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <Input placeholder="Número com DDD (ex: 11999998888)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Button className="w-full" onClick={() => { if (phone.trim()) setStep("verify"); }}>
                  Continuar <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
            {step === "verify" && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <Input placeholder="Código de 6 dígitos" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} />
                <Button className="w-full" onClick={() => { setStep("done"); }}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Verificar
                </Button>
              </motion.div>
            )}
            {step === "done" && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Button className="w-full" onClick={() => navigate({ to: "/" })}>Ir para o início</Button>
              </motion.div>
            )}
            {error && <p className="text-center text-xs text-destructive">{error}</p>}
          </div>
        </main>
      </PageTransition>
    </MobileFrame>
  );
}
