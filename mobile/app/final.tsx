// Screen 5 · Final Look (DESIGN.md §6.5): "Which one do you keep?"
// A visible "visual simulation only" note above two columns A | B (photo + letter, name,
// stylist reason, pair-with, honest source), and the Fitting Dock in keep mode: the two
// hooks are the lime "Keep A" / "Keep B" actions, the centre is a quiet "Try again".
// Keeping saves to the device (store.keepLook -> AsyncStorage), toasts, then opens the
// Saved looks sheet. Secondary: "Saved N" (top bar, same as Choose Occasion) and "Start over" (end of page).
import { useFocusEffect, useRouter } from "expo-router";
import { Layers, Play, Repeat, RotateCcw, Shirt } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { ClosetSheet } from "@/components/closet/ClosetSheet";
import { FinalEmpty, FinalError, FinalLoading } from "@/components/final/FinalStates";
import { FitNote } from "@/components/final/FitNote";
import { LookColumn } from "@/components/final/LookColumn";
import { TryOnRecapModal } from "@/components/fitting/TryOnRecapModal";
import { SavedButton } from "@/components/index/SavedButton";
import { FittingDock, type DockCenter } from "@/components/FittingDock";
import { SavedSheet } from "@/components/SavedSheet";
import { AppText, Button, Screen, TopBar, Touchable, useToast } from "@/components/ui";
import type { StyleResponse } from "@/lib/api";
import { getGarment, type GarmentId, type OccasionId } from "@/lib/catalog";
import { tr, useLocale } from "@/lib/locale";
import { getOccasionOption } from "@/lib/occasions";
import { readPreviewSeed } from "@/lib/previewSeed";
import { useAppStore, type Slot } from "@/lib/store";
import { colors, radii, spacing } from "@/lib/theme";

/** Let the "Saved" toast register before the sheet slides over it. */
const SHEET_DELAY_MS = 650;
/** Above this font scale (or below this width) the A | B columns become rows. */
const STACK_FONT_SCALE = 1.35;
const STACK_MIN_WIDTH = 340;

interface ShownPair {
  picks: StyleResponse | null;
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

  // Automatically pop up Try-On Video Recap modal when arriving at Final Look with a freshly recorded session
  useEffect(() => {
    if (latestRecap && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true;
      const timer = setTimeout(() => {
        setRecapOpen(true);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [latestRecap]);

  const view: ShownPair = frozen ?? { picks, occasionId };
  const rawPair = view.picks;
  const pickA = pickFor("a");
  const pickB = pickFor("b");
  const fallbackPair: StyleResponse | null =
    !rawPair && pickA && pickB
      ? {
          recommendations: [pickA, pickB],
          source: "llm",
        }
      : null;
  const pair = rawPair ?? fallbackPair;
  const hooks: [GarmentId | null, GarmentId | null] = [
    pair?.recommendations[0]?.garmentId ?? hookIds[0],
    pair?.recommendations[1]?.garmentId ?? hookIds[1],
  ];
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

  const isSaved = (garmentId: GarmentId) => !!view.occasionId && saved.some((l) => l.garmentId === garmentId && l.occasionId === view.occasionId);

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
      header={
        <TopBar
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
            recap={latestRecap}
            onKeepLook={() => latestRecap?.slot && handleKeep(latestRecap.slot)}
          />
        </>
      }
    >
      <View style={styles.page}>
        <View style={styles.top}>
          {latestRecap ? (
            <Touchable
              onPress={() => setRecapOpen(true)}
              bg={colors.surface}
              pressedBg={colors.surfaceDeep}
              style={styles.recapBanner}
              accessibilityRole="button"
              accessibilityLabel="Xem lại video clip thử đồ"
            >
              <View style={styles.recapBannerLeft}>
                <View style={styles.recapPlayPill}>
                  <Play size={14} color={colors.ink} strokeWidth={2.8} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="caption" weight={800} tone="ink">
                    {tr(locale, "Try-On Video Recap", "Xem lại Video Thử Đồ")} ({latestRecap.durationSeconds}s)
                  </AppText>
                  <AppText variant="tag" tone="muted">
                    {locale === "vi" ? latestRecap.garmentNameVi || latestRecap.garmentName : latestRecap.garmentName} · {tr(locale, "Loop replay · 0 token", "Phát lại vòng lặp · 0 token")}
                  </AppText>
                </View>
              </View>
              <View style={styles.recapBannerBadge}>
                <AppText variant="tag" weight={800} tone="ink">
                  {tr(locale, "REPLAY", "XEM CLIP")}
                </AppText>
              </View>
            </Touchable>
          ) : null}

          <View style={styles.intro}>
            <AppText variant="headline" helper="Bạn giữ món nào?">
              Which one do you keep?
            </AppText>
            {pair ? (
              <AppText
                variant="body"
                tone="muted"
                helper={occasion ? `Cho dịp ${occasion.labelVi.toLowerCase()}. Giữ một món ở dưới để lưu vào máy.` : "Giữ một món ở dưới để lưu vào máy."}
              >
                {occasion ? `For your ${occasion.label.toLowerCase()}. ` : ""}Keep one below to save it on this phone.
              </AppText>
            ) : null}
          </View>

          {/* Honest-claims note before the pair, so it reads without scrolling (§6.5). */}
          {pair ? <FitNote /> : null}
        </View>

        {pair ? (
          <>
            <View style={stacked ? styles.stackedPair : styles.pair}>
              <LookColumn slot="a" pick={pair.recommendations[0]} source={pair.source} saved={isSaved(pair.recommendations[0].garmentId)} layout={stacked ? "row" : "column"} />
              {stacked ? <View style={styles.divider} /> : null}
              <LookColumn slot="b" pick={pair.recommendations[1]} source={pair.source} saved={isSaved(pair.recommendations[1].garmentId)} layout={stacked ? "row" : "column"} />
            </View>

            <View style={styles.startOver}>
              <Button
                label="Start over"
                labelVi="Chọn lại từ đầu"
                variant="ghost"
                icon={RotateCcw}
                onPress={startOver}
                accessibilityHint="Clears this occasion and both picks. Saved looks stay on this phone."
                style={styles.startOverButton}
              />
              <AppText variant="caption" tone="muted" helper="Look đã lưu vẫn còn trên máy." helperVariant="caption">
                Clears the occasion and picks. Saved looks stay.
              </AppText>
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
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  closetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
  },
  page: { gap: spacing.section, paddingTop: 8 },
  top: { gap: spacing.stack },
  recapBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  recapBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  recapPlayPill: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.lime,
    alignItems: "center",
    justifyContent: "center",
  },
  recapBannerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  intro: { gap: 10 },
  pair: { flexDirection: "row", alignItems: "flex-start", gap: spacing.gap },
  stackedPair: { gap: spacing.stack },
  divider: { height: 1, backgroundColor: colors.line },
  startOver: { gap: 6, alignItems: "flex-start" },
  startOverButton: { marginLeft: -14 },
});
