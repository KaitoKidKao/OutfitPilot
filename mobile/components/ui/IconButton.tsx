// Square (radius 14) or round icon-only button. Always 44 pt (iOS) / 48 dp (Android).
//  - ghost:  transparent, pressed surface (Back, Close on light screens)
//  - quiet:  surface, pressed surface-deep
//  - onDark: studio overlay circle, pressed lighter (exit / flip camera over video)
import type { LucideIcon } from "lucide-react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { alpha, colors, MIN_TARGET, radii } from "@/lib/theme";

import { Touchable } from "./Touchable";

export type IconButtonVariant = "ghost" | "quiet" | "onDark";

const SPEC: Record<IconButtonVariant, { bg: string; pressedBg: string; fg: string; radius: number }> = {
  ghost: { bg: "transparent", pressedBg: colors.surface, fg: colors.ink, radius: radii.md },
  quiet: { bg: colors.surface, pressedBg: colors.surfaceDeep, fg: colors.ink, radius: radii.md },
  onDark: { bg: alpha.studioOverlay, pressedBg: colors.inkLine, fg: colors.paper, radius: radii.full },
};

export interface IconButtonProps {
  icon: LucideIcon;
  /** Required: icon-only controls must say what they do. */
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress: () => void;
  variant?: IconButtonVariant;
  disabled?: boolean;
  /** Toggle buttons: pass selected to expose accessibilityState.selected. */
  selected?: boolean;
  /** Icon size. Default 22. */
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function IconButton({
  icon: Icon,
  accessibilityLabel,
  accessibilityHint,
  onPress,
  variant = "ghost",
  disabled = false,
  selected,
  iconSize = 22,
  style,
  testID,
}: IconButtonProps) {
  const spec = SPEC[variant];
  return (
    <Touchable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, ...(selected !== undefined ? { selected } : null) }}
      disabled={disabled}
      onPress={onPress}
      bg={spec.bg}
      pressedBg={spec.pressedBg}
      style={[
        {
          width: MIN_TARGET,
          height: MIN_TARGET,
          borderRadius: spec.radius,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      <Icon size={iconSize} color={spec.fg} strokeWidth={1.75} />
    </Touchable>
  );
}
