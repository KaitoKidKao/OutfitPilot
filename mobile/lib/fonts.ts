// Inter, bundled per weight from @expo-google-fonts/inter (full Latin Extended +
// Vietnamese glyphs; checked: ặ ẩ ữ ỡ ộ đ Ư ơ ẫ ỷ ẹ are all in the cmap).
// Loaded once in app/_layout.tsx with useFonts; the splash screen stays up until
// fonts load or fail. If they fail (or take too long), every text falls back to
// the system font (SF Pro / Roboto) with the same numeric weight. Never a blank screen.
//
// Each weight is registered as its own family name. That is the only mapping that
// renders the right weight on Android, iOS and web alike, so fontWeight is NOT set
// while Inter is active (Android would otherwise synthesize or ignore it).
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { Inter_800ExtraBold } from "@expo-google-fonts/inter/800ExtraBold";
import type { TextStyle } from "react-native";

export type FontWeight = 400 | 500 | 600 | 700 | 800;

export const INTER_FAMILY: Record<FontWeight, string> = {
  400: "Inter_400Regular",
  500: "Inter_500Medium",
  600: "Inter_600SemiBold",
  700: "Inter_700Bold",
  800: "Inter_800ExtraBold",
};

/** Map passed to useFonts() in app/_layout.tsx. */
export const INTER_FONT_MAP = {
  [INTER_FAMILY[400]]: Inter_400Regular,
  [INTER_FAMILY[500]]: Inter_500Medium,
  [INTER_FAMILY[600]]: Inter_600SemiBold,
  [INTER_FAMILY[700]]: Inter_700Bold,
  [INTER_FAMILY[800]]: Inter_800ExtraBold,
} as const;

let interReady = false;
let decided = false;

/**
 * Called by app/_layout.tsx before the app renders. The first call wins, so a late
 * font load after the timeout never mixes Inter and system text on screen.
 */
export function setInterReady(ready: boolean): void {
  if (decided) return;
  decided = true;
  interReady = ready;
}

export function isInterReady(): boolean {
  return interReady;
}

/**
 * Font style for a weight. Call at render time (not in a module-level StyleSheet),
 * because fonts finish loading after modules are evaluated.
 */
export function fontStyle(weight: FontWeight): TextStyle {
  if (interReady) return { fontFamily: INTER_FAMILY[weight] };
  return { fontWeight: String(weight) as TextStyle["fontWeight"] };
}
