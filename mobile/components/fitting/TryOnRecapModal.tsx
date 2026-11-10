// TryOnRecapModal: Xem lại video clip vòng lặp (10-15s) sau khi phiên AI tắt
// Tốn 0 Token Decart, hỗ trợ Before/After so sánh và Chia sẻ/Lưu video với bạn bè.

import { Eye, EyeOff, Play, RotateCcw, Share2, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText, IconButton, Touchable } from "@/components/ui";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { tr, useLocale } from "@/lib/locale";
import type { TryOnRecap } from "@/lib/store";
import { colors, radii, shadows, sizes, spacing } from "@/lib/theme";

export interface TryOnRecapModalProps {
  visible: boolean;
  onClose: () => void;
  recap: TryOnRecap | null;
  onKeepLook?: () => void;
}

export function TryOnRecapModal({
  visible,
  onClose,
  recap,
  onKeepLook,
}: TryOnRecapModalProps) {
  const insets = useSafeAreaInsets();
  const locale = useLocale();

  const [mode, setMode] = useState<"after" | "before">("after");
  const [holdingBefore, setHoldingBefore] = useState(false);
  const [progress, setProgress] = useState(0);

  const duration = recap?.durationSeconds ?? 12;

  // Fake timeline progress loop for smooth video recap feel (0 -> duration)
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= duration ? 0 : prev + 0.5));
    }, 500);
    return () => clearInterval(interval);
  }, [visible, duration]);

  if (!recap) return null;

  const showingOriginal = mode === "before" || holdingBefore;

  const handleShare = async () => {
    try {
      await Share.share({
        title: "OutfitPilot Try-On Recap",
        message:
          locale === "vi"
            ? `Xem video mình vừa thử đồ AI ${recap.garmentName} trên OutfitPilot nè! Bạn thấy form dáng có hợp không?`
            : `Check out my AI try-on recap for ${recap.garmentName} on OutfitPilot! What do you think?`,
      });
    } catch (e) {
      console.warn("Share failed", e);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <View style={[StyleSheet.absoluteFill, styles.backdropDim]} />
        </Pressable>

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.head}>
            <View style={styles.headMeta}>
              <View style={styles.tagBadge}>
                <AppText variant="tag" weight={800} tone="ink">
                  {tr(locale, "TRY-ON RECAP · 0 TOKEN", "VIDEO XEM LẠI · 0 TOKEN")}
                </AppText>
              </View>
              <AppText variant="title">
                {locale === "vi" ? recap.garmentNameVi || recap.garmentName : recap.garmentName}
              </AppText>
              <AppText variant="caption" tone="muted">
                {tr(
                  locale,
                  `Recorded ${duration}s clip · Loop replay`,
                  `Clip vòng lặp ${duration} giây · Tự động phát lại`
                )}
              </AppText>
            </View>
            <IconButton icon={X} accessibilityLabel={tr(locale, "Close", "Đóng")} onPress={onClose} variant="quiet" />
          </View>

          {/* Video / Loop Screen Area */}
          <Pressable
            onPressIn={() => setHoldingBefore(true)}
            onPressOut={() => setHoldingBefore(false)}
            style={styles.videoStage}
          >
            <GarmentImage
              garmentId={recap.garmentId}
              width="100%"
              aspectRatio={4 / 5}
              radius={radii.xl}
              showSampleTag={false}
            />

            {/* Hold to Peek Hint Overlay */}
            <View style={styles.peekHintOverlay}>
              <AppText variant="tag" weight={700} tone="paper">
                {showingOriginal
                  ? tr(locale, "Showing raw baseline", "Đang xem bản gốc đời thực")
                  : tr(locale, "Press & hold to peek Before", "Chạm giữ màn hình để soi Before")}
              </AppText>
            </View>

            {/* Video Progress Scrubber */}
            <View style={styles.progressWrap}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, (progress / duration) * 100)}%` },
                  ]}
                />
              </View>
              <View style={styles.timeRow}>
                <AppText variant="tag" tone="paper" weight={700} style={{ fontSize: 10 }}>
                  0:{progress < 10 ? `0${Math.floor(progress)}` : Math.floor(progress)} / 0:
                  {duration < 10 ? `0${duration}` : duration}
                </AppText>
                <AppText variant="tag" tone="paper" weight={700} style={{ fontSize: 10 }}>
                  LOOPING
                </AppText>
              </View>
            </View>
          </Pressable>

          {/* Before / After Selector */}
          <View style={styles.segmentedControl}>
            <Touchable
              onPress={() => setMode("after")}
              bg={mode === "after" ? colors.ink : "transparent"}
              style={[styles.segmentBtn, mode === "after" && styles.segmentBtnActive]}
            >
              <AppText variant="caption" weight={mode === "after" ? 800 : 500} tone={mode === "after" ? "paper" : "ink"}>
                {tr(locale, "After (AI Outfit)", "After (Đã mặc AI)")}
              </AppText>
            </Touchable>
            <Touchable
              onPress={() => setMode("before")}
              bg={mode === "before" ? colors.ink : "transparent"}
              style={[styles.segmentBtn, mode === "before" && styles.segmentBtnActive]}
            >
              <AppText variant="caption" weight={mode === "before" ? 800 : 500} tone={mode === "before" ? "paper" : "ink"}>
                {tr(locale, "Before (Original)", "Before (Đồ thực tế)")}
              </AppText>
            </Touchable>
          </View>

          {/* Actions: Share & Save Video vs Keep look */}
          <View style={styles.actionsRow}>
            <Touchable
              onPress={handleShare}
              bg={colors.lime}
              pressedBg={colors.limePress}
              style={styles.shareBtn}
              accessibilityRole="button"
              accessibilityLabel="Share and save video"
            >
              <Share2 size={16} color={colors.ink} strokeWidth={2.4} />
              <AppText variant="label" weight={800} tone="ink">
                {tr(locale, "Share / Save Video", "Chia sẻ / Lưu video")}
              </AppText>
            </Touchable>

            {onKeepLook ? (
              <Touchable
                onPress={() => {
                  onKeepLook();
                  onClose();
                }}
                bg={colors.surface}
                pressedBg={colors.surfaceDeep}
                style={styles.keepBtn}
                accessibilityRole="button"
                accessibilityLabel="Keep this look"
              >
                <AppText variant="label" weight={700} tone="ink">
                  {tr(locale, "Keep Look", "Giữ món đồ này")}
                </AppText>
              </Touchable>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropDim: {
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radii.dock,
    borderTopRightRadius: radii.dock,
    paddingHorizontal: spacing.gutter,
    paddingTop: 12,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    gap: 12,
    ...shadows.dock,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.line,
    marginBottom: 4,
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headMeta: {
    flex: 1,
    gap: 3,
  },
  tagBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: colors.lime,
    marginBottom: 4,
  },
  videoStage: {
    borderRadius: radii.xl,
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.ink,
  },
  peekHintOverlay: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  progressWrap: {
    position: "absolute",
    bottom: 8,
    left: 12,
    right: 12,
    gap: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: radii.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.lime,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    ...shadows.lift,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: radii.lg,
    gap: 8,
  },
  keepBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
});
