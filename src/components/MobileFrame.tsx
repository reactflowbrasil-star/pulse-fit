import type { ReactNode } from "react";

/**
 * Renders the app inside a phone-shaped frame on tablet/desktop, full-bleed on mobile.
 */
export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background-deep">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background sm:my-4 sm:min-h-[calc(100vh-2rem)] sm:overflow-hidden sm:rounded-[2.5rem] sm:shadow-elevated sm:ring-1 sm:ring-white/5">
        {children}
      </div>
    </div>
  );
}
