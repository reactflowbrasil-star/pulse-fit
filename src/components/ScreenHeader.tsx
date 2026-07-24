import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function ScreenHeader({
  title,
  right,
  onBack,
}: {
  title?: string;
  right?: ReactNode;
  onBack?: () => void;
}) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <button
        onClick={onBack ?? (() => router.history.back())}
        aria-label="Voltar"
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface text-foreground transition-transform active:scale-95"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      {title ? (
        <h1 className="text-base font-bold tracking-tight">{title}</h1>
      ) : (
        <span />
      )}
      <div className="flex h-11 w-11 items-center justify-center">{right}</div>
    </div>
  );
}
