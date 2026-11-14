// Stops the paid AI session and the camera when the app leaves the foreground.
// On return it does NOT reconnect by itself: it raises `needsResumeConsent` so the
// screen can ask the user first (a Decart session costs money per second).
//
// We react to "background" only, not iOS "inactive": "inactive" also fires for
// system permission alerts and Control Center, which would kill the camera the
// moment iOS asks for camera access.
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";

export function useAppStateGuard(onBackground: () => void) {
  const [needsResumeConsent, setNeedsResumeConsent] = useState(false);
  const appStateRef = useRef<string>(AppState.currentState ?? "unknown");
  const onBackgroundRef = useRef(onBackground);
  /** > 0 while a trusted in-app flow (e.g. the Android photo picker activity) has the foreground. */
  const suppressRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    onBackgroundRef.current = onBackground;
  }, [onBackground]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (next === "background" && prev !== "background") {
        if (suppressRef.current > 0) return;
        pausedRef.current = true;
        onBackgroundRef.current();
      } else if (next === "active" && pausedRef.current) {
        pausedRef.current = false;
        setNeedsResumeConsent(true);
      }
    });
    return () => subscription.remove();
  }, []);

  /**
   * Runs `fn` without treating the resulting background transition as "user left".
   * Use only for flows the user started inside the app, such as the photo picker,
   * and never while a paid AI session runs.
   * Android only: there the picker is a separate activity, so the app goes to
   * "background". On iOS the picker is an in-process modal (the app stays "active"),
   * so the guard stays armed and a real Home press is still caught.
   */
  const runWithoutGuard = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    if (Platform.OS !== "android") return fn();
    suppressRef.current++;
    try {
      return await fn();
    } finally {
      // Let the "active" event from closing the picker/dialog arrive before re-arming.
      setTimeout(() => {
        suppressRef.current = Math.max(0, suppressRef.current - 1);
      }, 1000);
    }
  }, []);

  const dismissResumePrompt = useCallback(() => setNeedsResumeConsent(false), []);

  return { needsResumeConsent, dismissResumePrompt, runWithoutGuard };
}
