// Text with the DESIGN.md type ramp, Inter weights, Dynamic Type and separate
// EN / VI locale rendering (renders either English or Vietnamese cleanly, never stacked).
import { Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from "react-native";

import { fontStyle, type FontWeight } from "@/lib/fonts";
import { useLocale } from "@/lib/locale";
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
  helperInline: _helperInline,
  helperTone: _helperTone,
  helperVariant: _helperVariant = "bodySm",
  containerStyle,
  style,
  children,
  allowFontScaling = true,
  maxFontSizeMultiplier,
  accessibilityRole,
  ...rest
}: AppTextProps) {
  const locale = useLocale();
  const t = typeRamp[variant];
  const role = accessibilityRole ?? (HEADER_VARIANTS.includes(variant) ? "header" : undefined);
  const base: TextStyle = { ...textStyle(variant, weight, tabular), color: TONE[tone], textAlign: align };
  const scale = maxFontSizeMultiplier ?? t.maxScale;
  const content = locale === "vi" && helper ? helper : children;

  const main = (
    <Text allowFontScaling={allowFontScaling} maxFontSizeMultiplier={scale} accessibilityRole={role} style={[base, style]} {...rest}>
      {content}
    </Text>
  );
  if (!containerStyle) return main;

  return <View style={containerStyle}>{main}</View>;
}
