// Occasion card for screen 1 (DESIGN.md §6.1): a large tappable card, radius 20,
// one per occasion. Radio semantics (single choice inside an OccasionGroup).
//
// Selected state, three cues so it never depends on colour alone:
//   - the icon well lights lime (the same "lit" language as a dock hook),
//   - the 1 pt hairline turns ink,
//   - a check mark replaces the empty ring on the right.
// Flat on white: no shadow (DESIGN.md Float-Only Shadow Rule).
import { Check } from "lucide-react-native";
import { useEffect, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { AppText, Touchable } from "@/components/ui";
import type { OccasionOption } from "@/lib/occasions";
import { colors, motion, radii } from "@/lib/theme";

export interface OccasionCardProps {
  option: OccasionOption;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

const WELL = 48;
const RING = 24;

export function OccasionCard({ option, selected, onPress, disabled = false, testID }: OccasionCardProps) {
  const reduced = useReducedMotion();
  const lit = useSharedValue(selected ? 1 : 0);
  const Icon = option.icon;

  useEffect(() => {
    const to = selected ? 1 : 0;
    if (reduced) lit.set(to);
    else lit.set(withTiming(to, { duration: motion.duration.color, easing: motion.easing }));
  }, [selected, reduced, lit]);

  const wellStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(lit.get(), [0, 1], [colors.surface, colors.lime]),
  }));

  return (
    <Touchable
      testID={testID}
      accessibilityRole="radio"
      accessibilityLabel={`${option.label}, ${option.labelVi}. ${option.descriptor}`}
      accessibilityState={{ selected, checked: selected, disabled }}
      // react-native-web 0.21 ignores accessibilityState; the ARIA prop works on all three platforms.
      aria-checked={selected}
      disabled={disabled}
      onPress={onPress}
      bg={colors.paper}
      pressedBg={colors.surface}
      style={[styles.card, { borderColor: selected ? colors.ink : colors.line }]}
    >
      <Animated.View style={[styles.well, wellStyle]}>
        <Icon size={22} color={colors.ink} strokeWidth={1.75} />
      </Animated.View>

      <View style={styles.text}>
        <AppText variant="section" helper={option.labelVi}>
          {option.label}
        </AppText>
        <AppText variant="bodySm" helper={option.descriptorVi} style={styles.descriptor}>
          {option.descriptor}
        </AppText>
      </View>

      <View style={[styles.ring, selected ? styles.ringOn : styles.ringOff]}>
        {selected ? <Check size={14} color={colors.paper} strokeWidth={2.25} /> : null}
      </View>
    </Touchable>
  );
}

/** Radiogroup wrapper for the occasion cards. */
export function OccasionGroup({ accessibilityLabel, children }: { accessibilityLabel: string; children: ReactNode }) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} style={styles.group}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 14,
    borderRadius: radii.xxl,
    borderWidth: 1,
  },
  well: { width: WELL, height: WELL, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, minWidth: 0, gap: 6, paddingTop: 2 },
  descriptor: { color: colors.ink },
  ring: { width: RING, height: RING, borderRadius: RING / 2, alignItems: "center", justifyContent: "center", marginTop: 2 },
  // Solid ring (dashed means "empty, tap to add" in this system, not "unselected").
  ringOff: { borderWidth: 1.5, borderColor: colors.line },
  ringOn: { backgroundColor: colors.ink },
});
