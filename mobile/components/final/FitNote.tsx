// Honest-claims note under the comparison (DESIGN.md §5.5 / §6.5): the try-on is a
// visual simulation; nothing here measures size or fit. Surface tone, radius 18, flat.
import { Info } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, radii } from "@/lib/theme";

export interface FitNoteProps {
  compact?: boolean;
}

export function FitNote({ compact }: FitNoteProps = {}) {
  return (
    <View style={[styles.note, compact ? styles.noteCompact : null]}>
      <Info size={compact ? 14 : 18} color={colors.muted} strokeWidth={1.75} style={compact ? styles.iconCompact : styles.icon} />
      <AppText
        variant={compact ? "caption" : "bodySm"}
        helper="Đây chỉ là mô phỏng hình ảnh. Ứng dụng không đo size và không cam kết độ vừa vặn."
        containerStyle={styles.text}
      >
        Visual simulation only. OutfitPilot does not measure your size or promise how a piece will fit.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 16,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
  },
  noteCompact: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    gap: 8,
  },
  icon: { marginTop: 1 },
  iconCompact: { marginTop: 2 },
  text: { flex: 1 },
});
