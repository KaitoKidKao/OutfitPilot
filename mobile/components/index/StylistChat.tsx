// Home option B · "Chat with your Stylist" (picked by Sang on 14/11).
//
//   Stylist bubble: greeting + one-line ask
//   input row: free text (custom occasion) + send
//   quick replies: the three catalog occasions, icon + short label
//   gender toggle (icon pills)
//   conversation: the user's line, a typing bubble while /api/style runs, then an
//   answer bubble with Look A / Look B thumbnails and icon-first actions.
//
// Presentational only: app/index.tsx owns the store, the fetch and navigation.
import { ArrowUp, Briefcase, Camera, Coffee, GraduationCap, Info, RotateCcw, Sparkles, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Keyboard, StyleSheet, TextInput, View } from "react-native";

import { AppText, GarmentImage, Touchable } from "@/components/ui";
import { getGarment, type GarmentId, type OccasionId } from "@/lib/catalog";
import { tr, useLocale } from "@/lib/locale";
import { colors, radii } from "@/lib/theme";

export interface QuickReply {
  id: OccasionId;
  icon: LucideIcon;
  en: string;
  vi: string;
}

export const QUICK_REPLIES: readonly QuickReply[] = [
  { id: "job_interview", icon: Briefcase, en: "Interview", vi: "Phỏng vấn" },
  { id: "campus_day", icon: GraduationCap, en: "Campus", vi: "Đi học" },
  { id: "coffee_date", icon: Coffee, en: "Coffee date", vi: "Hẹn cà phê" },
];

export interface StylistChatProps {
  /** Last thing the user asked (quick reply label or typed text). null = nothing yet. */
  userLine: string | null;
  loading: boolean;
  /** Look A / Look B garments once picks are ready for the current ask. */
  looks: readonly [GarmentId, GarmentId] | null;
  /** "fallback" picks must be labelled as such. */
  fallback: boolean;
  gender: "men" | "women";
  onGender: (g: "men" | "women") => void;
  onQuickReply: (reply: QuickReply) => void;
  onSend: (text: string) => void;
  onTryOn: () => void;
  onDetails: () => void;
  onShuffle: () => void;
}

function garmentName(id: GarmentId, locale: "vi" | "en"): string {
  try {
    const g = getGarment(id);
    return locale === "vi" ? (g.nameVi ?? g.name) : g.name;
  } catch {
    return id;
  }
}

export function StylistChat({
  userLine,
  loading,
  looks,
  fallback,
  gender,
  onGender,
  onQuickReply,
  onSend,
  onTryOn,
  onDetails,
  onShuffle,
}: StylistChatProps) {
  const locale = useLocale();
  const [draft, setDraft] = useState("");
  const canSend = draft.trim().length > 0 && !loading;

  const send = () => {
    if (!canSend) return;
    onSend(draft.trim());
    setDraft("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.root} testID="stylist-chat">
      {/* Greeting */}
      <View style={[styles.bubble, styles.stylistBubble]}>
        <View style={styles.stylistHead}>
          <View style={styles.avatar}>
            <Sparkles size={14} color={colors.ink} strokeWidth={2.2} />
          </View>
          <AppText variant="caption" weight={700} tone="limeInk">
            {tr(locale, "Your Stylist", "Stylist của bạn")}
          </AppText>
        </View>
        <AppText variant="title" weight={800}>
          {tr(locale, "Hi! Where are you headed today?", "Chào bạn! Hôm nay bạn mặc đi đâu?")}
        </AppText>
        <AppText variant="bodySm" tone="muted">
          {tr(locale, "Tell me in one line. I'll pick two looks to try on.", "Kể một câu thôi, mình chọn 2 look để bạn thử lên người.")}
        </AppText>
      </View>

      {/* Free text */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={tr(locale, "e.g. Saturday coffee, smart but relaxed", "vd: Thứ Bảy đi cà phê, gọn mà thoải mái")}
          placeholderTextColor={colors.muted}
          maxLength={80}
          returnKeyType="send"
          onSubmitEditing={send}
          accessibilityLabel={tr(locale, "Tell the Stylist your occasion", "Kể cho Stylist dịp của bạn")}
          testID="stylist-input"
        />
        <Touchable
          accessibilityRole="button"
          accessibilityLabel={tr(locale, "Send", "Gửi")}
          accessibilityState={{ disabled: !canSend }}
          disabled={!canSend}
          // onPressIn: with the keyboard up, iOS can spend the first tap's release on the
          // keyboard, so the send fired only on the second tap. Sending on touch-down fixes it.
          onPressIn={send}
          bg={canSend ? colors.ink : colors.surfaceDeep}
          pressedBg={colors.inkWell}
          pressScale={0.94}
          style={styles.sendBtn}
          testID="stylist-send"
        >
          <ArrowUp size={20} color={canSend ? colors.lime : colors.muted} strokeWidth={2.4} />
        </Touchable>
      </View>

      {/* Quick replies + gender */}
      <View style={styles.chips} accessibilityLabel={tr(locale, "Quick occasions", "Dịp nhanh")}>
        {QUICK_REPLIES.map((q) => {
          const Icon = q.icon;
          return (
            <Touchable
              key={q.id}
              accessibilityRole="button"
              accessibilityLabel={tr(locale, q.en, q.vi)}
              disabled={loading}
              onPress={() => onQuickReply(q)}
              bg={colors.paper}
              pressedBg={colors.surface}
              style={styles.chip}
              testID={`quick-${q.id}`}
            >
              <Icon size={16} color={colors.ink} strokeWidth={2} />
              <AppText variant="caption" weight={700}>
                {tr(locale, q.en, q.vi)}
              </AppText>
            </Touchable>
          );
        })}
      </View>

      <View style={styles.genderRow} accessibilityRole="radiogroup" accessibilityLabel={tr(locale, "Style for", "Phối đồ cho")}>
        <AppText variant="caption" tone="muted">
          {tr(locale, "Style for", "Phối cho")}
        </AppText>
        {(["men", "women"] as const).map((g) => {
          const on = gender === g;
          return (
            <Touchable
              key={g}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => onGender(g)}
              bg={on ? colors.ink : colors.surface}
              pressedBg={on ? colors.inkWell : colors.surfaceDeep}
              style={styles.genderPill}
              testID={`gender-${g}-btn`}
            >
              <AppText variant="caption" weight={700} tone={on ? "paper" : "ink"}>
                {g === "men" ? tr(locale, "Men", "Nam") : tr(locale, "Women", "Nữ")}
              </AppText>
            </Touchable>
          );
        })}
      </View>

      {/* Conversation */}
      {userLine ? (
        <View style={[styles.bubble, styles.userBubble]}>
          <AppText variant="body" weight={500} tone="paper">
            {userLine}
          </AppText>
        </View>
      ) : null}

      {userLine && loading ? (
        <View style={[styles.bubble, styles.stylistBubble, styles.typing]} accessibilityLiveRegion="polite">
          <ActivityIndicator size="small" color={colors.ink} />
          <AppText variant="bodySm" weight={600}>
            {tr(locale, "Picking two looks…", "Đang chọn 2 look…")}
          </AppText>
        </View>
      ) : null}

      {userLine && !loading && looks ? (
        <View style={[styles.bubble, styles.stylistBubble, styles.answer]} testID="stylist-answer">
          <AppText variant="bodyStrong">
            {fallback
              ? tr(locale, "Here are two safe picks (default set):", "Đây là 2 look an toàn (bộ gợi ý mặc định):")
              : tr(locale, "Got it. Two looks for you:", "Hiểu rồi. Đây là 2 look cho bạn:")}
          </AppText>
          <View style={styles.looks}>
            {looks.map((id, i) => (
              <View key={id} style={[styles.look, i === 1 && styles.lookB]}>
                <GarmentImage garmentId={id} aspectRatio={1} radius={radii.md} showSampleTag={false} />
                <AppText variant="caption" weight={800} tone={i === 1 ? "limeInk" : "ink"} numberOfLines={1}>
                  {`${i === 0 ? "A" : "B"} · ${garmentName(id, locale)}`}
                </AppText>
              </View>
            ))}
          </View>
          <View style={styles.actions}>
            <Touchable
              accessibilityRole="button"
              accessibilityLabel={tr(locale, "Try both looks on camera", "Thử 2 look lên người")}
              onPress={onTryOn}
              bg={colors.lime}
              pressedBg={colors.limePress}
              pressScale={0.97}
              style={styles.tryBtn}
              testID="stylist-try"
            >
              <Camera size={18} color={colors.ink} strokeWidth={2.2} />
              <AppText variant="button" weight={800}>
                {tr(locale, "Try on", "Thử ngay")}
              </AppText>
            </Touchable>
            <Touchable
              accessibilityRole="button"
              accessibilityLabel={tr(locale, "Why these looks", "Xem lý do chọn")}
              onPress={onDetails}
              bg={colors.paper}
              pressedBg={colors.surface}
              style={styles.iconBtn}
              testID="stylist-details"
            >
              <Info size={18} color={colors.ink} strokeWidth={2} />
            </Touchable>
            <Touchable
              accessibilityRole="button"
              accessibilityLabel={tr(locale, "Pick two new looks", "Đổi 2 look khác")}
              onPress={onShuffle}
              bg={colors.paper}
              pressedBg={colors.surface}
              style={styles.iconBtn}
              testID="stylist-shuffle"
            >
              <RotateCcw size={18} color={colors.ink} strokeWidth={2} />
            </Touchable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12, paddingTop: 6 },
  bubble: { borderRadius: radii.xxl, paddingHorizontal: 14, paddingVertical: 12, gap: 4 },
  stylistBubble: {
    alignSelf: "flex-start",
    maxWidth: "92%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderBottomLeftRadius: 6,
  },
  stylistHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.lime,
    alignItems: "center",
    justifyContent: "center",
  },
  userBubble: { alignSelf: "flex-end", maxWidth: "82%", backgroundColor: colors.ink, borderBottomRightRadius: 6 },
  typing: { flexDirection: "row", alignItems: "center", gap: 8 },
  answer: { width: "92%", gap: 10 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 52,
    paddingLeft: 16,
    paddingRight: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  input: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 0 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  genderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  genderPill: {
    height: 32,
    minWidth: 56,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  looks: { flexDirection: "row", gap: 8 },
  look: { flex: 1, gap: 4, padding: 6, borderRadius: radii.lg, backgroundColor: colors.paper },
  lookB: { backgroundColor: colors.limeSoft },
  actions: { flexDirection: "row", gap: 8 },
  tryBtn: {
    flex: 1,
    height: 48,
    borderRadius: radii.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
});
