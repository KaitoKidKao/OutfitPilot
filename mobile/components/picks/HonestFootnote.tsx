// Footnote under the picks (DESIGN.md §5.5, §9): the try-on is a visual preview,
// not a size or fit check, and the photos are stand-in samples with provenance.
import { Info } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui";
import { getGarment, type GarmentId } from "@/lib/catalog";
import { colors, spacing } from "@/lib/theme";

export function HonestFootnote({ garmentIds }: { garmentIds: readonly GarmentId[] }) {
  const credits = garmentIds
    .map((id) => getGarment(id))
    .filter((g) => g.sample && g.credit)
    .map((g) => `${g.name}: ${g.credit!.author} / ${g.credit!.source}`);

  return (
    <View style={styles.root}>
      <Info size={18} color={colors.muted} strokeWidth={1.75} />
      <View style={styles.text}>
        <AppText variant="bodySm" weight={600} helper="Chỉ là xem trước bằng hình ảnh, không bảo đảm kích cỡ hay độ vừa vặn.">
          Visual preview only. The try-on can&apos;t tell your size or how a piece will fit, so check the store&apos;s size guide before you buy.
        </AppText>
        {credits.length ? (
          <AppText variant="caption" tone="muted">
            {`Sample photos, not the exact product. ${credits.join(" · ")}.`}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingTop: spacing.stack,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  text: { flex: 1, gap: 6 },
});
