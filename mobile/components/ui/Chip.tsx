// Selectable chip (style filter). Selected = ink with paper text + check; lime is
// reserved for the next action and the lit look, so chips never turn lime.
// Wrap a single-choice set in <ChipGroup> (radiogroup semantics).
import { Check, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, radii } from "@/lib/theme";

import { AppText } from "./AppText";
import { Touchable } from "./Touchable";

export interface ChipProps {
  label: string;
  /** Vietnamese helper, spoken after the label and shown inline when showHelper. */
  helper?: string;
  showHelper?: boolean;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  /** "radio" (default, single choice in a ChipGroup), "checkbox" (multi) or "button". */
  role?: "radio" | "checkbox" | "button";
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const HEIGHT = Platform.OS === "android" ? 48 : 44;

export function Chip({ label, helper, showHelper = false, selected, onPress, disabled = false, icon: Icon, role = "radio", style, testID }: ChipProps) {
  const fg = selected ? colors.paper : colors.ink;
  const LeadIcon = selected ? Check : Icon;
  return (
    <Touchable
      testID={testID}
      accessibilityRole={role}
      accessibilityLabel={helper ? `${label}, ${helper}` : label}
      accessibilityState={{ selected, checked: role === "button" ? undefined : selected, disabled }}
      // react-native-web 0.21 drops accessibilityState and reads aria-* only.
      aria-checked={role === "button" ? undefined : selected}
      aria-selected={role === "button" ? selected : undefined}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onPress={onPress}
      bg={selected ? colors.ink : colors.surface}
      pressedBg={selected ? colors.inkWell : colors.surfaceDeep}
      style={[styles.chip, { opacity: disabled ? 0.45 : 1 }, style]}
    >
      {LeadIcon ? <LeadIcon size={16} color={fg} strokeWidth={1.75} /> : null}
      <AppText variant="label" tone={selected ? "paper" : "ink"} helper={showHelper ? helper : undefined} helperInline helperVariant="caption">
        {label}
      </AppText>
    </Touchable>
  );
}

export function ChipGroup({ children, accessibilityLabel, style }: { children: ReactNode; accessibilityLabel: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} style={[styles.group, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: HEIGHT,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  group: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
