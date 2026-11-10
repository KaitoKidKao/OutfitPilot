// Studio status chip (DESIGN.md Chips): dark translucent pill, state dot, label and
// an honest AI tag. "AI OFF" until a remote AI stream exists; "AI LIVE" only then.
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { alpha, colors, radii } from "@/lib/theme";

import { AppText } from "./AppText";

export type StatusDot = "live" | "on" | "off" | "warn";

const DOT: Record<StatusDot, string> = {
  live: colors.lime, // AI stream live / camera running
  on: colors.paper, // camera on, AI off
  off: colors.mutedDark, // nothing running
  warn: colors.danger, // connection lost
};

export interface StatusPillProps {
  /** e.g. "Camera preview", "Connecting to AI", "Live AI try-on", "Switching look", "Connection lost". */
  label: string;
  labelVi?: string;
  dot?: StatusDot;
  /** "off" shows "AI OFF", "live" shows "AI LIVE", null hides the tag. */
  ai?: "off" | "live" | null;
  /** Override the tag text, e.g. "AI OFF · preview only". */
  aiLabel?: string;
  aiLabelVi?: string;
  style?: StyleProp<ViewStyle>;
}

export function StatusPill({ label, labelVi, dot = "off", ai = null, aiLabel, aiLabelVi, style }: StatusPillProps) {
  const tag = ai ? (aiLabel ?? (ai === "live" ? "AI LIVE" : "AI OFF")) : null;
  const tagVi = ai ? (aiLabelVi ?? (ai === "live" ? "AI TRỰC TIẾP" : "AI TẮT")) : undefined;
  return (
    <View
      style={[styles.pill, style]}
      accessible
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      accessibilityLabel={tag ? `Status: ${label}. ${tag}` : `Status: ${label}`}
    >
      <View style={[styles.dot, { backgroundColor: DOT[dot] }]} />
      <AppText variant="label" tone="paper" helper={labelVi} numberOfLines={1} maxFontSizeMultiplier={1.3} style={styles.label}>
        {label}
      </AppText>
      {tag ? (
        <AppText variant="tag" weight={800} tone="lime" helper={tagVi} numberOfLines={1} maxFontSizeMultiplier={1.3}>
          {tag}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    backgroundColor: alpha.studioOverlay,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { flexShrink: 1 },
});
