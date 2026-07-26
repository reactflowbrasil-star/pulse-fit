import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Check,
  Loader2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { enviarCodigoWhatsapp, verificarCodigoWhatsapp } from "@/lib/wa-link.functions";

export const Route = createFileRoute("/whatsapp-setup")({
  head: () => ({ meta: [{ title: "WhatsApp — Pulse Fit" }] }),
  component: WhatsAppSetupPage,
});

type Step = "phone" | "sending" | "verify" | "verifying" | "done" | "error";

function WhatsAppSetupPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("phone");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [maxAttempts] = useState(5);
  const [attempts, setAttempts] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setRemaining(diff);
      if (diff <= 0) {
        setStep("error");
        setError("Código expirado. Solicite um novo código.");
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const handleSendCode = useCallback(async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Informe pelo menos 10 dígitos (DDI + DDD + número).");
      return;
    }

    setStep("sending");
    setError(null);

    try {
      const result = await enviarCodigoWhatsapp({ data: { whatsapp: digits } });

      if (result?.ok) {
        setExpiresAt(new Date(result.expira_em));
        setStep("verify");
      } else {
        setStep("error");
        setError(result?.error || "Falha ao enviar código. Tente novamente.");
      }
    } catch (err) {
      setStep("error");
      const msg = err instanceof Error ? err.message : "Erro de rede. Verifique sua conexão.";
      setError(msg);
    }
  }, [phone]);

  const handleVerify = useCallback(async () => {
    if (code.length !== 6) {
      setError("O código deve ter 6 dígitos.");
      return;
    }

    setStep("verifying");
    setError(null);

    try {
      const result = await verificarCodigoWhatsapp({
        data: { whatsapp: phone.replace(/\D/g, ""), codigo: code },
      });

      if (result?.ok) {
        setStep("done");
      } else {
        setAttempts((a) => a + 1);
        const remaining = maxAttempts - attempts - 1;
        if (remaining <= 0) {
          setStep("error");
          setError("Número máximo de tentativas atingido. Solicite um novo código.");
        } else {
          setStep("verify");
          setError(`Código inválido. ${remaining} tentativa(s) restante(s).`);
          setCode("");
        }
      }
    } catch (err) {
      setStep("verify");
      const msg = err instanceof Error ? err.message : "Erro ao verificar código.";
      setError(msg);
    }
  }, [code, phone, attempts, maxAttempts]);

  const handleResend = useCallback(() => {
    setCode("");
    setError(null);
    setAttempts(0);
    handleSendCode();
  }, [handleSendCode]);

  return (
    <MobileFrame>
      <ScreenHeader title="WhatsApp" onBack={() => navigate({ to: "/" })} />
      <PageTransition>
        <main className="flex flex-1 flex-col px-6 py-8">
          <div className="flex flex-1 flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-success/10"
            >
              {step === "done" ? (
                <ShieldCheck className="h-10 w-10 text-success" />
              ) : (
                <MessageCircle className="h-10 w-10 text-success" />
              )}
            </motion.div>

            <h2 className="font-display text-2xl font-bold">
              {step === "done"
                ? "Tudo pronto! 🎉"
                : step === "error"
                  ? "Algo deu errado"
                  : "Conecte seu WhatsApp"}
            </h2>
            <p className="mt-2 text-sm text-text-tertiary max-w-[280px]">
              {step === "done"
                ? "Seu WhatsApp está conectado. Você receberá lembretes e treinos por aqui."
                : step === "error"
                  ? error || "Ocorreu um erro inesperado."
                  : step === "verify" || step === "verifying"
                    ? "Enviamos um código de 6 dígitos para seu WhatsApp. Insira abaixo."
                    : "Informe seu número para receber lembretes de treino e mensagens do coach."}
            </p>
          </div>

          <div className="mt-auto space-y-3 pb-6">
            <AnimatePresence mode="wait">
              {/* Step: Phone */}
              {step === "phone" && (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-3"
                >
                  <Input
                    placeholder="Número com DDD (ex: 11999998888)"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setError(null);
                    }}
                    inputMode="numeric"
                    maxLength={15}
                  />
                  <Button
                    className="w-full"
                    onClick={handleSendCode}
                    disabled={!phone.trim() || phone.replace(/\D/g, "").length < 10}
                  >
                    Enviar código <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {/* Step: Sending */}
              {step === "sending" && (
                <motion.div
                  key="sending"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="flex flex-col items-center gap-3 py-4"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-success" />
                  <p className="text-sm text-text-tertiary">Enviando código...</p>
                </motion.div>
              )}

              {/* Step: Verify */}
              {step === "verify" && (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-3"
                >
                  {remaining > 0 && (
                    <div className="flex items-center justify-center gap-2 text-xs text-text-tertiary">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Expira em {formatTime(remaining)}</span>
                    </div>
                  )}
                  <Input
                    placeholder="Código de 6 dígitos"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setError(null);
                    }}
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                  />
                  <Button className="w-full" onClick={handleVerify} disabled={code.length !== 6}>
                    <Check className="h-4 w-4" /> Verificar
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={handleResend}>
                    <RotateCcw className="h-4 w-4" /> Reenviar código
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setStep("phone");
                      setCode("");
                      setError(null);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" /> Trocar número
                  </Button>
                </motion.div>
              )}

              {/* Step: Verifying */}
              {step === "verifying" && (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="flex flex-col items-center gap-3 py-4"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-success" />
                  <p className="text-sm text-text-tertiary">Verificando código...</p>
                </motion.div>
              )}

              {/* Step: Done */}
              {step === "done" && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <Button className="w-full" onClick={() => navigate({ to: "/" })}>
                    Ir para o início
                  </Button>
                </motion.div>
              )}

              {/* Step: Error */}
              {step === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{error || "Erro desconhecido"}</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setStep("phone");
                      setCode("");
                      setError(null);
                      setAttempts(0);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" /> Tentar novamente
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error toast inline */}
            {error && step !== "error" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-destructive"
              >
                {error}
              </motion.p>
            )}
          </div>
        </main>
      </PageTransition>
    </MobileFrame>
  );
}
