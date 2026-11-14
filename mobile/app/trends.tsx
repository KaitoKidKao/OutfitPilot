// "Mặc gì hôm nay": a 2-column feed of SAMPLE outfits (Sang, 14/11, Grab-style
// "Đi đâu ăn gì" grid). Honest by design: a header note and a "Mẫu" tag on every
// card say these are sample outfits; no usernames or view counts are invented.
// Tapping a card hangs its garments on hooks A/B and opens camera setup, so the
// existing try-on flow runs unchanged.
import { Image } from "expo-image";
import { Camera, Info } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { NavBar } from "@/components/NavBar";
import { AppText, Screen, TopBar, Touchable } from "@/components/ui";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { getGarment } from "@/lib/catalog";
import { colors, radii, spacing } from "@/lib/theme";
import { TREND_OUTFITS, type TrendOutfit } from "@/lib/trends";
import { useTryOutfit } from "@/lib/useTryOutfit";

const GAP = 12;
const MAX_CONTENT = 440;
const GUTTER = 20;

type Filter = "all" | "women" | "men";

export default function Trends() {
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<Filter>("all");

  const content = Math.min(width - GUTTER * 2, MAX_CONTENT);
  const cardW = Math.floor((content - GAP) / 2);
  const items = TREND_OUTFITS.filter((o) => filter === "all" || o.gender === filter);

  const tryOutfit = useTryOutfit();

  const left = items.filter((_, i) => i % 2 === 0);
  const right = items.filter((_, i) => i % 2 === 1);

  const renderCard = (o: TrendOutfit, i: number) => {
    // Vary the photo height a little for a natural two-column rhythm.
    const tall = i % 2 === 0;
    const photoH = Math.round(cardW * (tall ? 1.3 : 1.1));
    return (
      <Touchable
        key={o.id}
        accessibilityRole="button"
        accessibilityLabel={`${o.titleVi}. ${o.tags.join(", ")}. Ảnh mẫu. Chạm để thử ngay`}
        onPress={() => tryOutfit(o)}
        bg={colors.paper}
        pressedBg={colors.surface}
        style={[styles.card, { width: cardW }]}
        testID={`trend-${o.id}`}
      >
        <View style={[styles.photo, { height: photoH }]}>
          {o.photo ? (
            <Image source={o.photo} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <GarmentImage garmentId={o.garments[0]} width="100%" aspectRatio={cardW / photoH} radius={0} showSampleTag={false} />
          )}
          <View style={styles.sampleTag}>
            <AppText variant="tag" weight={700} tone="muted">
              Mẫu
            </AppText>
          </View>
          <View style={styles.tryPill}>
            <Camera size={14} color={colors.ink} strokeWidth={2.2} />
          </View>
        </View>
        <View style={styles.meta}>
          <AppText variant="label" weight={800} numberOfLines={2}>
            {o.titleVi}
          </AppText>
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {o.garments.length} món · {o.garments.map((g) => getGarment(g).nameVi ?? getGarment(g).name)[0]}
          </AppText>
          <View style={styles.tags}>
            {o.tags.map((t) => (
              <View key={t} style={styles.tag}>
                <AppText variant="tag" weight={700} tone="ink">
                  {t}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      </Touchable>
    );
  };

  return (
    <Screen
      testID="trends-screen"
      header={<TopBar title="What to wear today" titleVi="Mặc gì hôm nay" showBack={false} />}
      overlay={<NavBar active="trends" />}
    >
      <View style={styles.note}>
        <Info size={16} color={colors.muted} strokeWidth={2} />
        <AppText variant="caption" tone="muted" style={styles.flex}>
          Bộ phối mẫu do OutfitPilot chuẩn bị để bạn lấy cảm hứng. Chạm một bộ để thử ngay lên người.
        </AppText>
      </View>

      <View style={styles.filters}>
        {(
          [
            ["all", "Tất cả"],
            ["women", "Nữ"],
            ["men", "Nam"],
          ] as const
        ).map(([key, label]) => {
          const on = filter === key;
          return (
            <Touchable
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={label}
              onPress={() => setFilter(key)}
              bg={on ? colors.ink : colors.surface}
              pressedBg={on ? colors.ink : colors.surfaceDeep}
              style={styles.filter}
            >
              <AppText variant="label" weight={700} tone={on ? "paper" : "ink"}>
                {label}
              </AppText>
            </Touchable>
          );
        })}
      </View>

      <View style={styles.grid}>
        <View style={styles.col}>{left.map((o, i) => renderCard(o, i * 2))}</View>
        <View style={styles.col}>{right.map((o, i) => renderCard(o, i * 2 + 1))}</View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  note: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: spacing.gap,
  },
  filters: { flexDirection: "row", gap: 8, marginBottom: spacing.gap },
  filter: { minHeight: 40, paddingHorizontal: 16, borderRadius: radii.full, alignItems: "center", justifyContent: "center" },
  grid: { flexDirection: "row", gap: GAP, alignItems: "flex-start" },
  col: { flex: 1, gap: GAP },
  card: {
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
  },
  photo: { width: "100%", backgroundColor: colors.surface, overflow: "hidden" },
  sampleTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tryPill: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lime,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: { padding: 10, gap: 4 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 2 },
  tag: { backgroundColor: colors.limeSoft ?? colors.surface, borderRadius: radii.full, paddingHorizontal: 8, paddingVertical: 2 },
});
