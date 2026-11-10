// Pre-Stage Health Check Modal (docs/plan.md Step 3 / Agent Critique):
// Hidden diagnostic tool opened by long-pressing the BrandMark logo for 2 seconds.
// Pings Vercel API, verifies Decart token minting, checks AI Stylist LLM,
// and gives the team 100% confidence before walking onto the hackathon stage.

import { CheckCircle, Cloud, Cpu, Key, RefreshCw, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, Platform, StyleSheet, View } from "react-native";

import { AppText, Button, Touchable } from "@/components/ui";
import { API_URL, describeApiError, getHealth, postRealtimeToken, postStyle } from "@/lib/api";
import { colors, radii, shadows, spacing } from "@/lib/theme";

interface TestStatus {
  loading: boolean;
  ok: boolean | null;
  latencyMs: number | null;
  detail: string | null;
}

const initialStatus = (): TestStatus => ({
  loading: false,
  ok: null,
  latencyMs: null,
  detail: null,
});

export function PreStageModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [apiHealth, setApiHealth] = useState<TestStatus>(initialStatus);
  const [stylist, setStylist] = useState<TestStatus>(initialStatus);
  const [decart, setDecart] = useState<TestStatus>(initialStatus);
  const [runningAll, setRunningAll] = useState(false);

  const runTests = useCallback(async () => {
    setRunningAll(true);

    // 1. Test /api/health
    setApiHealth({ loading: true, ok: null, latencyMs: null, detail: "Pinging server…" });
    const healthStart = Date.now();
    try {
      const data = await getHealth();
      const latency = Date.now() - healthStart;
      setApiHealth({
        loading: false,
        ok: data.ok === true,
        latencyMs: latency,
        detail: `${latency}ms · Server 200 OK`,
      });
    } catch (e) {
      setApiHealth({
        loading: false,
        ok: false,
        latencyMs: Date.now() - healthStart,
        detail: describeApiError(e),
      });
    }

    // 2. Test /api/style (OpenAI LLM)
    setStylist({ loading: true, ok: null, latencyMs: null, detail: "Testing AI Stylist…" });
    const styleStart = Date.now();
    try {
      const data = await postStyle({ occasionId: "job_interview", style: "minimal", locale: "vi" });
      const latency = Date.now() - styleStart;
      const isLlm = data.source === "llm";
      setStylist({
        loading: false,
        ok: isLlm,
        latencyMs: latency,
        detail: `${latency}ms · Source: ${data.source} (${data.recommendations.length} picks)`,
      });
    } catch (e) {
      setStylist({
        loading: false,
        ok: false,
        latencyMs: Date.now() - styleStart,
        detail: describeApiError(e),
      });
    }

    // 3. Test /api/realtime-token (Decart VTON)
    setDecart({ loading: true, ok: null, latencyMs: null, detail: "Minting Decart token…" });
    const decartStart = Date.now();
    try {
      const data = await postRealtimeToken();
      const latency = Date.now() - decartStart;
      const hasToken = typeof data.token === "string" && data.token.length > 20;
      setDecart({
        loading: false,
        ok: hasToken,
        latencyMs: latency,
        detail: `${latency}ms · Token OK (${data.model})`,
      });
    } catch (e) {
      setDecart({
        loading: false,
        ok: false,
        latencyMs: Date.now() - decartStart,
        detail: describeApiError(e),
      });
    }

    setRunningAll(false);
  }, []);

  useEffect(() => {
    if (visible) void runTests();
  }, [visible, runTests]);

  const allPassed = apiHealth.ok && stylist.ok && decart.ok;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.head}>
            <View>
              <AppText variant="title">Pre-Stage Health Check</AppText>
              <AppText variant="caption" tone="muted">
                Kiểm tra toàn hệ thống trước khi lên sân khấu
              </AppText>
            </View>
            <Touchable onPress={onClose} accessibilityLabel="Đóng" style={styles.closeBtn}>
              <X size={20} color={colors.ink} />
            </Touchable>
          </View>

          <View style={styles.statusList}>
            {/* 1. API Health */}
            <View style={styles.item}>
              <View style={styles.iconBox}>
                <Cloud size={20} color={colors.ink} />
              </View>
              <View style={styles.itemContent}>
                <AppText variant="bodyStrong">Backend Vercel API</AppText>
                <AppText variant="caption" tone={apiHealth.ok ? "ink" : "danger"}>
                  {apiHealth.detail ?? "Chưa kiểm tra"}
                </AppText>
              </View>
              {apiHealth.loading ? (
                <ActivityIndicator size="small" color={colors.ink} />
              ) : apiHealth.ok ? (
                <CheckCircle size={20} color={colors.limeInk} />
              ) : (
                <X size={20} color={colors.danger} />
              )}
            </View>

            {/* 2. OpenAI Stylist */}
            <View style={styles.item}>
              <View style={styles.iconBox}>
                <Cpu size={20} color={colors.ink} />
              </View>
              <View style={styles.itemContent}>
                <AppText variant="bodyStrong">OpenAI Stylist (LLM)</AppText>
                <AppText variant="caption" tone={stylist.ok ? "ink" : "danger"}>
                  {stylist.detail ?? "Chưa kiểm tra"}
                </AppText>
              </View>
              {stylist.loading ? (
                <ActivityIndicator size="small" color={colors.ink} />
              ) : stylist.ok ? (
                <CheckCircle size={20} color={colors.limeInk} />
              ) : (
                <X size={20} color={colors.danger} />
              )}
            </View>

            {/* 3. Decart Token */}
            <View style={styles.item}>
              <View style={styles.iconBox}>
                <Key size={20} color={colors.ink} />
              </View>
              <View style={styles.itemContent}>
                <AppText variant="bodyStrong">Decart Lucy VTON Token</AppText>
                <AppText variant="caption" tone={decart.ok ? "ink" : "danger"}>
                  {decart.detail ?? "Chưa kiểm tra"}
                </AppText>
              </View>
              {decart.loading ? (
                <ActivityIndicator size="small" color={colors.ink} />
              ) : decart.ok ? (
                <CheckCircle size={20} color={colors.limeInk} />
              ) : (
                <X size={20} color={colors.danger} />
              )}
            </View>
          </View>

          {/* Verdict banner */}
          <View style={[styles.verdict, allPassed ? styles.verdictOk : styles.verdictWarn]}>
            <AppText variant="bodySm" tone="ink" weight={700}>
              {allPassed
                ? "Sẵn sàng lên sân khấu! Mọi dịch vụ hoạt động hoàn hảo."
                : runningAll
                  ? "Đang chạy bài kiểm tra..."
                  : "Có dịch vụ chưa đạt! Hãy kiểm tra kết nối mạng."}
            </AppText>
          </View>

          {/* Environment info */}
          <View style={styles.infoRow}>
            <AppText variant="caption" tone="muted">
              OS: {Platform.OS} · URL: {API_URL ?? "chưa cấu hình"}
            </AppText>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              label="Kiểm tra lại"
              icon={RefreshCw}
              variant="ghost"
              loading={runningAll}
              onPress={() => void runTests()}
              style={styles.flex}
            />
            <Button label="Xong" variant="next" onPress={onClose} style={styles.flex} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.gutter,
    width: "100%",
    maxWidth: 400,
    gap: 16,
    ...shadows.dock,
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  closeBtn: {
    padding: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceDeep,
  },
  statusList: {
    gap: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceDeep,
    padding: 12,
    borderRadius: radii.lg,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  verdict: {
    padding: 12,
    borderRadius: radii.md,
    alignItems: "center",
  },
  verdictOk: {
    backgroundColor: colors.lime,
  },
  verdictWarn: {
    backgroundColor: "#FEE2E2",
  },
  infoRow: {
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  flex: {
    flex: 1,
  },
});
