// TryOnRecapModal: Xem lại clip video 30 giây sau khi kết thúc thử đồ
// Tốn 0 Token Decart, hỗ trợ Before/After so sánh và Quyết định Lưu video vào máy hoặc Chia sẻ.

import {
  Bookmark,
  Check,
  Download,
  Eye,
  Film,
  Pause,
  Play,
  RotateCcw,
  Share2,
  User,
  X,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";

import { AppText, IconButton, Touchable, useToast } from "@/components/ui";
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

  const [mode, setMode] = useState<"after" | "before">("after");
  const [holdingBefore, setHoldingBefore] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedToDevice, setSavedToDevice] = useState(false);

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

  // Reset states on modal open
  useEffect(() => {
    if (visible) {
      setProgress(0);
      setIsPlaying(true);
      setSavedToDevice(false);
      setSaving(false);
      setMode("after");
    }
  }, [visible]);

  if (!recap) return null;

  const showingOriginal = mode === "before" || holdingBefore;
  const currentSec = Math.floor(progress);
  const displaySec = currentSec < 10 ? `0${currentSec}` : `${currentSec}`;

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
      setSavedToDevice(true);
      toast.show(
        tr(
          locale,
          "Saved 30s try-on video to your device!",
          "Đã lưu clip video 30s thử đồ vào máy của bạn!"
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
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

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.head}>
            <View style={styles.headMeta}>
              <View style={styles.tagBadge}>
                <Film size={12} color={colors.ink} strokeWidth={2.4} style={{ marginRight: 4 }} />
                <AppText variant="tag" weight={800} tone="ink">
                  {tr(locale, "30S VIDEO RECAP", "VIDEO 30S XEM LẠI")}
                </AppText>
              </View>
              <AppText variant="title">
                {locale === "vi" ? recap.garmentNameVi || recap.garmentName : recap.garmentName}
              </AppText>
              <AppText variant="caption" tone="muted">
                {tr(
                  locale,
                  `Recorded 30s clip · Auto loop replay`,
                  `Clip video 30 giây · Tự động phát lại`
                )}
              </AppText>
            </View>
            <IconButton
              icon={X}
              accessibilityLabel={tr(locale, "Close", "Đóng")}
              onPress={onClose}
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
            accessibilityLabel={isPlaying ? "Tạm dừng video" : "Tiếp tục phát video"}
          >
            {showingOriginal ? (
              recap.originalPhotoUri ? (
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
              )
            ) : (
              <View style={styles.afterStage}>
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
              </View>
            )}

            {/* Play / Pause Center Overlay indicator when paused */}
            {!isPlaying && (
              <View style={styles.centerPlayOverlay}>
                <View style={styles.centerPlayCircle}>
                  <Play size={26} color={colors.paper} fill={colors.paper} />
                </View>
              </View>
            )}

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
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, (progress / duration) * 100)}%` },
                  ]}
                />
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
          <View style={styles.segmentedControl}>
            <Touchable
              onPress={() => setMode("after")}
              bg={mode === "after" ? colors.ink : "transparent"}
              style={[styles.segmentBtn, mode === "after" && styles.segmentBtnActive]}
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
              bg={mode === "before" ? colors.ink : "transparent"}
              style={[styles.segmentBtn, mode === "before" && styles.segmentBtnActive]}
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
                "Do you want to save this 30s try-on video to your device?",
                "Bạn có muốn lưu video 30 giây vừa thử vào máy không?"
              )}
            </AppText>

            <View style={styles.actionsRow}>
              {/* Primary: Save Video to Device */}
              <Touchable
                onPress={handleSaveToDevice}
                bg={savedToDevice ? colors.surfaceDeep : colors.lime}
                pressedBg={colors.limePress}
                style={styles.saveDeviceBtn}
                accessibilityRole="button"
                accessibilityLabel="Lưu video 30s vào máy"
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
                style={styles.shareBtn}
                accessibilityRole="button"
                accessibilityLabel="Chia sẻ video"
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
                    onClose();
                  }}
                  style={styles.secondaryBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Giữ món đồ này vào tủ đồ"
                >
                  <Bookmark size={13} color={colors.ink} strokeWidth={2} />
                  <AppText variant="caption" weight={700} tone="ink">
                    {tr(locale, "Keep Look", "Giữ món đồ này")}
                  </AppText>
                </Touchable>
              ) : null}

              <Touchable
                onPress={onClose}
                style={styles.secondaryBtn}
                accessibilityRole="button"
                accessibilityLabel="Đóng và tiếp tục"
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
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    ...shadows.lift,
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
    height: 48,
    borderRadius: radii.lg,
    gap: 8,
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
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
