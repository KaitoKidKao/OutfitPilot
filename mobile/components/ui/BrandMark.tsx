// "OP" mark (lime on ink, radius 10) + "OutfitPilot" wordmark (DESIGN.md §6.1).
// Long-press triggers pre-stage diagnostics when onLongPress is provided.
import { StyleSheet, View } from "react-native";

import { colors } from "@/lib/theme";

import { AppText } from "./AppText";
import { Touchable } from "./Touchable";

export function BrandMark({
  showName = true,
  onLongPress,
}: {
  showName?: boolean;
  onLongPress?: () => void;
}) {
  const content = (
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

  if (onLongPress) {
    return (
      <Touchable
        onLongPress={onLongPress}
        delayLongPress={1800}
        accessibilityHint="Nhấn giữ để mở bảng kiểm tra trước sân khấu"
      >
        {content}
      </Touchable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  mark: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  markText: { fontSize: 14, letterSpacing: -0.2 },
});
