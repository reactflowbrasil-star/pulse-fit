import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Anima um número de 0 (ou startValue) até `value` com easing suave.
 * Respeita prefers-reduced-motion (retorna o valor final imediatamente).
 */
export function useAnimatedNumber(
  value: number,
  { duration = 900, startValue = 0 }: { duration?: number; startValue?: number } = {},
) {
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(reduced ? value : startValue);
  const fromRef = useRef(startValue);

  useEffect(() => {
    if (reduced) {
      setCurrent(value);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setCurrent(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);

  return current;
}
