import { useEffect, useState } from "react";

/** Re-renders once per second for countdown UIs. */
export function useTick(enabled = true) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [enabled]);
}
