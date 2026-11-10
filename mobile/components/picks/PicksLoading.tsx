// Loading state for Screen 2: two empty 4:5 frames already badged A and B, so the
// layout the shopper is waiting for is visible while the stylist answers. A soft
// opacity pulse shows work in progress; under reduced motion it holds still.
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Animated, { cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

import { AppText } from "@/components/ui";
import { colors, motion, radii, spacing } from "@/lib/theme";

export function PicksLoading() {
  const reduced = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      cancelAnimation(pulse);
      pulse.set(1);
      return;
    }
    pulse.set(withRepeat(withTiming(0.55, { duration: 900, easing: motion.easing }), -1, true));
    return () => cancelAnimation(pulse);
  }, [reduced, pulse]);

  const fade = useAnimatedStyle(() => ({ opacity: pulse.get() }));

  return (
    <View style={styles.root}>
      <View style={styles.status} accessible accessibilityLiveRegion="polite" accessibilityRole="progressbar" accessibilityLabel="Choosing your two looks. Đang chọn hai món cho bạn.">
        <ActivityIndicator color={colors.ink} />
        <AppText variant="bodyStrong" helper="Đang chọn hai món cho bạn…" containerStyle={styles.flex}>
          Choosing your two looks…
        </AppText>
      </View>
      {(["A", "B"] as const).map((letter, i) => (
        <Animated.View key={letter} style={[styles.frame, i > 0 && styles.second, fade]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={styles.badge}>
            <AppText variant="section" weight={800} tone="muted" maxFontSizeMultiplier={1.2}>
              {letter}
            </AppText>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.stack },
  flex: { flex: 1 },
  status: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 44 },
  frame: { width: "100%", aspectRatio: 4 / 5, borderRadius: radii.xxl, backgroundColor: colors.surface },
  second: { marginTop: spacing.gap },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceDeep,
    alignItems: "center",
    justifyContent: "center",
  },
});
