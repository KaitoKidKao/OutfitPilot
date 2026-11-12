// FittingTopBar: Thanh điều khiển trên cùng tối ưu hóa cho màn hình thử đồ
// Tinh gọn trong một hàng duy nhất với frosted glass, tích hợp trạng thái Live & đếm ngược,
// cùng chip tên trang phục nhỏ gọn không che khuất người thử.

import { Camera, Eye, EyeOff, SwitchCamera, X } from "lucide-react-native";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AppText, Button, IconButton } from "@/components/ui";
import { tr, useLocale } from "@/lib/locale";
import type { Slot } from "@/lib/store";
import { colors, radii, sizes, spacing } from "@/lib/theme";

export interface FittingTopBarProps {
  isLive: boolean;
  isConnecting?: boolean;
  secondsLeft?: number | null;
  garmentName?: string | null;
  slot?: Slot;
  isComparing?: boolean;
  onExit: () => void;
  onFlip: () => void;
  flipDisabled?: boolean;
  flipHint?: string;
  canPeekOriginal?: boolean;
  peekingOriginal?: boolean;
  onToggleOriginal?: () => void;
  onSnapPhoto?: () => void;
  snapLabel?: string;
  onFinish: () => void;
}

export function FittingTopBar({
  isLive,
  isConnecting = false,
  secondsLeft = null,
  garmentName,
  slot,
  isComparing = false,
  onExit,
  onFlip,
  flipDisabled = false,
  flipHint,
  canPeekOriginal = false,
  peekingOriginal = false,
  onToggleOriginal,
  onSnapPhoto,
  snapLabel,
  onFinish,
}: FittingTopBarProps) {
  const locale = useLocale();

  return (
    <View style={styles.container}>
      {/* Top Controls Row */}
      <View style={styles.topRow}>
        {/* Left: Exit */}
        <View style={styles.glassBtnWrap}>
          <IconButton
            icon={X}
            variant="onDark"
            iconSize={20}
            accessibilityLabel={tr(locale, "Exit fitting room", "Thoát phòng thử")}
            onPress={onExit}
          />
        </View>

        {/* Center: Floating Status Pill */}
        <View style={styles.centerPillWrap}>
          {isLive ? (
            <View style={styles.livePill}>
              <View style={styles.livePulseDot} />
              <AppText variant="tag" weight={800} tone="lime">
                {tr(locale, "LIVE", "TRỰC TIẾP")}
              </AppText>
              {secondsLeft !== null && (
                <AppText variant="caption" weight={800} tone="paper" style={styles.timerNum}>
                  · {secondsLeft}s
                </AppText>
              )}
            </View>
          ) : isConnecting ? (
            <View style={styles.neutralPill}>
              <ActivityIndicator size={12} color={colors.lime} style={{ marginRight: 6 }} />
              <AppText variant="caption" weight={700} tone="paper">
                {tr(locale, "Connecting AI…", "Đang kết nối AI…")}
              </AppText>
            </View>
          ) : (
            <View style={styles.neutralPill}>
              <View style={styles.previewDot} />
              <AppText variant="caption" weight={600} tone="paper">
                {tr(locale, "Camera preview", "Xem trước camera")}
              </AppText>
            </View>
          )}
        </View>

        {/* Right: Actions */}
        <View style={styles.rightActions}>
          {canPeekOriginal && onToggleOriginal ? (
            <View style={[styles.glassBtnWrap, peekingOriginal && styles.glassBtnActive]}>
              <IconButton
                icon={peekingOriginal ? EyeOff : Eye}
                variant="onDark"
                iconSize={18}
                accessibilityLabel={tr(
                  locale,
                  peekingOriginal ? "Show AI outfit" : "Compare with original",
                  peekingOriginal ? "Xem đồ AI" : "Soi đồ thực tế"
                )}
                onPress={onToggleOriginal}
              />
            </View>
          ) : null}

          {onSnapPhoto ? (
            <View style={styles.glassBtnWrap}>
              <IconButton
                icon={Camera}
                variant="onDark"
                iconSize={18}
                accessibilityLabel={snapLabel ?? tr(locale, "Take snapshot", "Chụp ảnh")}
                onPress={onSnapPhoto}
              />
            </View>
          ) : null}

          <View style={styles.glassBtnWrap}>
            <IconButton
              icon={SwitchCamera}
              variant="onDark"
              iconSize={18}
              accessibilityLabel={tr(locale, "Flip camera", "Lật camera")}
              accessibilityHint={flipHint}
              disabled={flipDisabled}
              onPress={onFlip}
            />
          </View>

          <Button
            label="Done"
            labelVi="Xong"
            variant="onDark"
            onPress={onFinish}
            accessibilityHint="Ends fitting and opens Final Look"
            style={styles.finishBtn}
          />
        </View>
      </View>

      {/* Sub-row: Compact Garment Info Chip */}
      {garmentName ? (
        <View style={styles.garmentChip}>
          {isComparing && slot ? (
            <View style={styles.slotTag}>
              <AppText variant="tag" weight={800} tone="ink">
                {slot.toUpperCase()}
              </AppText>
            </View>
          ) : null}
          <AppText
            variant="caption"
            weight={700}
            tone="paper"
            numberOfLines={1}
            style={styles.garmentTitle}
          >
            {garmentName}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 8,
  },
  topRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  glassBtnWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  glassBtnActive: {
    backgroundColor: colors.lime,
  },
  centerPillWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    gap: 6,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.lime,
  },
  timerNum: {
    fontSize: 13,
  },
  neutralPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    gap: 6,
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.mutedDark,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  finishBtn: {
    alignSelf: "center",
    paddingHorizontal: 16,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.paper,
  },
  garmentChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    gap: 6,
    maxWidth: 240,
  },
  slotTag: {
    backgroundColor: colors.lime,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  garmentTitle: {
    flexShrink: 1,
    fontSize: 12,
  },
});
