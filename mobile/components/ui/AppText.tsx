// Text with the DESIGN.md type ramp, Inter weights, Dynamic Type and the
// bilingual rule (English primary, Vietnamese helper smaller and muted).
import { Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from "react-native";

import { fontStyle, type FontWeight } from "@/lib/fonts";
import { colors, typeRamp, type TypeVariant } from "@/lib/theme";

export type TextTone = "ink" | "muted" | "paper" | "mutedDark" | "lime" | "limeInk" | "danger";

const TONE: Record<TextTone, string> = {
  ink: colors.ink,
  muted: colors.muted,
  paper: colors.paper,
  mutedDark: colors.mutedDark,
  lime: colors.lime,
  limeInk: colors.limeInk,
  danger: colors.danger,
};

const HEADER_VARIANTS: readonly TypeVariant[] = ["display", "headline", "title"];

export interface AppTextProps extends TextProps {
  /** Type ramp entry. Default "body". */
  variant?: TypeVariant;
  /** Colour token. Default "ink" (use "paper" on dark surfaces). */
  tone?: TextTone;
  /** Override the variant's weight. */
  weight?: FontWeight;
  align?: TextStyle["textAlign"];
  /** Force tabular numerals (prices, counts, seconds). Studio variants already have it. */
  tabular?: boolean;
  /**
   * Vietnamese helper line. Rendered under the main text as bodySm in `helperTone`
   * (or inline after " · " when helperInline). Both lines stay readable by screen readers.
   */
  helper?: string;
  helperInline?: boolean;
  /** Default: "muted" on light tones, "mutedDark" when tone is "paper". */
  helperTone?: TextTone;
  /** Helper variant. Default "bodySm". */
  helperVariant?: TypeVariant;
  /** Style of the wrapper View when a stacked helper is rendered. */
  containerStyle?: StyleProp<ViewStyle>;
}

/** Resolved TextStyle for a variant + weight. Call at render time (fonts load late). */
export function textStyle(variant: TypeVariant, weight?: FontWeight, tabular?: boolean): TextStyle {
  const t = typeRamp[variant];
  return {
    fontSize: t.fontSize,
    lineHeight: t.lineHeight,
    letterSpacing: t.letterSpacing,
    ...fontStyle(weight ?? t.weight),
    ...(t.tabular || tabular ? { fontVariant: ["tabular-nums"] } : null),
  };
}

export function AppText({
  variant = "body",
  tone = "ink",
  weight,
  align,
  tabular,
  helper,
  helperInline,
  helperTone,
  helperVariant = "bodySm",
  containerStyle,
  style,
  children,
  allowFontScaling = true,
  maxFontSizeMultiplier,
  accessibilityRole,
  ...rest
}: AppTextProps) {
  const t = typeRamp[variant];
  const role = accessibilityRole ?? (HEADER_VARIANTS.includes(variant) ? "header" : undefined);
  const hTone = helperTone ?? (tone === "paper" ? "mutedDark" : "muted");
  const base: TextStyle = { ...textStyle(variant, weight, tabular), color: TONE[tone], textAlign: align };
  const scale = maxFontSizeMultiplier ?? t.maxScale;

  if (helper && helperInline) {
    return (
      <Text
        allowFontScaling={allowFontScaling}
        maxFontSizeMultiplier={scale}
        accessibilityRole={role}
        style={[base, style]}
        {...rest}
      >
        {children}
        <Text style={[textStyle(helperVariant), { color: TONE[hTone] }]}>{` · ${helper}`}</Text>
      </Text>
    );
  }

  const main = (
    <Text allowFontScaling={allowFontScaling} maxFontSizeMultiplier={scale} accessibilityRole={role} style={[base, style]} {...rest}>
      {children}
    </Text>
  );
  if (!helper) return main;

  return (
    <View style={[{ gap: 2 }, containerStyle]}>
      {main}
      <Text
        allowFontScaling={allowFontScaling}
        maxFontSizeMultiplier={typeRamp[helperVariant].maxScale}
        style={[textStyle(helperVariant), { color: TONE[hTone], textAlign: align }]}
      >
        {helper}
      </Text>
    </View>
  );
}
