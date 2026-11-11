// Privacy + consent block on Camera Setup (DESIGN.md §6.3, note-panel: lime-soft,
// radius 18, padding 16). Says plainly what happens to the camera images, then asks
// for an explicit yes with the platform Switch (iOS HIG / Material both use a switch
// for an on/off agreement). The whole row toggles, so the target is far above 44 pt.
import { ShieldCheck, Timer, Video, type LucideIcon } from "lucide-react-native";
import { Platform, StyleSheet, Switch, View } from "react-native";

import { AppText, Touchable } from "@/components/ui";
import { colors, MIN_TARGET, radii } from "@/lib/theme";

interface Fact {
  icon: LucideIcon;
  text: string;
  textVi: string;
}

const FACTS: readonly Fact[] = [
  {
    icon: Video,
    text: "While you fit, your camera images stream straight to the Decart AI service to draw the outfit on you.",
    textVi: "Khi thử đồ, hình camera được truyền trực tiếp đến dịch vụ AI Decart để vẽ trang phục lên người bạn.",
  },
  {
    icon: ShieldCheck,
    text: "OutfitPilot does not record or save video; Decart processes the live stream directly to draw your outfit.",
    textVi: "OutfitPilot không ghi hay lưu video; Decart xử lý trực tiếp để vẽ trang phục.",
  },
  {
    icon: Timer,
    text: "A session lasts 60 seconds at most and stops as soon as you leave the fitting room.",
    textVi: "Mỗi phiên tối đa 60 giây và dừng ngay khi bạn rời phòng thử.",
  },
];

const AGREE = "I agree to stream my camera to Decart for this try-on";
const AGREE_VI = "Tôi đồng ý truyền hình camera đến Decart để thử đồ";

export interface ConsentPanelProps {
  agreed: boolean;
  onChange: (agreed: boolean) => void;
}

export function ConsentPanel({ agreed, onChange }: ConsentPanelProps) {
  return (
    <View style={styles.panel}>
      <AppText variant="section" accessibilityRole="header" helper="Trước khi bạn thử đồ">
        Before you start fitting
      </AppText>

      <View style={styles.facts}>
        {FACTS.map(({ icon: Icon, text, textVi }) => (
          <View key={text} style={styles.fact} accessible accessibilityLabel={`${text} ${textVi}`}>
            <Icon size={18} color={colors.limeInk} strokeWidth={1.75} style={styles.factIcon} />
            <AppText variant="bodySm" helper={textVi} containerStyle={styles.factText}>
              {text}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <Touchable
        accessibilityRole="switch"
        accessibilityLabel={`${AGREE}. ${AGREE_VI}`}
        accessibilityState={{ checked: agreed }}
        // react-native-web 0.21 reads aria-* only; native reads accessibilityState.
        aria-checked={agreed}
        accessibilityHint={agreed ? "Turns your agreement off" : "Required before Start fitting"}
        onPress={() => onChange(!agreed)}
        style={styles.agreeRow}
      >
        <AppText variant="bodyStrong" helper={AGREE_VI} containerStyle={styles.agreeText}>
          {AGREE}
        </AppText>
        {/* Visual only: the row above carries the switch semantics and the tap. */}
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden pointerEvents="none">
          <Switch
            value={agreed}
            onValueChange={onChange}
            trackColor={{ false: colors.muted, true: colors.ink }}
            thumbColor={Platform.OS === "android" ? colors.paper : undefined}
            ios_backgroundColor={colors.muted}
          />
        </View>
      </Touchable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.limeSoft,
    borderRadius: radii.xl,
    padding: 16,
    gap: 14,
  },
  facts: { gap: 12 },
  fact: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  factIcon: { marginTop: 1 },
  factText: { flex: 1 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.mutedDark },
  agreeRow: {
    minHeight: MIN_TARGET,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radii.md,
  },
  agreeText: { flex: 1 },
});
