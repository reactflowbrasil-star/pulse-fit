import type { ReactNode } from "react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-background-deep safe-x">
      <div
        className="
          mx-auto flex min-h-[100dvh] w-full max-w-full flex-col bg-background
          sm:my-3 sm:max-w-[430px] sm:min-h-[calc(100dvh-1.5rem)]
          sm:overflow-hidden sm:rounded-[2rem] sm:shadow-xl sm:border sm:border-border/50
          md:max-w-[460px] lg:max-w-[480px]
        "
      >
        {children}
      </div>
    </div>
  );
}
