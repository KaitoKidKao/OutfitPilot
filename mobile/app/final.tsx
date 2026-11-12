// Screen 5 · Final Look (DESIGN.md §6.5): "Which one do you keep?"
// A visible "visual simulation only" note above two columns A | B (photo + letter, name,
// stylist reason, pair-with, honest source), and the Fitting Dock in keep mode: the two
// hooks are the lime "Keep A" / "Keep B" actions, the centre is a quiet "Try again".
// Keeping saves to the device (store.keepLook -> AsyncStorage), toasts, then opens the
// Saved looks sheet. Secondary: "Saved N" (top bar, same as Choose Occasion) and "Start over" (end of page).
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronLeft, Layers, Play, Repeat, RotateCcw, Shirt } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { ClosetSheet } from "@/components/closet/ClosetSheet";
import { FinalEmpty, FinalError, FinalLoading } from "@/components/final/FinalStates";
import { FitNote } from "@/components/final/FitNote";
import { LookColumn } from "@/components/final/LookColumn";
import { TryOnRecapModal } from "@/components/fitting/TryOnRecapModal";
import { SavedButton } from "@/components/index/SavedButton";
import { FittingDock, type DockCenter } from "@/components/FittingDock";
import { SavedSheet } from "@/components/SavedSheet";
import { AppText, IconButton, Screen, TopBar, Touchable, useToast } from "@/components/ui";
import type { Recommendation, StyleSource } from "@/lib/api";
import { getGarment, type GarmentId, type OccasionId } from "@/lib/catalog";
import { tr, useLocale } from "@/lib/locale";
import { getOccasionOption } from "@/lib/occasions";
import { readPreviewSeed } from "@/lib/previewSeed";
import { useAppStore, type Slot, type TryOnRecap } from "@/lib/store";
import { colors, radii, spacing } from "@/lib/theme";

/** Let the "Saved" toast register before the sheet slides over it. */
const SHEET_DELAY_MS = 650;
/** Above this font scale (or below this width) the A | B columns become rows. */
const STACK_FONT_SCALE = 1.35;
const STACK_MIN_WIDTH = 340;

interface ShownPicks {
  recommendations: Recommendation[];
  source: StyleSource | "closet";
}

interface ShownPair {
  picks: ShownPicks | null;
  occasionId: OccasionId | null;
}

export default function FinalLook() {
  const router = useRouter();
  const toast = useToast();
  const locale = useLocale();
  const { width, fontScale } = useWindowDimensions();
  const { picks, picksStatus, picksError, occasionId, saved, savedLoaded, consentGiven, keepLook, fetchPicks, clear, hookIds, pickFor, latestRecap } = useAppStore();

  // Web preview only (/final?seed=final&sheet=saved); readPreviewSeed() is null elsewhere.
  const [sheetOpen, setSheetOpen] = useState(() => readPreviewSeed()?.openSavedSheet ?? false);
  const [closetOpen, setClosetOpen] = useState(false);
  const [recapOpen, setRecapOpen] = useState(false);
  const hasAutoOpenedRef = useRef(false);
  const [keeping, setKeeping] = useState<Slot | null>(null);
  // "Start over" clears the store while this screen animates away; keep showing the
  // pair the user was looking at instead of flashing the empty state.
  const [frozen, setFrozen] = useState<ShownPair | null>(null);
  const sheetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Automatically pop up 30s Try-On Video Recap modal when arriving at Final Look
  const fallbackGarmentId = hookIds[0] ?? hookIds[1];
  const effectiveRecap: TryOnRecap | null = useMemo(() => {
    if (latestRecap) return latestRecap;
    if (!fallbackGarmentId) return null;
    const g = getGarment(fallbackGarmentId);
    return {
      garmentId: fallbackGarmentId,
      garmentName: g.name,
      garmentNameVi: g.nameVi,
      slot: hookIds[0] ? "a" : "b",
      durationSeconds: 30,
      recordedAt: new Date().toISOString(),
    };
  }, [latestRecap, fallbackGarmentId, hookIds]);

  useEffect(() => {
    if (effectiveRecap && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true;
      const timer = setTimeout(() => {
        setRecapOpen(true);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [effectiveRecap]);

  const view: ShownPair = frozen ?? { picks, occasionId };
  const rawPair = view.picks;
  const pickA = hookIds[0] ? pickFor("a") : null;
  const pickB = hookIds[1] ? pickFor("b") : null;
  const activePicks = [pickA, pickB].filter((p): p is NonNullable<typeof p> => p !== null);
  const isSingleLook = activePicks.length === 1;
  const singleSlot: Slot = pickA ? "a" : "b";

  const fallbackPair: ShownPicks | null =
    activePicks.length > 0
      ? {
          recommendations: activePicks,
          source: rawPair?.source ?? (occasionId ? "llm" : "closet"),
        }
      : null;
  const pair = isSingleLook ? fallbackPair : (rawPair ?? fallbackPair);
  const hooks: [GarmentId | null, GarmentId | null] = [hookIds[0], hookIds[1]];
  const occasion = view.occasionId ? getOccasionOption(view.occasionId) : null;
  const stacked = fontScale >= STACK_FONT_SCALE || width < STACK_MIN_WIDTH;

  const cancelSheetTimer = useCallback(() => {
    if (sheetTimer.current) clearTimeout(sheetTimer.current);
    sheetTimer.current = null;
    setKeeping(null);
  }, []);

  useEffect(() => () => {
    if (sheetTimer.current) clearTimeout(sheetTimer.current);
  }, []);

  // Leaving the screen (back gesture, Try again) never opens the sheet afterwards.
  useFocusEffect(
    useCallback(() => {
      return () => {
        cancelSheetTimer();
        setSheetOpen(false);
      };
    }, [cancelSheetTimer]),
  );

  const isSaved = (garmentId: GarmentId) => saved.some((l) => l.garmentId === garmentId && (!view.occasionId || l.occasionId === view.occasionId));

  const handleKeep = (slot: Slot) => {
    if (keeping) return;
    const letter = slot.toUpperCase();
    const look = keepLook(slot);
    if (!look) {
      toast.show(tr(locale, "Couldn’t save this look", "Không lưu được look này"));
      return;
    }
    const name = getGarment(look.garmentId).name;
    toast.show(tr(locale, `Saved Look ${letter}`, `Đã lưu Look ${letter}`), { announcement: `Saved Look ${letter}, ${name}, on this phone` });
    setKeeping(slot);
    sheetTimer.current = setTimeout(() => {
      sheetTimer.current = null;
      setKeeping(null);
      setSheetOpen(true);
    }, SHEET_DELAY_MS);
  };

  const tryAgain = () => {
    cancelSheetTimer();
    // Consent lives in memory for this launch; without it the Fitting Room cannot start.
    router.dismissTo(consentGiven ? "/fitting" : "/setup");
  };

  const goToStart = () => {
    cancelSheetTimer();
    setSheetOpen(false);
    router.dismissTo("/");
  };

  const startOver = () => {
    setFrozen(view);
    goToStart();
    clear();
  };

  const savedCount = saved.length;

  // ----- dock centre per state (the screen's one non-hook action) -----
  let center: DockCenter;
  if (pair) {
    center = {
      label: "Try again",
      labelVi: "Thử lại",
      accessibilityLabel: "Try again",
      accessibilityHint: consentGiven ? "Goes back to the live fitting room" : "Goes back to camera setup",
      icon: Repeat,
      tone: "quiet",
      onPress: tryAgain,
      disabled: !!keeping,
    };
  } else if (picksStatus === "loading") {
    center = { label: "Loading", labelVi: "Đang tải", accessibilityLabel: "Loading your picks", icon: Shirt, tone: "lime", onPress: () => undefined, loading: true };
  } else if (picksStatus === "error" && occasionId) {
    center = { label: "Retry", labelVi: "Thử lại", accessibilityLabel: "Retry loading your picks", icon: RotateCcw, tone: "lime", onPress: () => void fetchPicks({ force: true }) };
  } else {
    center = { label: "Choose occasion", labelVi: "Chọn dịp", accessibilityLabel: "Choose an occasion", accessibilityHint: "Goes back to the first step", icon: Shirt, tone: "lime", onPress: goToStart };
  }

  return (
    <Screen
      dockClearance={false}
      contentStyle={styles.screenContent}
      header={
        <TopBar
          left={
            <View style={styles.topLeft}>
              <IconButton
                icon={ChevronLeft}
                accessibilityLabel={tr(locale, "Back", "Quay lại")}
                onPress={() => router.back()}
              />
              <Touchable
                accessibilityRole="button"
                accessibilityLabel={tr(locale, "Start over", "Chọn lại từ đầu")}
                accessibilityHint={tr(locale, "Clears occasion and picks", "Xóa dịp và look đã chọn để làm lại")}
                onPress={startOver}
                bg={colors.surface}
                pressedBg={colors.surfaceDeep}
                style={styles.startOverTopBtn}
                testID="final-start-over-btn"
              >
                <RotateCcw size={13} color={colors.ink} strokeWidth={2.2} />
                <AppText variant="caption" weight={700}>
                  {tr(locale, "Start over", "Bắt đầu lại")}
                </AppText>
              </Touchable>
            </View>
          }
          // Same entry point and count format as Choose Occasion ("Saved N").
          right={
            <View style={styles.topRight}>
              <Touchable
                accessibilityRole="button"
                accessibilityLabel="Mở tủ đồ cá nhân"
                onPress={() => setClosetOpen(true)}
                bg={colors.surface}
                pressedBg={colors.surfaceDeep}
                style={styles.closetBtn}
                testID="open-closet-final-btn"
              >
                <Layers size={14} color={colors.ink} strokeWidth={2} />
                <AppText variant="caption" weight={700}>
                  {tr(locale, "Closet", "Tủ đồ")}
                </AppText>
              </Touchable>
              <SavedButton count={savedLoaded ? savedCount : null} onPress={() => setSheetOpen(true)} />
            </View>
          }
        />
      }
      overlay={
        <>
          <FittingDock mode="keep" hooks={hooks} onKeep={handleKeep} hooksDisabled={!!keeping} center={center} />
          <SavedSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} onRemoved={() => toast.show(tr(locale, "Removed", "Đã xoá"))} />
          <ClosetSheet visible={closetOpen} onClose={() => setClosetOpen(false)} />
          <TryOnRecapModal
            visible={recapOpen}
            onClose={() => setRecapOpen(false)}
            recap={effectiveRecap}
            onKeepLook={() => effectiveRecap?.slot && handleKeep(effectiveRecap.slot)}
          />
        </>
      }
    >
      <View style={styles.page}>
        <View style={styles.top}>
          {effectiveRecap ? (
            <Touchable
              onPress={() => setRecapOpen(true)}
              bg={colors.surface}
              pressedBg={colors.surfaceDeep}
              style={styles.recapBanner}
              accessibilityRole="button"
              accessibilityLabel={tr(locale, "Play 30s try-on video", "Phát video 30s thử đồ")}
            >
              <View style={styles.recapBannerLeft}>
                <View style={styles.recapPlayPill}>
                  <Play size={10} color={colors.ink} strokeWidth={2.8} />
                </View>
                <AppText variant="caption" weight={800} tone="ink">
                  {tr(locale, "30s Video", "Video 30s")}
                </AppText>
              </View>
              <AppText variant="tag" weight={800} tone="limeInk">
                {tr(locale, "PLAY", "PHÁT")}
              </AppText>
            </Touchable>
          ) : null}

          <View style={styles.intro}>
            <AppText
              variant="title"
              weight={800}
              helper={isSingleLook ? "Bạn thấy món đồ này thế nào?" : "Bạn giữ món nào?"}
            >
              {isSingleLook ? "How does it look on you?" : "Which one do you keep?"}
            </AppText>
            {pair ? (
              <AppText
                variant="caption"
                tone="muted"
                helper={
                  isSingleLook
                    ? "Nhấn nút 'Giữ' bên dưới để lưu lại món này vào máy."
                    : occasion
                      ? `Cho dịp ${occasion.labelVi.toLowerCase()}. Giữ một món ở dưới để lưu vào máy.`
                      : "Giữ một món ở dưới để lưu vào máy."
                }
              >
                {isSingleLook
                  ? "Tap 'Keep' below to save this look on this phone."
                  : `${occasion ? `For your ${occasion.label.toLowerCase()}. ` : ""}Keep one below to save it on this phone.`}
              </AppText>
            ) : null}
          </View>
        </View>

        {pair && pair.recommendations.length > 0 ? (
          <>
            {isSingleLook ? (
              <View style={styles.singleLookWrap}>
                <LookColumn
                  slot={singleSlot}
                  pick={pair.recommendations[0]!}
                  source={pair.source}
                  saved={isSaved(pair.recommendations[0]!.garmentId)}
                  layout="row"
                  showBadge={false}
                />
              </View>
            ) : pair.recommendations.length >= 2 ? (
              <View style={stacked ? styles.stackedPair : styles.pair}>
                <LookColumn slot="a" pick={pair.recommendations[0]!} source={pair.source} saved={isSaved(pair.recommendations[0]!.garmentId)} layout={stacked ? "row" : "column"} />
                {stacked ? <View style={styles.divider} /> : null}
                <LookColumn slot="b" pick={pair.recommendations[1]!} source={pair.source} saved={isSaved(pair.recommendations[1]!.garmentId)} layout={stacked ? "row" : "column"} />
              </View>
            ) : null}

            <View style={styles.bottomNoteWrap}>
              <FitNote compact />
            </View>
          </>
        ) : picksStatus === "loading" ? (
          <FinalLoading />
        ) : picksStatus === "error" && occasionId ? (
          <FinalError message={picksError} onChooseOccasion={goToStart} />
        ) : (
          <FinalEmpty onChooseOccasion={goToStart} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: 98,
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  startOverTopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    height: 36,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  closetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 36,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
  },
  page: { gap: 6, paddingTop: 2 },
  top: { gap: 4 },
  recapBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
  },
  recapBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recapPlayPill: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    backgroundColor: colors.lime,
    alignItems: "center",
    justifyContent: "center",
  },
  intro: { gap: 2 },
  singleLookWrap: {
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
  },
  pair: { flexDirection: "row", alignItems: "flex-start", gap: spacing.gap },
  stackedPair: { gap: spacing.stack },
  divider: { height: 1, backgroundColor: colors.line },
  bottomNoteWrap: {
    marginTop: 2,
  },
});
