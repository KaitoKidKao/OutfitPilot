// Honest source label for the two picks (DESIGN.md §5.4, §5.5).
//  - llm:      one subtle line, "Picked by AI Stylist".
//  - fallback: a clear note panel. The server's AI Stylist was unreachable, so the
//              pair comes from the dress-code rules. It is never called AI.
import { CloudOff, RotateCcw, Sparkles } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Button } from "@/components/ui";
import type { StyleSource } from "@/lib/api";
import { SOURCE_LABEL } from "@/lib/occasions";
import { colors, radii, spacing } from "@/lib/theme";

export interface SourceNoteProps {
  source: StyleSource;
  /** Ask the server again (fallback only). */
  onRetry?: () => void;
  retrying?: boolean;
}

export function SourceNote({ source, onRetry, retrying = false }: SourceNoteProps) {
  if (source === "llm") {
    return (
      <View style={styles.line} accessible accessibilityLabel={`Picked by AI Stylist. ${SOURCE_LABEL.llm.labelVi}`}>
        <Sparkles size={16} color={colors.muted} strokeWidth={1.75} />
        <AppText variant="bodySm" tone="muted" helper={SOURCE_LABEL.llm.labelVi} helperInline style={styles.flex}>
          Picked by AI Stylist
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <View style={styles.panelHead} accessible accessibilityRole="text">
        <CloudOff size={20} color={colors.ink} strokeWidth={1.75} />
        <View style={styles.flex}>
          <AppText variant="bodyStrong" helper={SOURCE_LABEL.fallback.labelVi} helperInline>
            {SOURCE_LABEL.fallback.label}
          </AppText>
          <AppText variant="bodySm" tone="muted" helper="AI Stylist đang ngoại tuyến; hai món theo quy tắc trang phục." containerStyle={styles.copy}>
            AI Stylist is offline. These two follow the dress-code rules.
          </AppText>
        </View>
      </View>
      {onRetry ? (
        <Button
          label="Ask AI Stylist again"
          labelVi="Hỏi lại AI Stylist"
          loadingLabel="Asking AI Stylist…"
          loadingLabelVi="Đang hỏi AI Stylist…"
          icon={RotateCcw}
          variant="ghost"
          loading={retrying}
          onPress={onRetry}
          accessibilityHint="Requests new picks. You keep these if it is still offline."
          style={styles.retry}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  line: { flexDirection: "row", alignItems: "center", gap: 8 },
  panel: { backgroundColor: colors.surface, borderRadius: radii.xl, paddingHorizontal: spacing.stack, paddingTop: 14, paddingBottom: 6, gap: 2 },
  panelHead: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  copy: { marginTop: 2 },
  retry: { marginLeft: 32 - 14 },
});
