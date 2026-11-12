// Final Look (DESIGN.md §6.5): one side of the A | B comparison. Photo first (4:5,
// radius 20, Sample tag), a slot letter badge hanging on the photo, then the garment
// name, the stylist's reason, the pair-with line and an honest source label.
// Flat on paper (no card chrome): the photo is the hero, the text sits under it.
//
// layout "column" = the default two-up comparison. layout "row" is used when the text
// is scaled up (font scale >= 1.35) or the screen is very narrow: photo left, text right,
// so long reasons never squeeze into a 150 pt column.
import { Check, ShieldCheck, Tag } from "lucide-react-native";
import { useEffect, type ReactNode } from "react";
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

import { AppText } from "@/components/ui/AppText";
import { GarmentImage } from "@/components/ui/GarmentImage";
import type { Recommendation, StyleSource } from "@/lib/api";
import { getGarment } from "@/lib/catalog";
import { getInitialClosetItem, getInitialMatchingPants } from "@/lib/closet";
import { tr, useLocale } from "@/lib/locale";
import { SOURCE_LABEL } from "@/lib/occasions";
import { reasonWithoutName } from "@/lib/reasonText";
import type { Slot } from "@/lib/store";
import { colors, motion, radii, spacing } from "@/lib/theme";

export interface LookColumnProps {
  slot: Slot;
  pick: Recommendation;
  source: StyleSource | "closet";
  /** This garment is already saved for the current occasion. */
  saved: boolean;
  layout?: "column" | "row";
  /** When false (e.g. single item try-on), hides the slot letter badge. Default true. */
  showBadge?: boolean;
}

const BADGE = 32;
const ROW_PHOTO_WIDTH = 128;

export function LookColumn({ slot, pick, source, saved, layout = "column", showBadge = true }: LookColumnProps) {
  const locale = useLocale();
  const garment = getGarment(pick.garmentId);
  const closetItem = getInitialClosetItem(pick.garmentId);
  const matchingPants = getInitialMatchingPants(pick.garmentId);
  const letter = slot.toUpperCase();
  const label = SOURCE_LABEL[source];
  const row = layout === "row";
  const reason = reasonWithoutName(pick.reason, garment.name);

  return (
    <Rise delay={slot === "a" ? 0 : 70} style={row ? styles.row : styles.column}>
      <GarmentImage
        garmentId={pick.garmentId}
        width={row ? ROW_PHOTO_WIDTH : "100%"}
        accessibilityLabel={showBadge ? `Look ${letter}: ${garment.name}${garment.sample ? ", sample photo" : ""}` : `${garment.name}${garment.sample ? ", sample photo" : ""}`}
      >
        {showBadge ? (
          <View
            style={[styles.badge, { backgroundColor: saved ? colors.lime : colors.ink }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <AppText variant="section" weight={800} tone={saved ? "ink" : "paper"} maxFontSizeMultiplier={1.15}>
              {letter}
            </AppText>
          </View>
        ) : null}
      </GarmentImage>

      <View style={styles.text}>
        <AppText variant="section" numberOfLines={1} accessibilityRole="header" accessibilityLabel={`Look ${letter}, ${garment.name}`}>
          {garment.name}
        </AppText>

        <AppText variant="bodySm" numberOfLines={3}>{reason}</AppText>

        <AppText variant="bodySm" tone="muted" numberOfLines={2}>
          <AppText variant="bodySm" weight={600} tone="ink" helper="Phối cùng: ">
            Pair with:{" "}
          </AppText>
          {pick.pairWith}
        </AppText>

        {closetItem?.fitAdvice ? (
          <View style={styles.fitAdviceBox}>
            <ShieldCheck size={12} color={colors.limeInk} strokeWidth={2.2} />
            <AppText variant="caption" tone="muted" style={styles.fitAdviceText}>
              {closetItem.fitAdvice}
            </AppText>
          </View>
        ) : null}

        {closetItem?.price ? (
          <View style={styles.priceRow}>
            <Tag size={12} color={colors.muted} />
            <AppText variant="caption" weight={700} tone="ink">
              {closetItem.price}
            </AppText>
            {closetItem.shop ? (
              <AppText variant="caption" tone="muted">
                · {closetItem.shop}
              </AppText>
            ) : null}
          </View>
        ) : null}

        <AppText
          variant="caption"
          weight={600}
          tone={source === "llm" ? "limeInk" : "muted"}
          helper={label.labelVi}
          helperInline
          helperVariant="caption"
        >
          {label.label}
        </AppText>

        {saved ? (
          <View style={styles.saved} accessible accessibilityLabel={`Look ${letter} is saved on this phone`}>
            <Check size={14} color={colors.limeInk} strokeWidth={2.25} />
            <AppText variant="caption" weight={600} tone="limeInk" helper="Đã lưu trên máy này" style={styles.savedText}>
              Saved on this phone
            </AppText>
          </View>
        ) : null}
      </View>
    </Rise>
  );
}

/**
 * The rule-based fallback writes reasons as "Navy Blazer: right formality level…".
 * The name is already the heading right above, so drop that exact prefix for display
 * (wording otherwise untouched; the saved look keeps the full server text).
 */
/** Skeleton for the loading state: same footprint as a column, no fake content. */
export function LookColumnSkeleton({ layout = "column" }: { layout?: "column" | "row" }) {
  const row = layout === "row";
  return (
    <View style={row ? styles.row : styles.column} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.skelPhoto, row ? { width: ROW_PHOTO_WIDTH } : null]} />
      <View style={styles.text}>
        <View style={[styles.skelLine, { width: "70%", height: 16 }]} />
        <View style={[styles.skelLine, { width: "100%" }]} />
        <View style={[styles.skelLine, { width: "85%" }]} />
      </View>
    </View>
  );
}

/** `rise` (360 ms, ease-out) from an already-visible start; static under reduced motion. */
function Rise({ delay, style, children }: { delay: number; style: StyleProp<ViewStyle>; children: ReactNode }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      p.set(1);
      return;
    }
    p.set(withDelay(delay, withTiming(1, { duration: motion.duration.rise, easing: motion.easing })));
  }, [reduced, delay, p]);

  const animated = useAnimatedStyle(() => ({
    opacity: 0.35 + 0.65 * p.get(),
    transform: [{ translateY: (1 - p.get()) * 10 }],
  }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  column: { flex: 1, minWidth: 0, gap: 8 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacing.stack },
  text: { flex: 1, minWidth: 0, gap: 5 },
  badge: {
    position: "absolute",
    left: 8,
    bottom: 8,
    width: BADGE,
    height: BADGE,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  saved: { flexDirection: "row", alignItems: "center", gap: 4 },
  savedText: { flexShrink: 1 },
  fitAdviceBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: colors.surface,
    padding: 8,
    borderRadius: radii.sm,
    marginTop: 2,
  },
  fitAdviceText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  skelPhoto: { width: "100%", aspectRatio: 4 / 5, borderRadius: radii.xxl, backgroundColor: colors.surface },
  skelLine: { height: 12, borderRadius: 6, backgroundColor: colors.surface },
});
