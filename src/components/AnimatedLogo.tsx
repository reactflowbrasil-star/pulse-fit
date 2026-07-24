import { Zap } from "lucide-react";

type Props = {
  size?: number;
  breathing?: boolean;
  glow?: boolean;
};

export function AnimatedLogo({ size = 96, breathing = false, glow = true }: Props) {
  return (
    <div
      className={`relative grid place-items-center rounded-[36%] bg-primary text-primary-foreground ${
        breathing ? "animate-[logo-breathe_2.4s_ease-in-out_infinite]" : ""
      } ${glow ? "shadow-glow" : ""}`}
      style={{ width: size, height: size }}
      aria-label="Pulse Fit"
    >
      <Zap className="h-1/2 w-1/2" strokeWidth={2.8} fill="currentColor" />
    </div>
  );
}
