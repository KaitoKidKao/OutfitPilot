// "Saved N" quiet button for the brand row (DESIGN.md Buttons: quiet = surface,
// 13/600, 44 tall). Built on Touchable instead of <Button> so the count can use
// tabular numerals (DESIGN.md Tabular Facts Rule). Opens the SavedSheet.
import { Bookmark } from "lucide-react-native";
import { StyleSheet } from "react-native";

import { AppText, Touchable } from "@/components/ui";
import { colors, MIN_TARGET, radii } from "@/lib/theme";

export interface SavedButtonProps {
  /** null while saved looks are still being read from the device. */
  count: number | null;
  onPress: () => void;
}

export function SavedButton({ count, onPress }: SavedButtonProps) {
  const spoken =
    count === null ? "Saved looks" : count === 0 ? "Saved looks, none yet" : `Saved looks, ${count} saved`;
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={spoken}
      accessibilityHint="Opens the looks you kept on this phone"
      onPress={onPress}
      bg={colors.surface}
      pressedBg={colors.surfaceDeep}
      style={styles.button}
    >
      <Bookmark size={18} color={colors.ink} strokeWidth={1.75} />
      <AppText variant="label" helper="Đã lưu">
        Saved
      </AppText>
      {count !== null ? (
        <AppText variant="label" weight={700} tabular style={styles.count}>
          {count}
        </AppText>
      ) : null}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TARGET,
    minWidth: MIN_TARGET,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  count: { minWidth: 8, textAlign: "center" },
});
