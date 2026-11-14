// Short suggestions under the try-on media (Sang, 15:07): size verdict, what the
// piece suits, what to pair it with, and whether today's weather fits. All rule-based
// on catalog data, the sample size chart and Open-Meteo; labelled as such.
import { CalendarCheck, CloudSun, Ruler, Shirt, type LucideIcon } from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui";
import { getGarment, type GarmentId } from "@/lib/catalog";
import { chartGender, recommendSize, sizeVerdict, useSizing } from "@/lib/sizing";
import { colors, radii } from "@/lib/theme";
import { describe, fetchWeather, weatherKind, type WeatherNow } from "@/lib/weather";

const STYLE_USES: Record<string, string> = {
  formal: "Phỏng vấn, sự kiện",
  smart: "Đi làm",
  office: "Công sở",
  casual: "Cà phê cuối tuần",
  street: "Dạo phố",
  minimal: "Mặc hằng ngày",
  soft: "Hẹn hò nhẹ nhàng",
  cozy: "Ở nhà, dạo phố",
  date: "Hẹn hò",
  bar: "Đi bar",
  evening: "Tiệc tối",
  party: "Tiệc",
  beach: "Đi biển",
  sport: "Tập thể thao",
  utility: "Dã ngoại",
};

function usesFor(id: GarmentId): string[] {
  const g = getGarment(id);
  const out: string[] = [];
  for (const s of g.styles) {
    const u = STYLE_USES[s];
    if (u && !out.includes(u)) out.push(u);
  }
  if ((g.type === "knitwear" || g.type === "outerwear") && !out.includes("Trời se lạnh")) out.push("Trời se lạnh");
  return out.slice(0, 3);
}

function weatherFit(id: GarmentId, w: WeatherNow): string {
  const g = getGarment(id);
  const warmPiece = g.type === "knitwear" || g.type === "outerwear";
  const k = weatherKind(w);
  const now = `${w.temp}°C, ${describe(w.code).toLowerCase()}`;
  if (k === "rain") return warmPiece ? `Hôm nay ${now}: hợp, nhớ mang ô` : `Hôm nay ${now}: nên khoác thêm áo`;
  if (k === "hot") return warmPiece ? `Hôm nay ${now}: hơi nóng cho món này` : `Hôm nay ${now}: hợp`;
  if (k === "cool" || k === "cold") return warmPiece ? `Hôm nay ${now}: rất hợp` : `Hôm nay ${now}: nên thêm một lớp`;
  return `Hôm nay ${now}: hợp`;
}

let weatherCache: WeatherNow | null = null;

function Row({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <View style={styles.row}>
      <Icon size={16} color={colors.ink} strokeWidth={2.2} />
      <AppText variant="caption" weight={800} style={styles.label}>
        {label}
      </AppText>
      <AppText variant="caption" style={styles.flex} numberOfLines={2}>
        {children}
      </AppText>
    </View>
  );
}

export function RecapSuggestions({ garmentId, gender }: { garmentId: GarmentId; gender: "men" | "women" }) {
  const { body, sizes } = useSizing();
  const [w, setW] = useState<WeatherNow | null>(weatherCache);

  useEffect(() => {
    if (weatherCache) return;
    const ctrl = new AbortController();
    fetchWeather(ctrl.signal)
      .then((x) => {
        weatherCache = x;
        setW(x);
      })
      .catch(() => undefined);
    return () => ctrl.abort();
  }, []);

  const g = getGarment(garmentId);
  const cg = chartGender(garmentId, gender);
  const chosen = sizes[garmentId];
  let sizeLine: string;
  if (body && chosen) {
    const v = sizeVerdict(chosen, body, cg);
    sizeLine = v.tone === "good" ? `${chosen} · Vừa với bạn` : `${chosen} · ${v.title}`;
  } else if (body) {
    sizeLine = `Nên chọn ${recommendSize(body, cg)} (${body.height}cm, ${body.weight}kg)`;
  } else {
    sizeLine = "Nhập chiều cao, cân nặng ở bước Chuẩn bị camera để gợi ý";
  }
  const uses = usesFor(garmentId);
  const pairs = (g.matchingPantsIds ?? [])
    .slice(0, 2)
    .map((id) => {
      try {
        const p = getGarment(id);
        return p.nameVi ?? p.name;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return (
    <View style={styles.card} testID="recap-suggestions">
      <Row icon={Ruler} label="Size">
        {sizeLine}
      </Row>
      {uses.length ? (
        <Row icon={CalendarCheck} label="Hợp để">
          {uses.join(" · ")}
        </Row>
      ) : null}
      {pairs.length ? (
        <Row icon={Shirt} label="Phối với">
          {pairs.join(", ")}
        </Row>
      ) : null}
      {w ? (
        <Row icon={CloudSun} label="Thời tiết">
          {weatherFit(garmentId, w)}
        </Row>
      ) : null}
      <AppText variant="tag" tone="muted">
        Gợi ý theo quy tắc từ dữ liệu mẫu và bảng size mẫu.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: 12, gap: 8, marginTop: 10 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  label: { width: 64 },
});
