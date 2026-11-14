// Screen 1 · Home: "Chat with your Stylist" (home option B, chosen 14/11).
//
//   brand row (OP mark + Closet · Saved N)
//   StylistChat: greeting, free-text ask, quick occasions, gender, then the
//   user's line, a typing bubble and an inline Look A / Look B answer
//   Fitting Dock: hooks fill with the picks; lime centre becomes "Try on" once picks exist
//
// Asking (quick reply or typed text) sets the occasion (typed text = "other" +
// customOccasion) and runs store.fetchPicks() once the store has the new occasion.
// The answer stays on this screen; "Try on" opens /setup, (i) opens /picks.
// A failure shows the PicksErrorPanel above the dock, centre turns into "Try again".
import { useFocusEffect, useRouter } from "expo-router";
import { Layers, RotateCcw, Sparkles, Wrench } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState, type ComponentRef } from "react";
import { StyleSheet, View, type LayoutChangeEvent, type ScrollView } from "react-native";

import { ClosetSheet } from "@/components/closet/ClosetSheet";
import { PicksErrorPanel } from "@/components/index/DockNotes";
import { QuickTry } from "@/components/index/QuickTry";
import { TodayHero } from "@/components/index/TodayHero";
import { StylistChat, type QuickReply } from "@/components/index/StylistChat";
import { NavBar, type NavCenter } from "@/components/NavBar";
import { PreStageModal } from "@/components/PreStageModal";
import { SavedSheet } from "@/components/SavedSheet";
import { AppText, BrandMark, Screen, TopBar, Touchable, useDockClearance, useToast } from "@/components/ui";
import { getOccasionOption } from "@/lib/occasions";
import { tr, useLocale } from "@/lib/locale";
import { useAppStore } from "@/lib/store";
import { colors, radii, spacing } from "@/lib/theme";

export default function Home() {
  const router = useRouter();
  const toast = useToast();
  const locale = useLocale();
  const clearance = useDockClearance();
  const {
    occasionId,
    customOccasion,
    gender,
    setGender,
    setOccasion,
    setCustomOccasion,
    fetchPicks,
    picks,
    picksStatus,
    picksError,
    picksErrorCode,
    picksErrorStatus,
    hookIds,
    resetHooks,
  } = useAppStore();

  const [savedOpen, setSavedOpen] = useState(false);
  const [closetOpen, setClosetOpen] = useState(false);
  const [healthCheckOpen, setHealthCheckOpen] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [aboveHeight, setAboveHeight] = useState(0);
  const [userLine, setUserLine] = useState<string | null>(null);
  const askPendingRef = useRef(false);

  const occasion = occasionId ? getOccasionOption(occasionId) : null;
  const loading = picksStatus === "loading";
  const ready = picksStatus === "ready" && !!picks;
  const showError = picksStatus === "error" && !errorDismissed;

  useFocusEffect(
    useCallback(() => {
      // Returning home: drop single-garment closet hooks so the dock shows the picks again.
      resetHooks();
    }, [resetHooks]),
  );

  const ask = useCallback(
    (force = false) => {
      if (!occasionId) return;
      setErrorDismissed(false);
      void fetchPicks(force ? { force: true } : undefined);
    },
    [occasionId, fetchPicks],
  );

  // Run the ask after the store has committed the new occasion / custom text.
  useEffect(() => {
    if (!askPendingRef.current || !occasionId) return;
    askPendingRef.current = false;
    ask();
  }, [occasionId, customOccasion, ask]);

  const onQuickReply = useCallback(
    (q: QuickReply) => {
      setUserLine(tr(locale, q.en, q.vi));
      // Same occasion again: nothing changes in the store, so ask right away.
      if (occasionId === q.id && !customOccasion) {
        ask(true);
        return;
      }
      setCustomOccasion(null);
      if (occasionId !== q.id) setOccasion(q.id);
      askPendingRef.current = true;
    },
    [locale, occasionId, customOccasion, ask, setOccasion, setCustomOccasion],
  );

  const onSend = useCallback(
    (text: string) => {
      setUserLine(text);
      if (occasionId === "other" && customOccasion === text) {
        ask(true);
        return;
      }
      if (occasionId !== "other") setOccasion("other");
      setCustomOccasion(text);
      askPendingRef.current = true;
    },
    [occasionId, customOccasion, ask, setOccasion, setCustomOccasion],
  );

  const onAboveLayout = useCallback((e: LayoutChangeEvent) => setAboveHeight(Math.ceil(e.nativeEvent.layout.height)), []);

  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const looksKey = ready && picks ? `${picks.recommendations[0].garmentId}|${picks.recommendations[1].garmentId}` : null;
  // Bring the new answer (cards + Thử ngay / (i) / ↻) into view above the nav bar.
  useEffect(() => {
    if (!looksKey && !loading) return;
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    return () => clearTimeout(id);
  }, [looksKey, loading]);

  const looks = ready && picks ? ([picks.recommendations[0].garmentId, picks.recommendations[1].garmentId] as const) : null;
  // Coming back to home with picks already made: keep the conversation visible.
  const occasionLabel = occasion ? (locale === "vi" ? occasion.labelVi : occasion.label) : null;
  const displayLine = userLine ?? (ready ? (occasionId === "other" && customOccasion ? customOccasion : occasionLabel) : null);

  // ----- nav bar centre: "Thử ngay" once looks exist; while asking, a spinner -----
  const hasAnyHook = hookIds[0] !== null || hookIds[1] !== null;
  let center: NavCenter | undefined;
  if (loading) {
    center = { accessibilityLabel: "Đang phối 2 look", icon: Sparkles, loading: true, onPress: () => undefined };
  } else if (picksStatus === "error") {
    center = { accessibilityLabel: "Thử lại: chọn 2 look", icon: RotateCcw, onPress: () => ask(true) };
  } else if (!(ready || hasAnyHook) && occasion) {
    center = { accessibilityLabel: "Phối đồ: chọn 2 look", icon: Sparkles, onPress: () => ask() };
  }
  // Otherwise the bar's default centre: "Thử ngay" → /setup (or a hint when no looks yet).

  const above = showError ? (
    <PicksErrorPanel message={picksError} code={picksErrorCode} status={picksErrorStatus} onDismiss={() => setErrorDismissed(true)} onLayout={onAboveLayout} />
  ) : null;

  return (
    <Screen
      scrollRef={scrollRef}
      header={
        <TopBar
          showBack={false}
          inset="gutter"
          left={<BrandMark onLongPress={() => setHealthCheckOpen(true)} />}
          right={
            <View style={styles.topRight}>
              <Touchable
                accessibilityRole="button"
                accessibilityLabel="Mở tủ đồ cá nhân"
                onPress={() => setClosetOpen(true)}
                bg={colors.surface}
                pressedBg={colors.surfaceDeep}
                style={styles.closetBtn}
                testID="open-closet-btn"
              >
                <Layers size={14} color={colors.ink} strokeWidth={2} />
                <AppText variant="caption" weight={700}>
                  {tr(locale, "Closet", "Tủ đồ")}
                </AppText>
              </Touchable>
            </View>
          }
        />
      }
      contentStyle={above ? { paddingBottom: clearance + aboveHeight + spacing.gap } : undefined}
      overlay={
        <>
          <NavBar active="home" center={center} above={above} testID="occasion-dock" />
          <SavedSheet
            visible={savedOpen}
            onClose={() => setSavedOpen(false)}
            onRemoved={() => toast.show(tr(locale, "Removed", "Đã xoá"), { announcement: "Look removed" })}
          />
          <ClosetSheet visible={closetOpen} onClose={() => setClosetOpen(false)} />
          <PreStageModal visible={healthCheckOpen} onClose={() => setHealthCheckOpen(false)} />
        </>
      }
      testID="screen-choose-occasion"
    >
      {!looks && !loading ? <TodayHero gender={gender} /> : null}

      <StylistChat
        userLine={displayLine}
        loading={loading}
        looks={looks}
        fallback={picks?.source === "fallback"}
        gender={gender}
        onGender={setGender}
        onQuickReply={onQuickReply}
        onSend={onSend}
        onTryOn={() => router.push("/setup")}
        onDetails={() => router.push("/picks")}
        onShuffle={() => ask(true)}
      />

      {/* Quick try-on: only before the Stylist has answered, to keep the chat uncluttered. */}
      {!looks && !loading ? <QuickTry gender={gender} /> : null}

      {__DEV__ ? (
        <Touchable
          accessibilityRole="link"
          accessibilityLabel="Open the Gate 1 dev harness"
          onPress={() => router.push("/dev/tryon")}
          bg={colors.paper}
          pressedBg={colors.surface}
          style={styles.devLink}
          testID="dev-harness-link"
        >
          <Wrench size={14} color={colors.muted} strokeWidth={1.75} />
          <AppText variant="caption" tone="muted">
            Dev harness · Gate 1
          </AppText>
        </Touchable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRight: { flexDirection: "row", alignItems: "center", gap: 8 },
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
  devLink: {
    marginTop: spacing.stack,
    alignSelf: "flex-start",
    minHeight: 36,
    paddingHorizontal: 8,
    marginLeft: -8,
    borderRadius: radii.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
