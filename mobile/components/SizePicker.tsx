// Size on Camera Setup, compact (Sang, 15:14 redesign):
//   BodyRow  "Số đo của bạn: 170cm · 62kg · Vừa ✎" → opens BodySheet to edit
//   SizeRow  per item: thumbnail + name, S/M/L/XL chips, one-line verdict
// Verdicts come from a SAMPLE size chart and the height/weight typed in (lib/sizing).
import { Check, Pencil, Ruler, TriangleAlert } from "lucide-react-native";
import { useRef, useState, type ComponentRef } from "react";
import { Modal, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText, Touchable } from "@/components/ui";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { getGarment, type GarmentId } from "@/lib/catalog";
import { colors, radii } from "@/lib/theme";
import { chartGender, recommendSize, saveBody, saveSize, SIZES, sizeVerdict, useSizing, type FitPref } from "@/lib/sizing";

const FITS: { key: FitPref; label: string }[] = [
  { key: "om", label: "Ôm" },
  { key: "vua", label: "Vừa" },
  { key: "rong", label: "Rộng" },
];
const fitLabel = (f: FitPref) => FITS.find((x) => x.key === f)?.label ?? "Vừa";

// ---------- body row + sheet ----------

export function BodyRow() {
  const { ready, body } = useSizing();
  const [open, setOpen] = useState(false);
  if (!ready) return null;
  return (
    <>
      <Touchable
        accessibilityRole="button"
        accessibilityLabel={
          body
            ? `Số đo của bạn: ${body.height} xăng-ti-mét, ${body.weight} ki-lô-gam, thích mặc ${fitLabel(body.fit)}. Chạm để sửa`
            : "Nhập chiều cao, cân nặng để gợi ý size"
        }
        onPress={() => setOpen(true)}
        bg={body ? colors.surface : colors.limeSoft}
        pressedBg={colors.surfaceDeep}
        style={styles.bodyRow}
        testID="body-row"
      >
        <Ruler size={18} color={colors.ink} strokeWidth={2} />
        <AppText variant="label" weight={700} style={styles.flex} numberOfLines={1}>
          {body ? `Số đo của bạn: ${body.height}cm · ${body.weight}kg · ${fitLabel(body.fit)}` : "Nhập chiều cao, cân nặng để gợi ý size"}
        </AppText>
        <Pencil size={16} color={colors.muted} strokeWidth={2} />
      </Touchable>
      {open ? <BodySheet onClose={() => setOpen(false)} /> : null}
    </>
  );
}

export function BodySheet({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { body } = useSizing();
  const [h, setH] = useState(body ? String(body.height) : "");
  const [w, setW] = useState(body ? String(body.weight) : "");
  const [fit, setFit] = useState<FitPref>(body?.fit ?? "vua");
  const weightRef = useRef<ComponentRef<typeof TextInput>>(null);

  const hv = Number(h);
  const wv = Number(w);
  const valid = hv >= 120 && hv <= 220 && wv >= 30 && wv <= 200;
  const submit = () => {
    if (!valid) return;
    void saveBody({ height: Math.round(hv), weight: Math.round(wv), fit });
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Đóng" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <AppText variant="title" weight={800} accessibilityRole="header">
            Số đo của bạn
          </AppText>
          <AppText variant="caption" tone="muted">
            Dùng để gợi ý size, chỉ lưu trên máy này. Camera không đo cơ thể bạn.
          </AppText>
          <View style={styles.inputs}>
            <View style={styles.inputWrap}>
              <TextInput
                value={h}
                onChangeText={setH}
                keyboardType="numbers-and-punctuation"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => weightRef.current?.focus()}
                placeholder="Cao"
                placeholderTextColor={colors.muted}
                style={styles.input}
                maxLength={3}
                autoFocus={!body}
                accessibilityLabel="Chiều cao, đơn vị xăng-ti-mét"
              />
              <AppText variant="caption" tone="muted">
                cm
              </AppText>
            </View>
            <View style={styles.inputWrap}>
              <TextInput
                ref={weightRef}
                value={w}
                onChangeText={setW}
                keyboardType="numbers-and-punctuation"
                returnKeyType="done"
                onSubmitEditing={submit}
                placeholder="Nặng"
                placeholderTextColor={colors.muted}
                style={styles.input}
                maxLength={3}
                accessibilityLabel="Cân nặng, đơn vị ki-lô-gam"
              />
              <AppText variant="caption" tone="muted">
                kg
              </AppText>
            </View>
          </View>
          <View style={styles.chips}>
            <AppText variant="caption" tone="muted">
              Thích mặc
            </AppText>
            {FITS.map((f) => (
              <Touchable
                key={f.key}
                accessibilityRole="radio"
                accessibilityState={{ selected: fit === f.key }}
                accessibilityLabel={`Thích mặc ${f.label.toLowerCase()}`}
                onPress={() => setFit(f.key)}
                bg={fit === f.key ? colors.ink : colors.surface}
                pressedBg={colors.surfaceDeep}
                style={styles.fitChip}
              >
                <AppText variant="caption" weight={700} tone={fit === f.key ? "paper" : "ink"}>
                  {f.label}
                </AppText>
              </Touchable>
            ))}
          </View>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel="Lưu số đo"
            accessibilityState={{ disabled: !valid }}
            disabled={!valid}
            onPress={submit}
            bg={colors.lime}
            pressedBg={colors.limePress}
            style={[styles.primary, !valid && styles.dim]}
            testID="body-save"
          >
            <Check size={18} color={colors.ink} strokeWidth={2.4} />
            <AppText variant="label" weight={800}>
              Lưu số đo
            </AppText>
          </Touchable>
        </View>
      </View>
    </Modal>
  );
}

// ---------- one compact row per item ----------

export function SizeRow({ garmentId, gender, slot }: { garmentId: GarmentId; gender: "men" | "women"; slot?: "A" | "B" }) {
  const { ready, body, sizes } = useSizing();
  if (!ready) return null;
  const g = getGarment(garmentId);
  const cg = chartGender(garmentId, gender);
  const chosen = sizes[garmentId] ?? null;
  const suggested = body ? recommendSize(body, cg) : null;
  const verdict = body && chosen ? sizeVerdict(chosen, body, cg) : null;

  return (
    <View style={styles.item} testID={`size-row-${garmentId}`}>
      <GarmentImage garmentId={garmentId} width={52} radius={radii.sm} showSampleTag={false} />
      <View style={styles.itemBody}>
        <AppText variant="caption" weight={800} numberOfLines={1}>
          {slot ? `${slot} · ` : ""}
          {g.nameVi ?? g.name}
        </AppText>
        <View style={styles.sizeChips}>
          {SIZES.map((s) => {
            const on = chosen === s;
            return (
              <Touchable
                key={s}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`Size ${s}${suggested === s ? ", gợi ý cho bạn" : ""}`}
                onPress={() => void saveSize(garmentId, s)}
                bg={on ? colors.ink : colors.paper}
                pressedBg={colors.surfaceDeep}
                style={[styles.sizeChip, suggested === s && !on && styles.suggested]}
                testID={`size-${s}`}
              >
                <AppText variant="caption" weight={800} tone={on ? "paper" : "ink"}>
                  {s}
                </AppText>
              </Touchable>
            );
          })}
        </View>
        {verdict ? (
          <View style={styles.verdict}>
            {verdict.tone === "good" ? (
              <Check size={14} color="#3F7A0E" strokeWidth={2.6} />
            ) : (
              <TriangleAlert size={14} color="#A15C00" strokeWidth={2.4} />
            )}
            <AppText variant="caption" weight={700} style={verdict.tone === "good" ? styles.good : styles.warn} numberOfLines={1}>
              {verdict.title}
            </AppText>
          </View>
        ) : (
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {suggested ? `Gợi ý: size ${suggested} (viền xanh)` : "Nhập số đo để được gợi ý size"}
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bodyRow: { minHeight: 48, borderRadius: radii.md, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 14,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  handle: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: colors.line },
  inputs: { flexDirection: "row", gap: 10 },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  input: { flex: 1, fontSize: 17, color: colors.ink, paddingVertical: 10 },
  chips: { flexDirection: "row", alignItems: "center", gap: 8 },
  fitChip: { minHeight: 44, minWidth: 56, paddingHorizontal: 14, borderRadius: radii.full, alignItems: "center", justifyContent: "center" },
  primary: { minHeight: 52, borderRadius: radii.full, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  dim: { opacity: 0.5 },
  item: { flexDirection: "row", gap: 12, alignItems: "center" },
  itemBody: { flex: 1, gap: 6 },
  sizeChips: { flexDirection: "row", gap: 6 },
  sizeChip: {
    width: 46,
    height: 44,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  suggested: { borderColor: "#7DB52A", borderWidth: 2 },
  verdict: { flexDirection: "row", alignItems: "center", gap: 6 },
  good: { color: "#3F7A0E" },
  warn: { color: "#A15C00" },
});
