// TryOnRecapModal: Xem lại clip video sau khi kết thúc thử đồ
// Tốn 0 Token Decart, chỉ hiện video/ảnh sau khi thử và cho Lưu video/ảnh vào Thư viện máy.

import {
  Bookmark,
  Check,
  Download,
  Film,
  Play,
  Share2,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";
import { useVideoPlayer, VideoView } from "expo-video";

// Safe native module loader: avoids fatal redbox crash if running in Expo Go or an older binary lacking ExpoMediaLibraryNext
function getMediaLibrary(): typeof import("expo-media-library") | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-media-library");
  } catch {
    // Native module ExpoMediaLibraryNext is not compiled in the running binary (e.g. Expo Go)
    return null;
  }
}

import { AppText, IconButton, Touchable, useToast } from "@/components/ui";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { tr, useLocale } from "@/lib/locale";
import { RecapSuggestions } from "@/components/fitting/RecapSuggestions";
import { useAppStore, type TryOnRecap } from "@/lib/store";
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
  const { height: winH } = useWindowDimensions();
  const { gender } = useAppStore();
  const locale = useLocale();
  const toast = useToast();
  const reduced = useReducedMotion();

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [savedToDevice, setSavedToDevice] = useState(false);
  const saveSuccessScale = useSharedValue(1);

  const [localVideoUri, setLocalVideoUri] = useState<string | null>(recap?.aiVideoUri ?? null);
  const [localAiPhotoUri, setLocalAiPhotoUri] = useState<string | null>(recap?.aiPhotoUri ?? null);
  const [localOriginalPhotoUri, setLocalOriginalPhotoUri] = useState<string | null>(recap?.originalPhotoUri ?? null);

  useEffect(() => {
    setLocalVideoUri(recap?.aiVideoUri ?? null);
    setLocalAiPhotoUri(recap?.aiPhotoUri ?? null);
    setLocalOriginalPhotoUri(recap?.originalPhotoUri ?? null);
  }, [recap]);

  useEffect(() => {
    if (visible) {
      setIsPlaying(true);
      setProgress(0);
      setSavedToDevice(false);
      setSaving(false);
      setSharing(false);
    }
  }, [visible]);

  const player = useVideoPlayer(localVideoUri, (p) => {
    p.loop = true;
    if (isPlaying) {
      p.play();
    }
  });

  useEffect(() => {
    if (localVideoUri && player) {
      try {
        player.replace(localVideoUri);
        if (isPlaying) player.play();
      } catch (err) {
        console.warn("Player replace failed", err);
      }
    }
  }, [localVideoUri, player]);

  useEffect(() => {
    if (!player) return;
    try {
      if (isPlaying) {
        player.play();
      } else {
        player.pause();
      }
    } catch {
      // ignore
    }
  }, [isPlaying, player]);

  const saveSuccessStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveSuccessScale.value }],
  }));

  const [actualDuration, setActualDuration] = useState<number>(() => {
    return recap?.durationSeconds && recap.durationSeconds > 0 ? recap.durationSeconds : 30;
  });

  useEffect(() => {
    if (recap?.durationSeconds && recap.durationSeconds > 0) {
      setActualDuration(recap.durationSeconds);
    }
  }, [recap?.durationSeconds]);

  useEffect(() => {
    if (player && player.duration && player.duration > 0) {
      const pDur = Math.round(player.duration);
      if (pDur > 0) setActualDuration(pDur);
    }
  }, [player, player?.duration]);

  const duration = actualDuration;

  // Exact playback scrubber loop
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
    try {
      player.pause();
    } catch {
      // ignore
    }
    setSavedToDevice(false);
    setSaving(false);
    setSharing(false);
    saveSuccessScale.value = 1;
    onClose();
  };

  const currentSec = Math.floor(progress);
  const displaySec = currentSec < 10 ? `0${currentSec}` : `${currentSec}`;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? `0${s}` : s}`;
  };


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


  if (!recap) return null;

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };


  const handleSaveToDevice = async () => {
    if (saving || savedToDevice) return;
    setSaving(true);
    try {
      let savedToGallery = false;
      const mediaUri = localVideoUri ?? localAiPhotoUri ?? localOriginalPhotoUri;
      let targetUri = mediaUri;
      if (targetUri && !targetUri.startsWith("file://") && !targetUri.startsWith("content://") && !targetUri.startsWith("ph://")) {
        targetUri = `file://${targetUri}`;
      }

      if (targetUri && Platform.OS !== "web") {
        const MediaLibrary = getMediaLibrary();
        if (MediaLibrary) {
          try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === "granted") {
              await MediaLibrary.createAssetAsync(targetUri);
              savedToGallery = true;
            }
          } catch (mediaErr) {
            console.warn("Save to MediaLibrary failed", mediaErr);
          }
        } else {
          console.warn("MediaLibrary native module not available in this build binary");
        }
      }

      if (Platform.OS !== "web" && FileSystem.documentDirectory) {
        const fileName = `outfitpilot_tryon_${recap.garmentId}_${Date.now()}.json`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(
          fileUri,
          JSON.stringify({
            garmentId: recap.garmentId,
            garmentName: recap.garmentName,
            durationSeconds: duration,
            recordedAt: recap.recordedAt,
            videoUri: localVideoUri ?? null,
            aiPhotoUri: localAiPhotoUri ?? null,
            originalPhotoUri: localOriginalPhotoUri ?? null,
          })
        );
      }

      // Give a tiny moment for realistic UX feel
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSavedToDevice(true);
      if (!reduced) {
        saveSuccessScale.value = withSequence(
          withTiming(0.85, { duration: 80 }),
          withSpring(1.22, { damping: 9, stiffness: 220 }),
          withSpring(1, { damping: 12 })
        );
      }
      toast.show(
        savedToGallery
          ? tr(
              locale,
              "Saved try-on media to your Photos Gallery!",
              "Đã lưu clip/ảnh thử đồ vào Thư viện ảnh của bạn!"
            )
          : tr(
              locale,
              "Saved try-on recap to your device!",
              "Đã lưu thông tin thử đồ vào máy!"
            )
      );
    } catch (e) {
      console.warn("Save video failed", e);
      toast.show(
        tr(
          locale,
          "Could not save video to device. Please try again.",
          "Không thể lưu video vào máy. Vui lòng thử lại."
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
        title: "OutfitPilot Try-On Recap",
        message:
          locale === "vi"
            ? `Xem clip video mình vừa thử đồ AI ${recap.garmentNameVi || recap.garmentName} trên OutfitPilot nè! Bạn thấy form dáng có hợp không?`
            : `Check out my AI try-on recap for ${recap.garmentName} on OutfitPilot! What do you think?`,
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
                  {tr(locale, "VIDEO RECAP", "VIDEO THỬ ĐỒ")}
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

          <ScrollView style={{ maxHeight: winH * 0.62 }} showsVerticalScrollIndicator={false} bounces={false}>
          {/* Video / Loop Screen Area */}
          <Pressable
            onPress={handleTogglePlay}
            style={styles.videoStage}
            accessibilityRole="button"
            accessibilityLabel={tr(
              locale,
              isPlaying ? "Pause video" : "Resume video",
              isPlaying ? "Tạm dừng video" : "Tiếp tục phát video"
            )}
          >
            {/* After layer */}
            <View style={styles.afterStage}>
              {localVideoUri ? (
                <VideoView
                  player={player}
                  style={styles.stageVideo}
                  contentFit="cover"
                  nativeControls={false}
                />
              ) : localAiPhotoUri ? (
                <Image
                  source={{ uri: localAiPhotoUri }}
                  style={styles.stageImage}
                  resizeMode="cover"
                />
              ) : (
                <GarmentImage
                  garmentId={recap.garmentId}
                  width="100%"
                  aspectRatio={4 / 5}
                  radius={radii.xl}
                  showSampleTag={false}
                />
              )}
              {!localVideoUri && !localAiPhotoUri ? (
                <View style={styles.afterBadge}>
                  <AppText variant="tag" weight={800} tone="ink">
                    {tr(locale, "NO TRY-ON VIDEO RECORDED", "CHƯA QUAY ĐƯỢC VIDEO THỬ ĐỒ")}
                  </AppText>
                  {recap.recordIssue ? (
                    <AppText variant="tag" tone="ink" align="center">
                      {recap.recordIssue}
                    </AppText>
                  ) : null}
                </View>
              ) : null}
            </View>


            {/* Play / Pause Center Overlay indicator */}
            <Animated.View
              pointerEvents={isPlaying ? "none" : "auto"}
              style={[styles.centerPlayOverlay, playOverlayStyle]}
            >
              <View style={styles.centerPlayCircle}>
                <Play size={26} color={colors.paper} fill={colors.paper} />
              </View>
            </Animated.View>


            {/* Video Progress Scrubber */}
            <View style={styles.progressWrap}>
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, progressBarStyle]} />
              </View>
              <View style={styles.timeRow}>
                <AppText variant="tag" tone="paper" weight={700} style={{ fontSize: 10 }}>
                  {formatTime(currentSec)} / {formatTime(duration)}
                </AppText>
                <AppText variant="tag" tone="paper" weight={700} style={{ fontSize: 10 }}>
                  {isPlaying ? `${duration}S LOOPING` : "PAUSED"}
                </AppText>
              </View>
            </View>
          </Pressable>

          <RecapSuggestions garmentId={recap.garmentId} gender={gender} />
          </ScrollView>

          {/* Decision Section: Save to Device or Share */}
          <View style={styles.decisionSection}>
            <AppText variant="caption" tone="muted" align="center" style={{ marginBottom: 4 }}>
              {tr(
                locale,
                "Save this try-on video?",
                "Lưu video vừa thử?"
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
                <Animated.View style={[styles.saveBtnContent, saveSuccessStyle]}>
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
                        ? tr(locale, "Saved", "Đã lưu")
                        : tr(locale, "Save", "Lưu")}
                  </AppText>
                </Animated.View>
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
                <Share2 size={20} color={colors.ink} strokeWidth={2.2} />
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
                  accessibilityLabel={tr(locale, "Keep this look in wardrobe", "Giữ bộ đồ này vào tủ đồ")}
                >
                  <Bookmark size={13} color={colors.ink} strokeWidth={2} />
                  <AppText variant="caption" weight={700} tone="ink">
                    {tr(locale, "Keep", "Giữ đồ")}
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
                  {tr(locale, "Skip", "Bỏ qua")}
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
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: radii.lg,
    ...shadows.lift,
  },
  saveBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  shareBtn: {
    width: 56,
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
  stageVideo: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: colors.ink,
  },
  pickMediaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
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
    borderRadius: radii.md,
    maxWidth: "88%",
    alignItems: "center",
    gap: 2,
    ...shadows.lift,
  },
});
