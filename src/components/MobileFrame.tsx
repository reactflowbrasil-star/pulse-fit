import type { ReactNode } from "react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden overflow-y-hidden bg-background-deep safe-x relative">
      <div
        className="
          mx-auto flex min-h-[100dvh] w-full max-w-full flex-col bg-background relative
          sm:my-3 sm:max-w-[430px] sm:min-h-[calc(100dvh-1.5rem)]
          sm:overflow-hidden sm:rounded-[2rem] sm:shadow-xl sm:border sm:border-border/30
          md:max-w-[460px] lg:max-w-[480px]
        "
      >
        {/* Subtle top gradient accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/[0.03] to-transparent" />
        {children}
      </div>
    </div>
  );
}
