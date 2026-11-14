// One pick on Screen 2 (DESIGN.md §6.2): a large 4:5 garment photo with the Sample
// tag and the A/B slot badge, then the garment name, its role (Best match /
// Alternative), the stylist's one-line reason and the "Pair with" suggestion.
//
// The whole card is one button: tapping it selects this look and lights its dock
// hook (a tap on the hook does the same, plus scrolls here). The active card carries a 2 pt ink
// ring and a lime slot badge; the other card's badge is ink (DESIGN.md Chips).
import type { LayoutChangeEvent } from "react-native";
import { Platform, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Camera } from "lucide-react-native";

import { AppText, GarmentImage, Touchable } from "@/components/ui";
import type { Recommendation } from "@/lib/api";
import { getGarment } from "@/lib/catalog";
import { getInitialMatchingPants } from "@/lib/closet";
import { tr, useLocale } from "@/lib/locale";
import { reasonWithoutName } from "@/lib/reasonText";
import type { Slot } from "@/lib/store";
import { colors, radii, spacing } from "@/lib/theme";

import { SLOT_ROLE, slotName } from "./copy";

export interface LookCardProps {
  slot: Slot;
  pick: Recommendation;
  active: boolean;
  onPress: (slot: Slot) => void;
  onTrySingle?: (slot: Slot) => void;
  onLayout?: (e: LayoutChangeEvent) => void;
  testID?: string;
}

const RING = 2;
const RING_GAP = 2;

export function LookCard({ slot, pick, active, onPress, onTrySingle, onLayout, testID }: LookCardProps) {
  const locale = useLocale();
  const garment = getGarment(pick.garmentId);
  const role = SLOT_ROLE[slot];
  const name = slotName(slot);
  const reason = reasonWithoutName(pick.reason, garment.name);
  const matchingPants = getInitialMatchingPants(pick.garmentId);

  return (
    <Touchable
      testID={testID}
      onLayout={onLayout}
      onPress={() => onPress(slot)}
      accessibilityRole={Platform.OS === "web" ? undefined : "button"}
      accessibilityState={{ selected: active }}
      aria-selected={active}
      accessibilityLabel={`${name}, ${role.en}: ${garment.name}${garment.sample ? ", sample photo" : ""}. ${reason} Pair with ${pick.pairWith}.`}
      accessibilityHint={active ? "Selected. Its hook is lit on the dock." : "Selects this look and lights its hook on the dock."}
      bg={colors.paper}
      pressedBg={colors.surface}
      style={styles.card}
    >
      <View style={[styles.ring, { borderColor: active ? colors.ink : "transparent" }]}>
        <GarmentImage garmentId={pick.garmentId} radius={radii.xxl} accessibilityLabel="">
          <View
            style={[styles.badge, { backgroundColor: active ? colors.lime : colors.ink }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <AppText variant="section" weight={800} tone={active ? "ink" : "paper"} maxFontSizeMultiplier={1.2}>
              {slot.toUpperCase()}
            </AppText>
          </View>
        </GarmentImage>
      </View>

      <View style={styles.body} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={styles.nameBlock}>
          <AppText variant="title" accessibilityRole="none">
            {garment.name}
          </AppText>
          <AppText variant="label" tone={active ? "limeInk" : "muted"} helper={`${name} · ${role.vi}`} helperInline>
            {`${name} · ${role.en}`}
          </AppText>
        </View>

        <AppText variant="body">{reason}</AppText>

        <View style={styles.pair}>
          <AppText variant="label" helper="Phối cùng" helperInline>
            Pair with
          </AppText>
          <AppText variant="bodySm" tone="muted">
            {pick.pairWith}
          </AppText>

          {matchingPants.length > 0 ? (
            <View style={styles.pantsBox}>
              <AppText variant="caption" weight={700} tone="ink">
                {tr(locale, "Compatible in your closet:", "Đồ phối sẵn trong tủ đồ:")}
              </AppText>
              <View style={styles.pantsRow}>
                {matchingPants.slice(0, 2).map((p) => (
                  <View key={p.id} style={styles.pantsPill}>
                    {p.image ? (
                      <Image source={p.image} contentFit="cover" style={styles.pantsThumb} />
                    ) : null}
                    <View style={styles.pantsMeta}>
                      <AppText variant="caption" weight={700} numberOfLines={1}>
                        {locale === "vi" ? p.nameVi : p.name}
                      </AppText>
                      <AppText variant="caption" tone="muted" numberOfLines={1}>
                        {p.status === "owned"
                          ? tr(locale, "In your closet", "Đã có trong tủ")
                          : tr(locale, "Wishlist", "Đang thích")}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          {onTrySingle ? (
            <Touchable
              onPress={() => onTrySingle(slot)}
              bg={active ? colors.lime : colors.surface}
              pressedBg={active ? colors.limePress : colors.surfaceDeep}
              style={styles.singleTryBtn}
              accessibilityRole={Platform.OS === "web" ? undefined : "button"}
              accessibilityLabel={tr(locale, `Try Look ${slot.toUpperCase()} only`, `Thử riêng Look ${slot.toUpperCase()}`)}
            >
              <Camera size={14} color={colors.ink} strokeWidth={2.4} />
              <AppText variant="caption" weight={800} tone="ink">
                {tr(locale, `Try Look ${slot.toUpperCase()}`, `Thử Look ${slot.toUpperCase()}`)}
              </AppText>
            </Touchable>
          ) : null}
        </View>
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.hero + RING_GAP, padding: RING_GAP, marginHorizontal: -(RING + RING_GAP * 2) },
  ring: { borderWidth: RING, borderRadius: radii.hero, padding: RING_GAP },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    minWidth: 36,
    height: 36,
    paddingHorizontal: 6,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { paddingHorizontal: RING + RING_GAP, paddingTop: 14, paddingBottom: 10, gap: spacing.gap },
  nameBlock: { gap: 2 },
  pair: {
    gap: 6,
    paddingTop: spacing.gap,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  pantsBox: {
    marginTop: 6,
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    gap: 8,
  },
  pantsRow: {
    flexDirection: "row",
    gap: 8,
  },
  pantsPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.paper,
    padding: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pantsThumb: {
    width: 36,
    height: 44,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: colors.surfaceDeep,
  },
  pantsMeta: {
    flex: 1,
    justifyContent: "center",
  },
  singleTryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
  },
});
