// DESIGN.md Toast: ink pill, paper 14/500 text, dock shadow, at the top under the
// safe area, enters with `rise` (360 ms). Every message is announced to
// VoiceOver / TalkBack. One toast at a time; a new one replaces the old.
//
//   const toast = useToast();
//   toast.show("Saved Look A · Đã lưu Look A");
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";
import Animated, { FadeOut, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, motion, radii, shadowDock, sizes } from "@/lib/theme";

import { AppText } from "./AppText";

export interface ToastOptions {
  /** Default 2600 ms. */
  durationMs?: number;
  /** Read aloud instead of the visible text (e.g. without the " · " separator). */
  announcement?: string;
}

interface ToastApi {
  show: (message: string, options?: ToastOptions) => void;
  hide: () => void;
}

const ToastContext = createContext<ToastApi | null>(null);

interface ToastItem {
  id: number;
  message: string;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<ToastItem | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setItem(null);
  }, []);

  const show = useCallback((message: string, options?: ToastOptions) => {
    if (timer.current) clearTimeout(timer.current);
    counter.current += 1;
    setItem({ id: counter.current, message });
    AccessibilityInfo.announceForAccessibility(options?.announcement ?? message);
    timer.current = setTimeout(() => setItem(null), options?.durationMs ?? 2600);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const api = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {item ? <ToastView key={item.id} message={item.message} /> : null}
    </ToastContext.Provider>
  );
}

function ToastView({ message }: { message: string }) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (!reduced) progress.set(withTiming(1, { duration: motion.duration.rise, easing: motion.easing }));
  }, [reduced, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: (1 - progress.get()) * -8 }],
  }));

  return (
    <View pointerEvents="none" style={[styles.layer, { top: insets.top + 8 }]}>
      {/* exiting lives on a wrapper so it never fights the animated opacity below */}
      <Animated.View exiting={reduced ? undefined : FadeOut.duration(200)} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Animated.View style={[styles.toast, style]}>
          <AppText variant="bodySm" weight={500} tone="paper" align="center" style={styles.text}>
            {message}
          </AppText>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/** Show a toast from anywhere under <ToastProvider> (wired in app/_layout.tsx). */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <ToastProvider>.");
  return api;
}

const styles = StyleSheet.create({
  layer: { position: "absolute", left: 16, right: 16, alignItems: "center", zIndex: 1000, elevation: 1000 },
  toast: {
    maxWidth: sizes.maxContentWidth,
    backgroundColor: colors.ink,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...shadowDock,
  },
  text: { fontSize: 14, lineHeight: 20 },
});
