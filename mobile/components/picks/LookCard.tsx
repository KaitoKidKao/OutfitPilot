// One pick on Screen 2 (DESIGN.md §6.2): a large 4:5 garment photo with the Sample
// tag and the A/B slot badge, then the garment name, its role (Best match /
// Alternative), the stylist's one-line reason and the "Pair with" suggestion.
//
// The whole card is one button: tapping it selects this look and lights its dock
// hook (a tap on the hook does the same, plus scrolls here). The active card carries a 2 pt ink
// ring and a lime slot badge; the other card's badge is ink (DESIGN.md Chips).
import type { LayoutChangeEvent } from "react-native";
import { StyleSheet, View } from "react-native";

import { AppText, GarmentImage, Touchable } from "@/components/ui";
import type { Recommendation } from "@/lib/api";
import { getGarment } from "@/lib/catalog";
import { reasonWithoutName } from "@/lib/reasonText";
import type { Slot } from "@/lib/store";
import { colors, radii, spacing } from "@/lib/theme";

import { SLOT_ROLE, slotName } from "./copy";

export interface LookCardProps {
  slot: Slot;
  pick: Recommendation;
  active: boolean;
  onPress: (slot: Slot) => void;
  onLayout?: (e: LayoutChangeEvent) => void;
  testID?: string;
}

const RING = 2;
const RING_GAP = 2;

export function LookCard({ slot, pick, active, onPress, onLayout, testID }: LookCardProps) {
  const garment = getGarment(pick.garmentId);
  const role = SLOT_ROLE[slot];
  const name = slotName(slot);
  const reason = reasonWithoutName(pick.reason, garment.name);

  return (
    <Touchable
      testID={testID}
      onLayout={onLayout}
      onPress={() => onPress(slot)}
      accessibilityRole="button"
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
    gap: 2,
    paddingTop: spacing.gap,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});
