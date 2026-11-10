// Auto compare (DESIGN.md §6.4): while the AI is live, switch A <-> B every 8 s so the
// shopper can stand back hands-free. Stops by itself when the session ends; the screen
// stops it on any manual hook tap. If a switch is still in flight when the timer fires,
// it retries a second later instead of queueing.
import { useCallback, useEffect, useRef, useState } from "react";

import { motion } from "@/lib/theme";

export interface AutoCompareOptions {
  /** Auto compare can run (a live AI session exists). Turning this off stops it. */
  available: boolean;
  /** Checked when the timer fires; false defers the switch by 1 s. */
  canSwitchNow: () => boolean;
  /** Show the other look. */
  onSwitch: () => void;
  intervalMs?: number;
}

export interface AutoCompare {
  running: boolean;
  /** Whole seconds until the next switch, or null when not running. */
  secondsToNext: number | null;
  start: () => void;
  stop: () => void;
}

const RETRY_MS = 1000;
const TICK_MS = 250;

export function useAutoCompare({ available, canSwitchNow, onSwitch, intervalMs = motion.autoCompareMs }: AutoCompareOptions): AutoCompare {
  const [running, setRunning] = useState(false);
  const [nextAt, setNextAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const nextRef = useRef<number | null>(null);

  const canSwitchRef = useRef(canSwitchNow);
  const onSwitchRef = useRef(onSwitch);
  useEffect(() => {
    canSwitchRef.current = canSwitchNow;
    onSwitchRef.current = onSwitch;
  });

  // Session ended (cap, lost, flip, background): auto compare ends with it, and does
  // not resume by itself when a later session goes live. Adjusting state while
  // rendering (not in an effect) so there is no frame where it still claims to run.
  const [prevAvailable, setPrevAvailable] = useState(available);
  if (available !== prevAvailable) {
    setPrevAvailable(available);
    if (!available) {
      setRunning(false);
      setNextAt(null);
    }
  }

  const stop = useCallback(() => {
    nextRef.current = null;
    setRunning(false);
    setNextAt(null);
  }, []);

  const start = useCallback(() => {
    if (!available) return;
    const t = Date.now();
    nextRef.current = t + intervalMs;
    setNow(t);
    setNextAt(t + intervalMs);
    setRunning(true);
  }, [available, intervalMs]);

  const active = running && available;

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      const t = Date.now();
      const next = nextRef.current ?? t + intervalMs;
      if (t >= next) {
        const canSwitch = canSwitchRef.current();
        if (canSwitch) onSwitchRef.current();
        const following = t + (canSwitch ? intervalMs : RETRY_MS);
        nextRef.current = following;
        setNextAt(following);
      }
      setNow(t);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [active, intervalMs]);

  const secondsToNext = active && nextAt !== null ? Math.max(0, Math.ceil((nextAt - now) / 1000)) : null;
  return { running: active, secondsToNext, start, stop };
}
