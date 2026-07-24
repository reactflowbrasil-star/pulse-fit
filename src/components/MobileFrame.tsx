import type { ReactNode } from "react";

/**
 * App container:
 * - Mobile (<sm): full-bleed, edge-to-edge
 * - Tablet+ (sm): phone-shaped frame centered on a dark backdrop
 * - Large screens: wider frame (up to max-w-md) with breathing room
 */
export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-background-deep">
      <div
        className="
          mx-auto flex min-h-[100dvh] w-full max-w-full flex-col bg-background
          sm:my-4 sm:max-w-[430px] sm:min-h-[calc(100dvh-2rem)]
          sm:overflow-hidden sm:rounded-[2.5rem] sm:shadow-elevated sm:ring-1 sm:ring-white/5
          md:max-w-[460px] lg:max-w-[480px]
        "
      >
        {children}
      </div>
    </div>
  );
}
