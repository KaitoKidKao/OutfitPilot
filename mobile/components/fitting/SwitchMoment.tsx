// The one authored motion moment of the studio: when the look changes, a full-screen
// lime panel wipes in from the left carrying the new letter, holds, and wipes out to
// the right (DESIGN.md Motion: `wipe` 480 ms, ease-out). The letter stays put while
// the lime edge travels (an inner counter-translate), so it reads as a cut, not a slide.
// Reduced motion: the panel appears and disappears instantly, no travel.
// Purely visual: no touches, hidden from screen readers (the screen announces the change).
import { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";

import { AppText } from "@/components/ui";
import type { DockSlot } from "@/components/FittingDock";
import { colors, motion } from "@/lib/theme";

export interface SwitchCue {
  /** Increments on every switch so the same slot can replay. */
  id: number;
  slot: DockSlot;
  garmentName: string | null;
}

/** How long the lime card holds the new letter between the two wipes. */
const HOLD_MS = 420;
const REDUCED_HOLD_MS = 650;

export function SwitchMoment({ cue }: { cue: SwitchCue | null }) {
  const reduced = useReducedMotion();
  const { width } = useWindowDimensions();
  const x = useSharedValue(-width);
  // The last cue id that finished playing; a cue is on screen until its id lands here.
  const [doneId, setDoneId] = useState(0);
  const shown = cue && cue.id !== doneId ? cue : null;

  const cueId = cue?.id ?? 0;
  useEffect(() => {
    if (cueId === 0) return;
    let timer: ReturnType<typeof setTimeout>;
    if (reduced) {
      x.set(0);
      timer = setTimeout(() => setDoneId(cueId), REDUCED_HOLD_MS);
    } else {
      const wipe = motion.duration.wipe;
      x.set(-width);
      x.set(
        withSequence(
          withTiming(0, { duration: wipe, easing: motion.easing }),
          withDelay(HOLD_MS, withTiming(width, { duration: wipe, easing: motion.easing })),
        ),
      );
      timer = setTimeout(() => setDoneId(cueId), wipe * 2 + HOLD_MS + 40);
    }
    return () => clearTimeout(timer);
    // Replays only when a new cue id arrives (width / reduced are read at that moment).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cueId]);

  const outer = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  const inner = useAnimatedStyle(() => ({ transform: [{ translateX: -x.get() }] }));

  if (!shown) return null;
  const letter = shown.slot.toUpperCase();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.panel, outer]}>
        <Animated.View style={[styles.content, inner]}>
          <AppText variant="studioNumeral" tone="ink" style={styles.letter}>
            {letter}
          </AppText>
          <AppText variant="title" tone="ink" align="center" numberOfLines={2} maxFontSizeMultiplier={1.3} accessibilityRole="text">
            {shown.garmentName ?? `Look ${letter}`}
          </AppText>
          <AppText variant="label" tone="limeInk" align="center" maxFontSizeMultiplier={1.3}>
            {`Now showing Look ${letter} · Đang hiển thị Look ${letter}`}
          </AppText>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { ...StyleSheet.absoluteFill, backgroundColor: colors.lime, overflow: "hidden" },
  content: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 8 },
  letter: { fontSize: 132, lineHeight: 132 },
});
