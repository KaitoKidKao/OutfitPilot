// Non-happy states for Screen 2.
//  - PicksEmpty: opened without an occasion (deep link, or the store was reset).
//  - PicksError: /api/style could not be reached and there is nothing to show.
// Each has exactly one lime "next" action, because the dock centre is inactive.
import { ArrowLeft, RotateCcw, Shirt, WifiOff } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Button } from "@/components/ui";
import { colors, radii, sizes, spacing } from "@/lib/theme";

export function PicksEmpty({ onChooseOccasion }: { onChooseOccasion: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.iconWell}>
        <Shirt size={24} color={colors.ink} strokeWidth={1.75} />
      </View>
      <AppText variant="title" align="center" helper="Dock của bạn đang trống" containerStyle={styles.center}>
        Nothing on your hooks yet
      </AppText>
      <AppText variant="body" tone="muted" align="center" helper="Chọn dịp bạn sắp đi, chúng tôi sẽ treo hai món lên dock." containerStyle={styles.center}>
        Pick where you&apos;re going and we&apos;ll hang two looks on your dock.
      </AppText>
      <Button label="Choose an occasion" labelVi="Chọn dịp" variant="next" icon={ArrowLeft} onPress={onChooseOccasion} style={styles.cta} />
    </View>
  );
}

export interface PicksErrorProps {
  message: string | null;
  retrying: boolean;
  onRetry: () => void;
  onChangeOccasion: () => void;
}

export function PicksError({ message, retrying, onRetry, onChangeOccasion }: PicksErrorProps) {
  return (
    <View style={styles.error}>
      <View style={styles.errorHead} accessible accessibilityRole="alert">
        <WifiOff size={22} color={colors.danger} strokeWidth={1.75} />
        <View style={styles.flex}>
          <AppText variant="bodyStrong" helper="Không kết nối được tới máy chủ">
            Can&apos;t reach the stylist
          </AppText>
          <AppText
            variant="bodySm"
            tone="muted"
            helper="Kiểm tra điện thoại và máy chủ OutfitPilot dùng chung Wi-Fi rồi thử lại."
            containerStyle={styles.copy}
          >
            Check that your phone and the OutfitPilot server are on the same Wi-Fi, then try again.
          </AppText>
          {message ? (
            <AppText variant="caption" tone="muted" style={styles.detail} numberOfLines={3}>
              {`Details: ${message}`}
            </AppText>
          ) : null}
        </View>
      </View>
      <View style={styles.actions}>
        <Button label="Try again" labelVi="Thử lại" loadingLabel="Trying again…" loadingLabelVi="Đang thử lại…" variant="next" icon={RotateCcw} loading={retrying} onPress={onRetry} />
        <Button label="Change occasion" labelVi="Đổi dịp" variant="ghost" onPress={onChangeOccasion} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: "center" },
  empty: {
    marginTop: spacing.stack,
    borderWidth: sizes.dashedBorder,
    borderStyle: "dashed",
    borderColor: colors.line,
    borderRadius: radii.xxl,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
    gap: 12,
  },
  iconWell: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  cta: { alignSelf: "center", marginTop: 8 },
  error: { borderWidth: 1, borderColor: colors.line, borderRadius: radii.xxl, padding: spacing.gutter, gap: spacing.stack },
  errorHead: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  copy: { marginTop: 4 },
  detail: { marginTop: 8 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
});
