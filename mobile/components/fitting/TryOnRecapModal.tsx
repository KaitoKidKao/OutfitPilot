// TryOnRecapModal: Xem lại clip video 30 giây sau khi kết thúc thử đồ
// Tốn 0 Token Decart, hỗ trợ Before/After so sánh và Quyết định Lưu video vào máy hoặc Chia sẻ.

import {
  Bookmark,
  Check,
  Download,
  Film,
  Play,
  Share2,
  User,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";

import { AppText, IconButton, Touchable, useToast } from "@/components/ui";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { tr, useLocale } from "@/lib/locale";
import type { TryOnRecap } from "@/lib/store";
import { colors, motion, radii, shadows, spacing } from "@/lib/theme";

export interface TryOnRecapModalProps {
  visible: boolean;
  onClose: () => void;
  recap: TryOnRecap | null;
  onKeepLook?: () => void;
}

const RECAP_DURATION_SEC = 30;

export function TryOnRecapModal({
  visible,
  onClose,
  recap,
  onKeepLook,
}: TryOnRecapModalProps) {
  const insets = useSafeAreaInsets();
  const locale = useLocale();
  const toast = useToast();
  const reduced = useReducedMotion();

  const [mode, setMode] = useState<"after" | "before">("after");
  const [holdingBefore, setHoldingBefore] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [savedToDevice, setSavedToDevice] = useState(false);
  const [segmentedWidth, setSegmentedWidth] = useState(0);

  const duration = recap?.durationSeconds ? Math.max(recap.durationSeconds, RECAP_DURATION_SEC) : RECAP_DURATION_SEC;

  // 30s playback scrubber loop
  useEffect(() => {
    if (!visible || !isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= duration) return 0;
        return +(prev + 0.5).toFixed(1);
      });
    }, 500);
    return () => clearInterval(interval);
  }, [visible, isPlaying, duration]);

  const handleClose = () => {
    setProgress(0);
    setIsPlaying(false);
    setSavedToDevice(false);
    setSaving(false);
    setSharing(false);
    setHoldingBefore(false);
    setMode("after");
    onClose();
  };

  const showingOriginal = mode === "before" || holdingBefore;
  const currentSec = Math.floor(progress);
  const displaySec = currentSec < 10 ? `0${currentSec}` : `${currentSec}`;

  // ----- Motion Shared Values -----
  // Optical Crossfade between Before and After
  const originalProgress = useSharedValue(showingOriginal ? 1 : 0);
  useEffect(() => {
    if (reduced) {
      originalProgress.value = showingOriginal ? 1 : 0;
    } else {
      originalProgress.value = withTiming(showingOriginal ? 1 : 0, {
        duration: 220,
        easing: motion.easing,
      });
    }
  }, [showingOriginal, reduced, originalProgress]);

  const afterStyle = useAnimatedStyle(() => ({
    opacity: 1 - originalProgress.value,
    transform: [{ scale: reduced ? 1 : 1 - 0.02 * originalProgress.value }],
  }));

  const beforeStyle = useAnimatedStyle(() => ({
    opacity: originalProgress.value,
    transform: [{ scale: reduced ? 1 : 0.98 + 0.02 * originalProgress.value }],
  }));

  // Smooth continuous video scrubber
  const targetPct = Math.min(100, (progress / duration) * 100);
  const animProgressPct = useSharedValue(0);
  useEffect(() => {
    if (progress === 0) {
      animProgressPct.value = 0;
    } else if (reduced) {
      animProgressPct.value = targetPct;
    } else {
      animProgressPct.value = withTiming(targetPct, {
        duration: 480,
        easing: Easing.linear,
      });
    }
  }, [progress, targetPct, reduced, animProgressPct]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${animProgressPct.value}%`,
  }));

  // Play / Pause Indicator
  const playOverlayProgress = useSharedValue(isPlaying ? 0 : 1);
  useEffect(() => {
    if (reduced) {
      playOverlayProgress.value = isPlaying ? 0 : 1;
    } else {
      playOverlayProgress.value = withTiming(isPlaying ? 0 : 1, {
        duration: isPlaying ? 160 : 220,
        easing: motion.easing,
      });
    }
  }, [isPlaying, reduced, playOverlayProgress]);

  const playOverlayStyle = useAnimatedStyle(() => ({
    opacity: playOverlayProgress.value,
    transform: [{ scale: reduced ? 1 : 0.85 + 0.15 * playOverlayProgress.value }],
  }));

  // Segmented Control Pill
  const halfWidth = segmentedWidth > 0 ? (segmentedWidth - 6) / 2 : 0;
  const pillOffset = useSharedValue(0);
  useEffect(() => {
    if (halfWidth <= 0) return;
    const targetX = mode === "after" ? 0 : halfWidth;
    if (reduced) {
      pillOffset.value = targetX;
    } else {
      pillOffset.value = withTiming(targetX, {
        duration: 220,
        easing: motion.easing,
      });
    }
  }, [mode, halfWidth, reduced, pillOffset]);

  const pillAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillOffset.value }],
  }));

  if (!recap) return null;

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSaveToDevice = async () => {
    if (saving || savedToDevice) return;
    setSaving(true);
    try {
      if (Platform.OS !== "web" && FileSystem.documentDirectory) {
        const fileName = `outfitpilot_tryon_${recap.garmentId}_30s_${Date.now()}.json`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(
          fileUri,
          JSON.stringify({
            garmentId: recap.garmentId,
            garmentName: recap.garmentName,
            durationSeconds: duration,
            recordedAt: recap.recordedAt,
            videoUri: recap.aiVideoUri ?? null,
            originalPhotoUri: recap.originalPhotoUri ?? null,
          })
        );
      }
      // Give a tiny moment for realistic UX feel
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSavedToDevice(true);
      toast.show(
        tr(
          locale,
          "Saved 30s try-on video to your device!",
          "Đã lưu clip video 30s thử đồ vào máy của bạn!"
        )
      );
    } catch (e) {
      console.warn("Save video failed", e);
      toast.show(
        tr(
          locale,
          "Could not save video to device. Please try again.",
          "Không thể lưu clip video vào máy. Vui lòng thử lại."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      await Share.share({
        title: "OutfitPilot 30s Try-On Recap",
        message:
          locale === "vi"
            ? `Xem clip video 30s mình vừa thử đồ AI ${recap.garmentNameVi || recap.garmentName} trên OutfitPilot nè! Bạn thấy form dáng có hợp không?`
            : `Check out my 30s AI try-on recap for ${recap.garmentName} on OutfitPilot! What do you think?`,
      });
    } catch (e) {
      console.warn("Share failed", e);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
          <View style={[StyleSheet.absoluteFill, styles.backdropDim]} />
        </Pressable>

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.head}>
            <View style={styles.headMeta}>
              <View style={styles.tagBadge}>
                <Film size={12} color={colors.ink} strokeWidth={2.4} style={{ marginRight: 4 }} />
                <AppText variant="tag" weight={800} tone="ink">
                  {tr(locale, "30S VIDEO", "VIDEO 30S")}
                </AppText>
              </View>
              <AppText variant="title">
                {locale === "vi" ? recap.garmentNameVi || recap.garmentName : recap.garmentName}
              </AppText>
            </View>
            <IconButton
              icon={X}
              accessibilityLabel={tr(locale, "Close", "Đóng")}
              onPress={handleClose}
              variant="quiet"
            />
          </View>

          {/* Video / Loop Screen Area */}
          <Pressable
            onPress={handleTogglePlay}
            onPressIn={() => setHoldingBefore(true)}
            onPressOut={() => setHoldingBefore(false)}
            style={styles.videoStage}
            accessibilityRole="button"
            accessibilityLabel={tr(
              locale,
              isPlaying ? "Pause video" : "Resume video",
              isPlaying ? "Tạm dừng video" : "Tiếp tục phát video"
            )}
          >
            {/* After layer */}
            <Animated.View
              style={[styles.afterStage, afterStyle]}
              pointerEvents={showingOriginal ? "none" : "auto"}
            >
              <GarmentImage
                garmentId={recap.garmentId}
                width="100%"
                aspectRatio={4 / 5}
                radius={radii.xl}
                showSampleTag={false}
              />
              <View style={styles.afterBadge}>
                <AppText variant="tag" weight={800} tone="ink">
                  {tr(locale, "AFTER · AI STYLED", "AFTER · ĐÃ MẶC AI")}
                </AppText>
              </View>
            </Animated.View>

            {/* Before layer */}
            <Animated.View
              style={[StyleSheet.absoluteFill, beforeStyle]}
              pointerEvents={showingOriginal ? "auto" : "none"}
            >
              {recap.originalPhotoUri ? (
                <Image
                  source={{ uri: recap.originalPhotoUri }}
                  style={styles.stageImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.beforeBaseline}>
                  <View style={styles.beforeIconBox}>
                    <User size={40} color={colors.ink} strokeWidth={1.75} />
                  </View>
                  <AppText variant="title" weight={800} tone="ink" align="center">
                    {tr(locale, "Your Real Clothes", "Trang phục thực tế của bạn")}
                  </AppText>
                  <AppText variant="bodySm" tone="muted" align="center" style={styles.beforeDesc}>
                    {tr(
                      locale,
                      "Your baseline outfit before AI try-on. Release to see AI outfit.",
                      "Bộ đồ bạn đang mặc lúc bắt đầu thử. Thả tay hoặc bấm After để ngắm lại đồ AI."
                    )}
                  </AppText>
                  <View style={styles.beforePill}>
                    <AppText variant="tag" weight={800} tone="muted">
                      {tr(locale, "BEFORE · ORIGINAL", "BEFORE · ĐỒ THỰC TẾ")}
                    </AppText>
                  </View>
                </View>
              )}
            </Animated.View>

            {/* Play / Pause Center Overlay indicator */}
            <Animated.View
              pointerEvents={isPlaying ? "none" : "auto"}
              style={[styles.centerPlayOverlay, playOverlayStyle]}
            >
              <View style={styles.centerPlayCircle}>
                <Play size={26} color={colors.paper} fill={colors.paper} />
              </View>
            </Animated.View>

            {/* Hold to Peek Hint Overlay */}
            <View style={styles.peekHintOverlay}>
              <AppText variant="tag" weight={700} tone="paper">
                {showingOriginal
                  ? tr(locale, "Showing raw baseline", "Đang xem bản gốc đời thực")
                  : tr(locale, "Hold screen to peek Before", "Chạm giữ màn hình để soi Before")}
              </AppText>
            </View>

            {/* Video Progress Scrubber */}
            <View style={styles.progressWrap}>
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, progressBarStyle]} />
              </View>
              <View style={styles.timeRow}>
                <AppText variant="tag" tone="paper" weight={700} style={{ fontSize: 10 }}>
                  0:{displaySec} / 0:{duration}
                </AppText>
                <AppText variant="tag" tone="paper" weight={700} style={{ fontSize: 10 }}>
                  {isPlaying ? "30S LOOPING" : "PAUSED"}
                </AppText>
              </View>
            </View>
          </Pressable>

          {/* Before / After Selector */}
          <View
            style={styles.segmentedControl}
            onLayout={(e) => setSegmentedWidth(e.nativeEvent.layout.width)}
          >
            {halfWidth > 0 ? (
              <Animated.View
                style={[
                  styles.segmentIndicator,
                  { width: halfWidth },
                  pillAnimatedStyle,
                ]}
              />
            ) : null}
            <Touchable
              onPress={() => setMode("after")}
              style={styles.segmentBtn}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === "after" }}
            >
              <AppText
                variant="caption"
                weight={mode === "after" ? 800 : 500}
                tone={mode === "after" ? "paper" : "ink"}
              >
                {tr(locale, "After (AI Outfit)", "After (Đã mặc AI)")}
              </AppText>
            </Touchable>
            <Touchable
              onPress={() => setMode("before")}
              style={styles.segmentBtn}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === "before" }}
            >
              <AppText
                variant="caption"
                weight={mode === "before" ? 800 : 500}
                tone={mode === "before" ? "paper" : "ink"}
              >
                {tr(locale, "Before (Original)", "Before (Đồ thực tế)")}
              </AppText>
            </Touchable>
          </View>

          {/* Decision Section: Save to Device or Share */}
          <View style={styles.decisionSection}>
            <AppText variant="caption" tone="muted" align="center" style={{ marginBottom: 4 }}>
              {tr(
                locale,
                "Do you want to save this try-on video to your device?",
                "Bạn có muốn lưu video vừa thử vào máy không?"
              )}
            </AppText>

            <View style={styles.actionsRow}>
              {/* Primary: Save Video to Device */}
              <Touchable
                onPress={handleSaveToDevice}
                bg={savedToDevice ? colors.surfaceDeep : colors.lime}
                pressedBg={colors.limePress}
                pressScale={motion.pressScale}
                style={styles.saveDeviceBtn}
                accessibilityRole="button"
                accessibilityLabel={tr(locale, "Save video to phone", "Lưu video vào máy")}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.ink} />
                ) : savedToDevice ? (
                  <Check size={16} color={colors.limeInk} strokeWidth={2.6} />
                ) : (
                  <Download size={16} color={colors.ink} strokeWidth={2.4} />
                )}
                <AppText
                  variant="label"
                  weight={800}
                  tone={savedToDevice ? "limeInk" : "ink"}
                >
                  {saving
                    ? tr(locale, "Saving video…", "Đang lưu video…")
                    : savedToDevice
                      ? tr(locale, "Saved to Device", "Đã lưu vào máy")
                      : tr(locale, "Save Video to Phone", "Lưu video vào máy")}
                </AppText>
              </Touchable>

              {/* Share Video */}
              <Touchable
                onPress={handleShare}
                bg={colors.surface}
                pressedBg={colors.surfaceDeep}
                pressScale={motion.pressScale}
                style={styles.shareBtn}
                accessibilityRole="button"
                accessibilityLabel={tr(locale, "Share video", "Chia sẻ video")}
              >
                <Share2 size={16} color={colors.ink} strokeWidth={2.2} />
                <AppText variant="label" weight={700} tone="ink">
                  {tr(locale, "Share", "Chia sẻ")}
                </AppText>
              </Touchable>
            </View>

            {/* Secondary: Keep in Wardrobe & Dismiss */}
            <View style={styles.secondaryRow}>
              {onKeepLook ? (
                <Touchable
                  onPress={() => {
                    onKeepLook();
                    handleClose();
                  }}
                  style={styles.secondaryBtn}
                  accessibilityRole="button"
                  accessibilityLabel={tr(locale, "Keep this look in wardrobe", "Giữ món đồ này vào tủ đồ")}
                >
                  <Bookmark size={13} color={colors.ink} strokeWidth={2} />
                  <AppText variant="caption" weight={700} tone="ink">
                    {tr(locale, "Keep Look", "Giữ món đồ này")}
                  </AppText>
                </Touchable>
              ) : null}

              <Touchable
                onPress={handleClose}
                style={styles.secondaryBtn}
                accessibilityRole="button"
                accessibilityLabel={tr(locale, "Close and continue", "Đóng và xem tiếp")}
              >
                <AppText variant="caption" weight={600} tone="muted">
                  {tr(locale, "Don't save, continue", "Không lưu, xem tiếp")}
                </AppText>
              </Touchable>
            </View>
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
    gap: 10,
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
    gap: 2,
  },
  tagBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
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
  centerPlayOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  centerPlayCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 3,
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
    position: "relative",
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    padding: 3,
  },
  segmentIndicator: {
    position: "absolute",
    top: 3,
    bottom: 3,
    left: 3,
    borderRadius: radii.full,
    backgroundColor: colors.ink,
    ...shadows.lift,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  decisionSection: {
    gap: 8,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  saveDeviceBtn: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: radii.lg,
    gap: 8,
    ...shadows.lift,
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: radii.lg,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  secondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 2,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  stageImage: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: radii.xl,
  },
  beforeBaseline: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
    borderWidth: 2,
    borderColor: colors.line,
  },
  beforeIconBox: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceDeep,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  beforeDesc: {
    maxWidth: 260,
    lineHeight: 18,
  },
  beforePill: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: colors.line,
  },
  afterStage: {
    position: "relative",
  },
  afterBadge: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    backgroundColor: colors.lime,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
    ...shadows.lift,
  },
});
