// Final Look states without a pair to compare: loading, error and empty.
// The single lime action for each state lives in the dock centre (see app/final.tsx);
// these bodies explain what happened and offer a quiet way out.
import { AlertCircle } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { Touchable } from "@/components/ui/Touchable";
import { colors, radii, spacing } from "@/lib/theme";

import { LookColumnSkeleton } from "./LookColumn";

export function FinalLoading() {
  return (
    <View style={styles.stack}>
      <View accessible accessibilityRole="progressbar" accessibilityLabel="Loading your two picks" accessibilityLiveRegion="polite">
        <AppText variant="body" tone="muted" helper="Đang tải hai gợi ý của bạn…">
          Loading your two picks…
        </AppText>
      </View>
      <View style={styles.pair}>
        <LookColumnSkeleton />
        <LookColumnSkeleton />
      </View>
    </View>
  );
}

export function FinalError({ message, onChooseOccasion }: { message: string | null; onChooseOccasion: () => void }) {
  return (
    <View style={styles.stack}>
      <View style={styles.errorBox} accessibilityLiveRegion="polite">
        <AlertCircle size={20} color={colors.danger} strokeWidth={1.75} style={styles.icon} />
        <View style={styles.flex}>
          <AppText variant="bodyStrong" tone="danger" helper="Không tải được gợi ý. Thử lại bằng nút ở dưới.">
            We couldn’t load your picks. Retry from the dock below.
          </AppText>
          {message ? (
            <AppText variant="caption" tone="muted" style={styles.detail}>
              {message}
            </AppText>
          ) : null}
        </View>
      </View>
      <Button label="Choose another occasion" onPress={onChooseOccasion} accessibilityHint="Goes back to the first step" />
    </View>
  );
}

/** Dashed = empty, tap to fill: each frame leads back to Choose Occasion. */
export function FinalEmpty({ onChooseOccasion }: { onChooseOccasion: () => void }) {
  return (
    <View style={styles.stack}>
      <View style={styles.pair}>
        {(["A", "B"] as const).map((letter) => (
          <Touchable
            key={letter}
            accessibilityRole="button"
            accessibilityLabel={`Look ${letter} is empty. Choose an occasion to get two picks`}
            onPress={onChooseOccasion}
            bg={colors.paper}
            pressedBg={colors.surface}
            style={[styles.flex, styles.emptyFrame]}
          >
            {/* The frame is decoration for the button: keep it out of the TalkBack/VoiceOver focus order. */}
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <GarmentImage garmentId={null} emptyLabel={`Look ${letter}`} accessibilityLabel="" />
            </View>
          </Touchable>
        ))}
      </View>
      <AppText variant="bodyStrong" helper="Chưa có hai look để so sánh. Chọn dịp ở bước đầu để nhận hai gợi ý.">
        No looks to compare yet. Pick an occasion first to get two picks.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.stack },
  pair: { flexDirection: "row", gap: spacing.gap },
  flex: { flex: 1, minWidth: 0 },
  emptyFrame: { borderRadius: radii.xxl },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 16,
    borderRadius: radii.xl,
    backgroundColor: colors.dangerSoft,
  },
  icon: { marginTop: 1 },
  detail: { marginTop: 6 },
});
