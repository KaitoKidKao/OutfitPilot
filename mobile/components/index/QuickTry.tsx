// "Thử nhanh 1 chạm" (home, under the Stylist chat): three sample outfits for the
// user's gender; one tap hangs the outfit on hooks A/B and opens camera setup.
// Sample images only (same data as Mặc gì hôm nay); no user stats.
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Camera, ChevronRight } from "lucide-react-native";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppText, Touchable } from "@/components/ui";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { colors, radii, spacing } from "@/lib/theme";
import { TREND_OUTFITS } from "@/lib/trends";
import { useTryOutfit } from "@/lib/useTryOutfit";

const CARD_W = 148;
const PHOTO_H = 128;

export function QuickTry({ gender }: { gender: "men" | "women" }) {
  const router = useRouter();
  const tryOutfit = useTryOutfit();
  const items = TREND_OUTFITS.filter((o) => o.gender === gender).slice(0, 3);
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap} testID="quick-try">
      <View style={styles.head}>
        <AppText variant="label" weight={800} helper="Thử nhanh 1 chạm">
          Quick try-on
        </AppText>
        <Touchable accessibilityRole="link" accessibilityLabel="Xem tất cả bộ phối" onPress={() => router.push("/trends")} style={styles.more}>
          <AppText variant="caption" weight={700} tone="muted" helper="Xem tất cả">
            See all
          </AppText>
          <ChevronRight size={16} color={colors.muted} strokeWidth={2} />
        </Touchable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroller} contentContainerStyle={styles.row}>
        {items.map((o) => (
          <Touchable
            key={o.id}
            accessibilityRole="button"
            accessibilityLabel={`${o.titleVi}. ${o.tags.join(", ")}. Ảnh mẫu. Chạm để thử ngay`}
            onPress={() => tryOutfit(o)}
            bg={colors.paper}
            pressedBg={colors.surface}
            style={styles.card}
            testID={`quick-${o.id}`}
          >
            <View style={styles.photo}>
              {o.photo ? (
                <Image source={o.photo} style={StyleSheet.absoluteFill} contentFit="cover" />
              ) : (
                <GarmentImage garmentId={o.garments[0]} width="100%" aspectRatio={CARD_W / PHOTO_H} radius={0} showSampleTag={false} />
              )}
              <View style={styles.sample}>
                <AppText variant="tag" weight={700} tone="muted">
                  Mẫu
                </AppText>
              </View>
            </View>
            <View style={styles.meta}>
              <AppText variant="label" weight={800} numberOfLines={1}>
                {o.titleVi}
              </AppText>
              <AppText variant="caption" tone="muted" numberOfLines={1}>
                {o.tags.join(" · ")}
              </AppText>
              <View style={styles.cta}>
                <Camera size={14} color={colors.ink} strokeWidth={2.2} />
                <AppText variant="caption" weight={800}>
                  Thử ngay
                </AppText>
              </View>
            </View>
          </Touchable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.gap },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  more: { flexDirection: "row", alignItems: "center", gap: 2, minHeight: 44, paddingLeft: 8 },
  scroller: { marginHorizontal: -20 },
  row: { paddingHorizontal: 20, gap: 12 },
  card: { width: CARD_W, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line, overflow: "hidden" },
  photo: { width: "100%", height: PHOTO_H, backgroundColor: colors.surface, overflow: "hidden" },
  sample: { position: "absolute", top: 8, left: 8, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: radii.full, paddingHorizontal: 8, paddingVertical: 2 },
  meta: { padding: 8, gap: 2 },
  cta: {
    marginTop: 2,
    minHeight: 34,
    borderRadius: radii.full,
    backgroundColor: colors.lime,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
