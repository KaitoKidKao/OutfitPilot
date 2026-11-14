// "Trước khi bạn thử đồ" as a bottom-sheet popup (Sang, 15:14). Shown the first time
// the user taps the main button on Camera Setup; reopened from "Quyền riêng tư".
// Truthful copy: the camera streams live to Decart; OutfitPilot screen-records the
// try-on ON THIS PHONE for the recap video, and keeps it only if the user taps Lưu.
import { Film, ShieldCheck, Timer, Video, type LucideIcon } from "lucide-react-native";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText, Touchable } from "@/components/ui";
import { colors, radii } from "@/lib/theme";

const FACTS: { icon: LucideIcon; text: string }[] = [
  { icon: Video, text: "Hình camera được truyền trực tiếp đến dịch vụ AI Decart để vẽ trang phục lên người bạn." },
  { icon: Film, text: "OutfitPilot quay lại màn hình thử đồ ngay trên máy bạn để làm video xem lại; chỉ lưu khi bạn bấm Lưu." },
  { icon: Timer, text: "Mỗi phiên AI tối đa 60 giây và dừng ngay khi bạn rời phòng thử." },
];

export interface ConsentSheetProps {
  visible: boolean;
  /** Already agreed: the sheet is informational, with a single close button. */
  agreed: boolean;
  onAgree: () => void;
  onClose: () => void;
}

export function ConsentSheet({ visible, agreed, onAgree, onClose }: ConsentSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Đóng" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <ShieldCheck size={22} color={colors.ink} strokeWidth={2} />
            <AppText variant="title" weight={800} accessibilityRole="header">
              Trước khi bạn thử đồ
            </AppText>
          </View>
          <View style={styles.facts}>
            {FACTS.map(({ icon: Icon, text }) => (
              <View key={text} style={styles.fact} accessible accessibilityLabel={text}>
                <View style={styles.factIcon}>
                  <Icon size={18} color={colors.ink} strokeWidth={2} />
                </View>
                <AppText variant="bodySm" style={styles.flex}>
                  {text}
                </AppText>
              </View>
            ))}
          </View>
          {agreed ? (
            <Touchable accessibilityRole="button" accessibilityLabel="Đã hiểu" onPress={onClose} bg={colors.ink} pressedBg={colors.ink} style={styles.primary}>
              <AppText variant="label" weight={800} tone="paper">
                Đã hiểu
              </AppText>
            </Touchable>
          ) : (
            <>
              <Touchable
                accessibilityRole="button"
                accessibilityLabel="Đồng ý và bật camera"
                onPress={onAgree}
                bg={colors.lime}
                pressedBg={colors.limePress}
                style={styles.primary}
                testID="consent-agree"
              >
                <AppText variant="label" weight={800}>
                  Đồng ý & bật camera
                </AppText>
              </Touchable>
              <Touchable accessibilityRole="button" accessibilityLabel="Để sau" onPress={onClose} style={styles.secondary}>
                <AppText variant="label" tone="muted">
                  Để sau
                </AppText>
              </Touchable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  handle: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: colors.line },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  facts: { gap: 12 },
  fact: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  factIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.limeSoft, alignItems: "center", justifyContent: "center" },
  primary: { minHeight: 52, borderRadius: radii.full, alignItems: "center", justifyContent: "center" },
  secondary: { minHeight: 44, alignItems: "center", justifyContent: "center" },
});
