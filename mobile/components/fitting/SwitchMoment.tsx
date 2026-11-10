// Compact top banner switch moment: when the look changes, a sleek lime strip
// drops down from below the top bar, holds, and slides away.
// Crucially, this leaves the entire body/torso video stream visible so judges and shoppers
// see the clothing morph live on their body instead of hiding behind a full-screen wipe.
// Reduced motion: appears and disappears cleanly without travel.
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui";
import type { DockSlot } from "@/components/FittingDock";
import { colors, radii, shadowDock } from "@/lib/theme";

export interface SwitchCue {
  /** Increments on every switch so the same slot can replay. */
  id: number;
  slot: DockSlot;
  garmentName: string | null;
}

/** How long the lime banner holds on screen. */
const HOLD_MS = 1200;
const SLIDE_DURATION = 280;

export function SwitchMoment({ cue }: { cue: SwitchCue | null }) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  // The last cue id that finished playing; a cue is on screen until its id lands here.
  const [doneId, setDoneId] = useState(0);
  const shown = cue && cue.id !== doneId ? cue : null;

  const cueId = cue?.id ?? 0;
  useEffect(() => {
    if (cueId === 0) return;
    let timer: ReturnType<typeof setTimeout>;
    if (reduced) {
      translateY.set(0);
      opacity.set(1);
      timer = setTimeout(() => {
        opacity.set(0);
        setDoneId(cueId);
      }, HOLD_MS);
    } else {
      translateY.set(-100);
      opacity.set(0);
      translateY.set(
        withSequence(
          withTiming(0, { duration: SLIDE_DURATION }),
          withDelay(HOLD_MS, withTiming(-100, { duration: SLIDE_DURATION })),
        ),
      );
      opacity.set(
        withSequence(
          withTiming(1, { duration: SLIDE_DURATION }),
          withDelay(HOLD_MS, withTiming(0, { duration: SLIDE_DURATION })),
        ),
      );
      timer = setTimeout(() => setDoneId(cueId), SLIDE_DURATION * 2 + HOLD_MS + 50);
    }
    return () => clearTimeout(timer);
  }, [cueId, reduced, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.get() }],
    opacity: opacity.get(),
  }));

  if (!shown) return null;
  const letter = shown.slot.toUpperCase();

  return (
    <View
      pointerEvents="none"
      style={[styles.container, { top: insets.top + 56 }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={[styles.banner, animatedStyle]}>
        <View style={styles.badge}>
          <AppText variant="studioNumeral" tone="lime" style={styles.badgeText}>
            {letter}
          </AppText>
        </View>
        <View style={styles.textCol}>
          <AppText variant="bodyStrong" tone="ink" numberOfLines={1}>
            {shown.garmentName ?? `Look ${letter}`}
          </AppText>
          <AppText variant="caption" tone="limeInk" numberOfLines={1}>
            {`Đang hiển thị Look ${letter} · Now showing Look ${letter}`}
          </AppText>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 999,
    alignItems: "center",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lime,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.xl,
    gap: 12,
    maxWidth: 380,
    width: "100%",
    ...shadowDock,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: "800",
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
});
