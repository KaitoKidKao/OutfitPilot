// Pressable with DESIGN.md press feedback: the background eases to its pressed
// colour in 200 ms (ease-out) and the surface can shrink (dock buttons: 0.96).
// Under reduced motion the change is instant and there is no scale.
// Base for Button, Chip, IconButton, dock buttons and tappable cards.
import type { ReactNode } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { motion } from "@/lib/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Same hue at alpha 0, so a fade from "transparent" does not pass through grey. */
function transparentOf(color: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(color);
  if (!m || !m[1]) return "rgba(0,0,0,0)";
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},0)`;
}

export interface TouchableProps extends Omit<PressableProps, "style" | "children"> {
  /** Resting background colour (use a token from lib/theme colors, or "transparent"). */
  bg?: string;
  /** Background while pressed. Defaults to `bg`. */
  pressedBg?: string;
  /** Scale while pressed, e.g. motion.pressScale (0.96). Default 1 (no scale). */
  pressScale?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export function Touchable({ bg = "transparent", pressedBg, pressScale = 1, style, onPressIn, onPressOut, disabled, children, ...rest }: TouchableProps) {
  const reduced = useReducedMotion();
  const pressed = useSharedValue(0);
  const to = pressedBg ?? bg;
  const from = bg === "transparent" ? transparentOf(to) : bg;
  const scaleTo = reduced ? 1 : pressScale;

  const animated = useAnimatedStyle(() => {
    const p = pressed.get();
    return {
      backgroundColor: from === to ? from : interpolateColor(p, [0, 1], [from, to]),
      transform: [{ scale: 1 - (1 - scaleTo) * p }],
    };
  });

  const animateTo = (value: number) => {
    if (reduced) {
      pressed.set(value);
      return;
    }
    pressed.set(withTiming(value, { duration: motion.duration.color, easing: motion.easing }));
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(e) => {
        animateTo(1);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animateTo(0);
        onPressOut?.(e);
      }}
      style={[style, animated]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
