// Weather card + "Sắp tới nên mặc" strip at the top of Gợi ý cho bạn.
// Open-Meteo for Hà Nội; the clothes are picked by a simple temperature/rain rule
// (said plainly on the card, no AI claim). Tapping a garment opens try-on with it.
import { Cloud, CloudRain, CloudSun, Sun, Thermometer } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppText, Touchable } from "@/components/ui";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { getGarment, type GarmentId } from "@/lib/catalog";
import { colors, radii, spacing } from "@/lib/theme";
import { describe, fetchWeather, WEATHER_CITY, wearAdvice, weatherKind, type WeatherNow } from "@/lib/weather";

export interface WeatherWearProps {
  gender: "men" | "women";
  onTry: (garmentId: GarmentId) => void;
}

function WeatherIcon({ w }: { w: WeatherNow }) {
  const props = { size: 26, color: colors.ink, strokeWidth: 2 };
  if (weatherKind(w) === "rain") return <CloudRain {...props} />;
  if (w.code === 0) return <Sun {...props} />;
  if (w.code <= 2) return <CloudSun {...props} />;
  if (w.code === 3) return <Cloud {...props} />;
  return <Thermometer {...props} />;
}

export function WeatherWear({ gender, onTry }: WeatherWearProps) {
  const [w, setW] = useState<WeatherNow | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchWeather(ctrl.signal)
      .then(setW)
      .catch(() => {
        if (!ctrl.signal.aborted) setFailed(true);
      });
    return () => ctrl.abort();
  }, []);

  if (failed) {
    return (
      <View style={[styles.card, styles.cardQuiet]}>
        <Cloud size={18} color={colors.muted} strokeWidth={2} />
        <AppText variant="caption" tone="muted">
          Không lấy được thời tiết {WEATHER_CITY.name} lúc này.
        </AppText>
      </View>
    );
  }
  if (!w) {
    return (
      <View style={[styles.card, styles.cardQuiet]}>
        <Cloud size={18} color={colors.muted} strokeWidth={2} />
        <AppText variant="caption" tone="muted">
          Đang xem thời tiết {WEATHER_CITY.name}…
        </AppText>
      </View>
    );
  }

  const advice = wearAdvice(weatherKind(w), gender);
  const rainLine = w.rainFrom ? `Từ ${w.rainFrom} có thể mưa (${w.rainMax}%)` : `Mưa ${w.rainMax}% trong 12 giờ tới`;

  return (
    <View style={styles.wrap}>
      <View style={styles.card} accessible accessibilityLabel={`${WEATHER_CITY.name}: ${w.temp} độ, ${describe(w.code)}. ${rainLine}.`}>
        <View style={styles.iconBox}>
          <WeatherIcon w={w} />
        </View>
        <View style={styles.flex}>
          <AppText variant="title" weight={800}>
            {w.temp}°C · {describe(w.code)}
          </AppText>
          <AppText variant="caption" tone="muted">
            {WEATHER_CITY.name} · {w.tMin}–{w.tMax}°C · {rainLine}
          </AppText>
        </View>
      </View>

      <View style={styles.adviceHead}>
        <AppText variant="label" weight={800}>
          Sắp tới nên mặc
        </AppText>
        <AppText variant="caption" tone="muted">
          {advice.headline}. {advice.tip}
        </AppText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroller} contentContainerStyle={styles.row}>
        {advice.garments.map((id) => {
          const g = getGarment(id);
          return (
            <Touchable
              key={id}
              accessibilityRole="button"
              accessibilityLabel={`${g.nameVi ?? g.name}. Chạm để thử ngay`}
              onPress={() => onTry(id)}
              bg={colors.paper}
              pressedBg={colors.surface}
              style={styles.item}
              testID={`wear-${id}`}
            >
              <GarmentImage garmentId={id} width="100%" aspectRatio={1} radius={radii.md} showSampleTag={false} />
              <AppText variant="caption" weight={700} numberOfLines={2}>
                {g.nameVi ?? g.name}
              </AppText>
              <View style={styles.tryPill}>
                <AppText variant="tag" weight={800} tone="ink">
                  Thử ngay
                </AppText>
              </View>
            </Touchable>
          );
        })}
      </ScrollView>
      <AppText variant="tag" tone="muted" style={styles.note}>
        Gợi ý theo quy tắc nhiệt độ và khả năng mưa (Open-Meteo).
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.gap },
  flex: { flex: 1 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.limeSoft,
  },
  cardQuiet: { backgroundColor: colors.surface, marginTop: spacing.gap },
  iconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.lime, alignItems: "center", justifyContent: "center" },
  adviceHead: { marginTop: 14, gap: 2, marginBottom: 10 },
  scroller: { marginHorizontal: -20 },
  row: { paddingHorizontal: 20, gap: 10 },
  item: { width: 120, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line, padding: 8, gap: 6 },
  tryPill: { alignSelf: "flex-start", backgroundColor: colors.lime, borderRadius: radii.full, paddingHorizontal: 8, paddingVertical: 3 },
  note: { marginTop: 8 },
});
