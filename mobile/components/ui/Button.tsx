// DESIGN.md Buttons: next (lime), ink, quiet, ghost, onDark (+ danger for remove).
// One lime action per screen: normally that is the dock centre, so "next" is for the
// rare next action that lives outside the dock (empty or error states).
import type { LucideIcon } from "lucide-react-native";
import { ActivityIndicator, Platform, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, MIN_TARGET, radii } from "@/lib/theme";

import { AppText } from "./AppText";
import { Touchable } from "./Touchable";

export type ButtonVariant = "next" | "lime" | "ink" | "quiet" | "ghost" | "onDark" | "danger";

interface VariantSpec {
  bg: string;
  pressedBg: string;
  text: "ink" | "paper" | "danger";
  height: number;
  radius: number;
  paddingX: number;
  textVariant: "button" | "label";
}

const ANDROID = Platform.OS === "android";

const VARIANTS: Record<Exclude<ButtonVariant, "lime">, VariantSpec> = {
  next: { bg: colors.lime, pressedBg: colors.limePress, text: "ink", height: 48, radius: radii.md, paddingX: 20, textVariant: "button" },
  ink: { bg: colors.ink, pressedBg: colors.inkWell, text: "paper", height: 52, radius: radii.lg, paddingX: 20, textVariant: "button" },
  quiet: { bg: colors.surface, pressedBg: colors.surfaceDeep, text: "ink", height: ANDROID ? 48 : 44, radius: radii.md, paddingX: 14, textVariant: "label" },
  ghost: { bg: "transparent", pressedBg: colors.surface, text: "ink", height: ANDROID ? 48 : 44, radius: radii.md, paddingX: 14, textVariant: "label" },
  onDark: { bg: colors.paper, pressedBg: colors.surfaceDeep, text: "ink", height: ANDROID ? 48 : 44, radius: radii.full, paddingX: 16, textVariant: "label" },
  danger: { bg: colors.surface, pressedBg: colors.dangerSoft, text: "danger", height: ANDROID ? 48 : 44, radius: radii.md, paddingX: 14, textVariant: "label" },
};

export interface ButtonProps {
  label: string;
  onPress: () => void;
  /** Default "quiet". "lime" is an alias of "next". */
  variant?: ButtonVariant;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
  /** Spoken (and shown) while loading. Default: label. */
  loadingLabel?: string;
  disabled?: boolean;
  /** Stretch to the parent width. */
  fullWidth?: boolean;
  /** Defaults to `label`. Add the Vietnamese only if the label shows it. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = "quiet",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  loadingLabel,
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: ButtonProps) {
  const spec = VARIANTS[variant === "lime" ? "next" : variant];
  const inactive = disabled || loading;
  const fg = spec.text === "paper" ? colors.paper : spec.text === "danger" ? colors.danger : colors.ink;
  const shown = loading && loadingLabel ? loadingLabel : label;
  const iconNode = Icon ? <Icon size={18} color={fg} strokeWidth={1.75} /> : null;

  return (
    <Touchable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={loading ? (loadingLabel ?? accessibilityLabel ?? label) : (accessibilityLabel ?? label)}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      bg={spec.bg}
      pressedBg={spec.pressedBg}
      hitSlop={spec.height < MIN_TARGET ? (MIN_TARGET - spec.height) / 2 : undefined}
      style={[
        {
          minHeight: spec.height,
          borderRadius: spec.radius,
          paddingHorizontal: spec.paddingX,
          paddingVertical: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          alignSelf: fullWidth ? "stretch" : "flex-start",
          opacity: disabled && !loading ? 0.45 : 1,
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={fg} /> : iconPosition === "left" ? iconNode : null}
      <View style={{ flexShrink: 1 }}>
        <AppText variant={spec.textVariant} tone={spec.text} align="center">
          {shown}
        </AppText>
      </View>
      {!loading && iconPosition === "right" ? iconNode : null}
    </Touchable>
  );
}
