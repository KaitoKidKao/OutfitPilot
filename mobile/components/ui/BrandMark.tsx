// "OP" mark (lime on ink, radius 10) + "OutfitPilot" wordmark (DESIGN.md §6.1).
import { StyleSheet, View } from "react-native";

import { colors } from "@/lib/theme";

import { AppText } from "./AppText";

export function BrandMark({ showName = true }: { showName?: boolean }) {
  return (
    <View style={styles.row} accessible accessibilityRole="header" accessibilityLabel="OutfitPilot">
      <View style={styles.mark}>
        <AppText variant="label" weight={800} tone="lime" maxFontSizeMultiplier={1.2} style={styles.markText}>
          OP
        </AppText>
      </View>
      {showName ? (
        <AppText variant="section" maxFontSizeMultiplier={1.3}>
          OutfitPilot
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  mark: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  markText: { fontSize: 14, letterSpacing: -0.2 },
});
