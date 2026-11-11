// The read-from-across-the-room layer: a 112 pt lime A/B letter, the garment name
// and, while the AI is live, the seconds left of the 120 s cap (44 pt, tabular).
// Fixed size on purpose (studio numerals ignore font scale; the spoken label carries it all).
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui";
import type { DockSlot } from "@/components/FittingDock";
import { alpha } from "@/lib/theme";

export interface StudioHudProps {
  slot: DockSlot;
  garmentName: string | null;
  /** null hides the countdown (no paid session running). */
  secondsLeft: number | null;
  /** When false (e.g. single item try-on), hides the giant 112pt A/B letter. Default true. */
  showLetter?: boolean;
}

export function StudioHud({ slot, garmentName, secondsLeft, showLetter = true }: StudioHudProps) {
  const letter = slot.toUpperCase();
  const spoken = [
    showLetter ? `Showing Look ${letter}${garmentName ? `, ${garmentName}` : ""}.` : `Showing ${garmentName ?? "garment"}.`,
    secondsLeft !== null ? `${secondsLeft} seconds left in the AI session.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <View style={styles.hud} accessible accessibilityLabel={spoken} pointerEvents="none">
      {showLetter ? (
        <AppText variant="studioNumeral" tone="lime" style={styles.shadow} accessibilityElementsHidden importantForAccessibility="no">
          {letter}
        </AppText>
      ) : null}
      {garmentName ? (
        <AppText variant="label" tone="paper" numberOfLines={2} maxFontSizeMultiplier={1.3} style={[styles.name, styles.shadow]}>
          {garmentName}
        </AppText>
      ) : null}
      {secondsLeft !== null ? (
        <View style={styles.secondsRow}>
          <AppText variant="studioSeconds" tone="paper" style={styles.shadow}>
            {secondsLeft}
          </AppText>
          <AppText variant="label" tone="mutedDark" helper="giây còn lại" maxFontSizeMultiplier={1.3} style={styles.shadow}>
            s left
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hud: { alignSelf: "flex-start", gap: 4, paddingTop: 8 },
  name: { maxWidth: 168 },
  secondsRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 6 },
  // Keeps lime / white legible over a bright camera frame.
  shadow: { textShadowColor: alpha.studioOverlay, textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },
});
