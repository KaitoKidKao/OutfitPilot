// Compact, Stylized Occasion Card for Screen 1 (DESIGN.md §6.1 & Impeccable Refinement)
// 2x2 grid layout: compact height, animated lime icon well, tactile radio feedback.
import { Check } from "lucide-react-native";
import { useEffect, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { AppText, Touchable } from "@/components/ui";
import { useLocale } from "@/lib/locale";
import type { OccasionOption } from "@/lib/occasions";
import { colors, motion, radii } from "@/lib/theme";

export interface OccasionCardProps {
  option: OccasionOption;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

const WELL = 36;
const RING = 20;

export function OccasionCard({ option, selected, onPress, disabled = false, testID }: OccasionCardProps) {
  const locale = useLocale();
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

  const label = locale === "vi" ? option.labelVi : option.label;
  const descriptor = locale === "vi" ? option.descriptorVi : option.descriptor;

  return (
    <Touchable
      testID={testID}
      accessibilityRole="radio"
      accessibilityLabel={`${label}. ${descriptor}`}
      accessibilityState={{ selected, checked: selected, disabled }}
      aria-checked={selected}
      disabled={disabled}
      onPress={onPress}
      bg={colors.paper}
      pressedBg={colors.surface}
      style={[
        styles.card,
        {
          borderColor: selected ? colors.ink : colors.line,
          borderWidth: selected ? 1.5 : 1,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Animated.View style={[styles.well, wellStyle]}>
          <Icon size={18} color={colors.ink} strokeWidth={2} />
        </Animated.View>

        <View style={[styles.ring, selected ? styles.ringOn : styles.ringOff]}>
          {selected ? <Check size={12} color={colors.paper} strokeWidth={2.5} /> : null}
        </View>
      </View>

      <View style={styles.textBlock}>
        <AppText variant="label" weight={800} numberOfLines={1}>
          {label}
        </AppText>
        <AppText variant="caption" tone="muted" numberOfLines={1} style={styles.descriptor}>
          {descriptor}
        </AppText>
      </View>
    </Touchable>
  );
}

export function OccasionGroup({ accessibilityLabel, children }: { accessibilityLabel: string; children: ReactNode }) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} style={styles.group}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  card: {
    width: "48.5%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.xl,
    gap: 8,
    minHeight: 74,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  well: {
    width: WELL,
    height: WELL,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    gap: 2,
  },
  descriptor: {
    fontSize: 11,
    lineHeight: 14,
  },
  ring: {
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  ringOff: {
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  ringOn: {
    backgroundColor: colors.ink,
  },
});
