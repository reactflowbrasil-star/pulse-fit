import { Signal, Wifi, BatteryFull } from "lucide-react";

export function StatusBar({ tone = "light" }: { tone?: "light" | "dark" }) {
  const color = tone === "light" ? "text-foreground" : "text-primary-foreground";
  return (
    <div
      className={`flex items-center justify-between px-6 pt-3 pb-1 text-[13px] font-semibold ${color}`}
    >
      <span>9:41</span>
      <div className="flex items-center gap-1.5 opacity-90">
        <Signal className="h-3.5 w-3.5" />
        <Wifi className="h-3.5 w-3.5" />
        <BatteryFull className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}
