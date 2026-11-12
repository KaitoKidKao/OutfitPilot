// Screen 2 · AI Picks (DESIGN.md §6.2).
// The server's stylist answers with two catalog pieces for the chosen occasion:
// Look A (best match) and Look B (alternative). Both hang on the Fitting Dock hooks
// and the lime dock centre moves on to Camera Setup.
//
// States: no occasion (deep link) · loading · error with nothing to show · ready
// (source "llm" or "fallback", labelled honestly) · refreshing a fallback pair.
import { useFocusEffect, useRouter } from "expo-router";
import { Camera, Layers } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState, type ComponentRef } from "react";
import { AccessibilityInfo, StyleSheet, View, type LayoutChangeEvent, type ScrollView } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { ClosetSheet } from "@/components/closet/ClosetSheet";
import { FittingDock, type DockCenter } from "@/components/FittingDock";
import { PICKS_HEADLINE, slotName } from "@/components/picks/copy";
import { HonestFootnote } from "@/components/picks/HonestFootnote";
import { LookCard } from "@/components/picks/LookCard";
import { PicksLoading } from "@/components/picks/PicksLoading";
import { PicksEmpty, PicksError } from "@/components/picks/PicksStates";
import { SourceNote } from "@/components/picks/SourceNote";
import { AppText, Screen, TopBar, Touchable, useToast } from "@/components/ui";
import { getGarment } from "@/lib/catalog";
import { tr, useLocale } from "@/lib/locale";
import { STYLE_OPTIONS } from "@/lib/occasions";
import { useAppStore, type Slot } from "@/lib/store";
import { colors, radii, spacing } from "@/lib/theme";
import { preloadGarmentPhotos } from "@/lib/tryOnSession";

/** Space kept above a card when a hook tap scrolls to it. */
const SCROLL_MARGIN = 12;

export default function AiPicks() {
  const router = useRouter();
  const toast = useToast();
  const locale = useLocale();
  const reduced = useReducedMotion();
  const { occasionId, customOccasion, style, picks, picksStatus, picksError, fetchPicks, activeLook, setActiveLook, hookIds, assignHook } = useAppStore();

  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const cardY = useRef<Record<Slot, number | null>>({ a: null, b: null });
  const mounted = useRef(true);
  const isFocusedRef = useRef(true);
  const [askingAgain, setAskingAgain] = useState(false);
  const [closetOpen, setClosetOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      return () => {
        isFocusedRef.current = false;
      };
    }, []),
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Fetch on arrival or when locale changes while viewing picks.
  // Never re-fetch in the background when locale changes on /setup or /final.
  useEffect(() => {
    if (occasionId && (!picks || isFocusedRef.current)) {
      void fetchPicks();
    }
  }, [occasionId, locale, fetchPicks, picks]);

  // Preload garment base64 assets early while the user reads the picks so the Fitting Room starts faster.
  useEffect(() => {
    if (!picks?.recommendations) return;
    const ids = picks.recommendations.map((r) => r.garmentId).filter(Boolean);
    if (ids.length > 0) preloadGarmentPhotos(ids);
  }, [picks]);

  // Tell screen-reader users when the pair arrives after a wait.
  const prevStatus = useRef(picksStatus);
  useEffect(() => {
    if (prevStatus.current === "loading" && picksStatus === "ready" && picks?.recommendations?.length) {
      const [a, b] = picks.recommendations;
      if (a && b) {
        AccessibilityInfo.announceForAccessibility(`Two looks ready: ${getGarment(a.garmentId).name} and ${getGarment(b.garmentId).name}.`);
      } else if (a) {
        AccessibilityInfo.announceForAccessibility(`Look ready: ${getGarment(a.garmentId).name}.`);
      }
    }
    prevStatus.current = picksStatus;
  }, [picksStatus, picks]);

  const goToOccasions = useCallback(() => router.dismissTo("/"), [router]);

  const retry = useCallback(() => {
    void fetchPicks({ force: true });
  }, [fetchPicks]);

  /** Fallback pair on screen: ask the server again, keep the current pair if it still can't. */
  const askAgain = useCallback(async () => {
    setAskingAgain(true);
    const res = await fetchPicks({ force: true });
    if (!mounted.current) return;
    setAskingAgain(false);
    if (!res)
      toast.show(tr(locale, "Can't reach the stylist. Keeping these two.", "Không kết nối được stylist. Giữ hai gợi ý hiện tại."), {
        announcement: "Can't reach the stylist. Keeping these two looks.",
      });
    else if (res.source === "llm") toast.show(tr(locale, "New picks from AI Stylist", "Gợi ý mới từ AI Stylist"));
    else toast.show(tr(locale, "AI Stylist is still offline", "AI Stylist vẫn đang ngoại tuyến"));
  }, [fetchPicks, locale, toast]);

  // Card offsets inside the scroll content, recorded on layout for hook taps.
  const onLayoutA = useCallback((e: LayoutChangeEvent) => {
    cardY.current.a = e.nativeEvent.layout.y;
  }, []);
  const onLayoutB = useCallback((e: LayoutChangeEvent) => {
    cardY.current.b = e.nativeEvent.layout.y;
  }, []);

  /** Dock hook tap: select that look and bring its card into view. */
  const showCard = useCallback(
    (slot: Slot) => {
      setActiveLook(slot);
      const y = cardY.current[slot];
      if (y !== null) scrollRef.current?.scrollTo({ y: Math.max(0, y - SCROLL_MARGIN), animated: !reduced });
      const id = hookIds[slot === "a" ? 0 : 1];
      if (id) AccessibilityInfo.announceForAccessibility(`${slotName(slot)} selected: ${getGarment(id).name}.`);
    },
    [setActiveLook, reduced, hookIds],
  );

  const handleTrySingle = useCallback(
    (slot: Slot) => {
      if (!picks) return;
      const rec = slot === "a" ? picks.recommendations[0] : picks.recommendations[1];
      if (!rec) return;
      assignHook("a", rec.garmentId);
      assignHook("b", null);
      setActiveLook("a");
      router.push("/setup");
    },
    [picks, assignHook, setActiveLook, router],
  );

  const loading = !!occasionId && !picks && (picksStatus === "loading" || picksStatus === "idle");
  const failed = !!occasionId && !picks && picksStatus === "error";
  const styleOption = style !== "none" ? STYLE_OPTIONS.find((s) => s.value === style) : undefined;
  const headline =
    occasionId === "other" && customOccasion?.trim()
      ? { en: `Two looks for ${customOccasion.trim()}`, vi: `Hai lựa chọn cho ${customOccasion.trim()}` }
      : (occasionId ? PICKS_HEADLINE[occasionId] : null);

  // One lime action per screen: the dock centre when picks exist (or are on their
  // way); otherwise it goes quiet and the recovery button in the content is lime.
  const center: DockCenter = picks
    ? {
        label: "Set up camera",
        labelVi: "Mở camera",
        accessibilityLabel: "Set up camera",
        accessibilityHint: "Opens camera setup. Nothing is sent until you agree there.",
        icon: Camera,
        tone: "lime",
        onPress: () => router.push("/setup"),
      }
    : {
        label: "Set up camera",
        labelVi: "Mở camera",
        accessibilityLabel: loading ? "Set up camera, waiting for your two looks" : "Set up camera, unavailable until you have two looks",
        icon: Camera,
        tone: loading ? "lime" : "quiet",
        loading,
        disabled: true,
        onPress: () => undefined,
      };

  return (
    <Screen
      testID="picks-screen"
      scrollRef={scrollRef}
      header={
        <TopBar
          title="Your picks"
          titleVi="Gợi ý cho bạn"
          right={
            <Touchable
              accessibilityRole="button"
              accessibilityLabel={tr(locale, "Open personal closet", "Mở tủ đồ cá nhân")}
              onPress={() => setClosetOpen(true)}
              bg={colors.surface}
              pressedBg={colors.surfaceDeep}
              style={styles.closetBtn}
              testID="open-closet-picks-btn"
            >
              <Layers size={14} color={colors.ink} strokeWidth={2} />
              <AppText variant="caption" weight={700}>
                {tr(locale, "Closet", "Tủ đồ")}
              </AppText>
            </Touchable>
          }
        />
      }
      overlay={
        <>
          <FittingDock hooks={hookIds} lit={picks ? activeLook : null} onHookPress={picks ? showCard : undefined} center={center} />
          <ClosetSheet visible={closetOpen} onClose={() => setClosetOpen(false)} />
        </>
      }
    >
      {!occasionId || !headline ? (
        <PicksEmpty onChooseOccasion={goToOccasions} />
      ) : (
        <>
          <View style={styles.head}>
            <AppText variant="headline" helper={headline.vi}>
              {headline.en}
            </AppText>
            {styleOption ? (
              <AppText variant="bodySm" tone="muted" helper={`Thiên về ${styleOption.labelVi.toLowerCase()}`} style={styles.styleLine}>
                {`Leaning ${styleOption.label.toLowerCase()}`}
              </AppText>
            ) : null}
          </View>

          {picks ? (
            <>
              <View style={styles.source}>
                <SourceNote source={picks.source} onRetry={picks.source === "fallback" ? () => void askAgain() : undefined} retrying={askingAgain} />
              </View>

              <View onLayout={onLayoutA} style={styles.firstCard}>
                <LookCard testID="look-card-a" slot="a" pick={picks.recommendations[0]} active={activeLook === "a"} onPress={setActiveLook} onTrySingle={handleTrySingle} />
              </View>
              <View onLayout={onLayoutB} style={styles.nextCard}>
                <LookCard testID="look-card-b" slot="b" pick={picks.recommendations[1]} active={activeLook === "b"} onPress={setActiveLook} onTrySingle={handleTrySingle} />
              </View>

              <View style={styles.footnote}>
                <HonestFootnote garmentIds={[picks.recommendations[0].garmentId, picks.recommendations[1].garmentId]} />
              </View>
            </>
          ) : failed ? (
            <View style={styles.source}>
              <PicksError message={picksError} retrying={false} onRetry={retry} onChangeOccasion={goToOccasions} />
            </View>
          ) : (
            <View style={styles.source}>
              <PicksLoading />
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  head: { paddingTop: spacing.gap, gap: 6 },
  styleLine: { marginTop: 4 },
  source: { marginTop: spacing.stack },
  firstCard: { marginTop: spacing.stack + 4 },
  nextCard: { marginTop: spacing.section },
  footnote: { marginTop: spacing.section },
});
