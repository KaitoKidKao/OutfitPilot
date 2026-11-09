// Screen 2 · AI Picks (DESIGN.md §6.2).
// The server's stylist answers with two catalog pieces for the chosen occasion:
// Look A (best match) and Look B (alternative). Both hang on the Fitting Dock hooks
// and the lime dock centre moves on to Camera Setup.
//
// States: no occasion (deep link) · loading · error with nothing to show · ready
// (source "llm" or "fallback", labelled honestly) · refreshing a fallback pair.
import { useRouter } from "expo-router";
import { Camera } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState, type ComponentRef } from "react";
import { AccessibilityInfo, StyleSheet, View, type LayoutChangeEvent, type ScrollView } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { FittingDock, type DockCenter } from "@/components/FittingDock";
import { PICKS_HEADLINE, slotName } from "@/components/picks/copy";
import { HonestFootnote } from "@/components/picks/HonestFootnote";
import { LookCard } from "@/components/picks/LookCard";
import { PicksLoading } from "@/components/picks/PicksLoading";
import { PicksEmpty, PicksError } from "@/components/picks/PicksStates";
import { SourceNote } from "@/components/picks/SourceNote";
import { AppText, Screen, TopBar, useToast } from "@/components/ui";
import { getGarment } from "@/lib/catalog";
import { STYLE_OPTIONS } from "@/lib/occasions";
import { useAppStore, type Slot } from "@/lib/store";
import { spacing } from "@/lib/theme";

/** Space kept above a card when a hook tap scrolls to it. */
const SCROLL_MARGIN = 12;

export default function AiPicks() {
  const router = useRouter();
  const toast = useToast();
  const reduced = useReducedMotion();
  const { occasionId, style, picks, picksStatus, picksError, fetchPicks, activeLook, setActiveLook, hookIds } = useAppStore();

  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const cardY = useRef<Record<Slot, number | null>>({ a: null, b: null });
  const mounted = useRef(true);
  const [askingAgain, setAskingAgain] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Fetch on arrival. The store reuses picks that already match occasion + style.
  useEffect(() => {
    if (occasionId) void fetchPicks();
  }, [occasionId, fetchPicks]);

  // Tell screen-reader users when the pair arrives after a wait.
  const prevStatus = useRef(picksStatus);
  useEffect(() => {
    if (prevStatus.current === "loading" && picksStatus === "ready" && picks) {
      const [a, b] = picks.recommendations;
      AccessibilityInfo.announceForAccessibility(`Two looks ready: ${getGarment(a.garmentId).name} and ${getGarment(b.garmentId).name}.`);
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
    if (!res) toast.show("Can't reach the stylist. Keeping these two.", { announcement: "Can't reach the stylist. Keeping these two looks." });
    else if (res.source === "llm") toast.show("New picks from AI Stylist · Gợi ý mới từ AI Stylist");
    else toast.show("AI Stylist is still offline · AI Stylist vẫn ngoại tuyến");
  }, [fetchPicks, toast]);

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

  const loading = !!occasionId && !picks && (picksStatus === "loading" || picksStatus === "idle");
  const failed = !!occasionId && !picks && picksStatus === "error";
  const styleOption = style !== "none" ? STYLE_OPTIONS.find((s) => s.value === style) : undefined;
  const headline = occasionId ? PICKS_HEADLINE[occasionId] : null;

  // One lime action per screen: the dock centre when picks exist (or are on their
  // way); otherwise it goes quiet and the recovery button in the content is lime.
  const center: DockCenter = picks
    ? {
        label: "Set up camera",
        accessibilityLabel: "Set up camera",
        accessibilityHint: "Opens camera setup. Nothing is sent until you agree there.",
        icon: Camera,
        tone: "lime",
        onPress: () => router.push("/setup"),
      }
    : {
        label: "Set up camera",
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
      header={<TopBar title="Your picks" />}
      overlay={<FittingDock hooks={hookIds} lit={picks ? activeLook : null} onHookPress={picks ? showCard : undefined} center={center} />}
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
              <AppText variant="bodySm" tone="muted" helper={styleOption.labelVi} helperInline style={styles.styleLine}>
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
                <LookCard testID="look-card-a" slot="a" pick={picks.recommendations[0]} active={activeLook === "a"} onPress={setActiveLook} />
              </View>
              <View onLayout={onLayoutB} style={styles.nextCard}>
                <LookCard testID="look-card-b" slot="b" pick={picks.recommendations[1]} active={activeLook === "b"} onPress={setActiveLook} />
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
  head: { paddingTop: spacing.gap, gap: 6 },
  styleLine: { marginTop: 4 },
  source: { marginTop: spacing.stack },
  firstCard: { marginTop: spacing.stack + 4 },
  nextCard: { marginTop: spacing.section },
  footnote: { marginTop: spacing.section },
});
