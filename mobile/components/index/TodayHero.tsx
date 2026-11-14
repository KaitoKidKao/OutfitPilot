// Home "Hôm nay" (App Store Today feel, Sang 15:30): a date + weather line, a large
// title with a round avatar (opens the body-measurements sheet), and one hero card:
// a SAMPLE outfit picked by a simple rule from the nearest holiday (≤ 7 days) or
// today's weather. "Thử ngay" hangs it on hooks A/B and opens camera setup.
import { Image } from "expo-image";
import { Camera, UserRound } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { BodySheet } from "@/components/SizePicker";
import { AppText, Touchable } from "@/components/ui";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { colors, radii } from "@/lib/theme";
import { TREND_OUTFITS, type TrendOutfit } from "@/lib/trends";
import { daysLeftLabel, upcomingEvents } from "@/lib/upcoming";
import { useTryOutfit } from "@/lib/useTryOutfit";
import { fetchWeather, WEATHER_CITY, weatherKind, type WeatherNow } from "@/lib/weather";

const DAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

/** Holiday → outfit id per gender. */
const EVENT_OUTFIT: Record<string, { women: string; men: string }> = {
  teacher: { women: "W04", men: "M14" },
  blackfriday: { women: "W05", men: "M13" },
  xmas: { women: "W02", men: "M15" },
  countdown: { women: "W01", men: "M14" },
  tet: { women: "W02", men: "M14" },
  valentine: { women: "W03", men: "M11" },
  women: { women: "W09", men: "M11" },
};
const WEATHER_OUTFIT: Record<string, { women: string; men: string }> = {
  hot: { women: "W07", men: "M12" },
  warm: { women: "W09", men: "M11" },
  cool: { women: "W05", men: "M15" },
  cold: { women: "W05", men: "M15" },
  rain: { women: "W05", men: "M15" },
};

let weatherCache: WeatherNow | null = null;

export function TodayHero({ gender }: { gender: "men" | "women" }) {
  const tryOutfit = useTryOutfit();
  const [w, setW] = useState<WeatherNow | null>(weatherCache);
  const [bodyOpen, setBodyOpen] = useState(false);

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

  const now = new Date();
  const dateLine = `${DAYS[now.getDay()]} ${now.getDate()}/${now.getMonth() + 1}${w ? ` · ${w.temp}°C ${WEATHER_CITY.name}` : ""}`;

  const hero = useMemo(() => {
    const ev = upcomingEvents(now, 1)[0];
    const pick = (id: string | undefined): TrendOutfit | undefined =>
      TREND_OUTFITS.find((o) => o.id === id) ?? TREND_OUTFITS.find((o) => o.gender === gender);
    if (ev && ev.daysLeft <= 7) {
      const o = pick(EVENT_OUTFIT[ev.id]?.[gender]);
      if (o)
        return {
          o,
          kicker: `${daysLeftLabel(ev.daysLeft).toUpperCase()} · ${ev.date.getDate()}/${ev.date.getMonth() + 1}`,
          headline: `${o.titleVi} cho ${ev.title}`,
          sub: `${ev.hint}. Thử lên người trong 1 chạm.`,
        };
    }
    const kind = w ? weatherKind(w) : "warm";
    const o = pick(WEATHER_OUTFIT[kind]?.[gender]);
    if (!o) return null;
    return {
      o,
      kicker: "GỢI Ý HÔM NAY",
      headline: `${o.titleVi} cho hôm nay`,
      sub: w ? `Hợp với ${w.temp}°C ở ${WEATHER_CITY.name}. Thử lên người trong 1 chạm.` : "Thử lên người trong 1 chạm.",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender, w]);

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <AppText variant="caption" weight={700} tone="muted">
            {dateLine.toUpperCase()}
          </AppText>
          <AppText variant="headline" weight={800} style={styles.title} accessibilityRole="header">
            Hôm nay
          </AppText>
        </View>
        <Touchable
          accessibilityRole="button"
          accessibilityLabel="Số đo của bạn"
          onPress={() => setBodyOpen(true)}
          bg={colors.surface}
          pressedBg={colors.surfaceDeep}
          style={styles.avatar}
          testID="today-avatar"
        >
          <UserRound size={22} color={colors.ink} strokeWidth={2} />
        </Touchable>
      </View>

      {hero ? (
        <Touchable
          accessibilityRole="button"
          accessibilityLabel={`${hero.kicker}. ${hero.headline}. ${hero.sub} Ảnh mẫu.`}
          onPress={() => tryOutfit(hero.o)}
          bg={colors.ink}
          pressedBg={colors.ink}
          style={styles.hero}
          testID="today-hero"
        >
          <View style={styles.photo}>
            {hero.o.photo ? (
              <Image source={hero.o.photo} style={StyleSheet.absoluteFill} contentFit="cover" />
            ) : (
              <GarmentImage garmentId={hero.o.garments[0]} width="100%" aspectRatio={1.25} radius={0} showSampleTag={false} />
            )}
            <View style={styles.sample}>
              <AppText variant="tag" weight={700} tone="muted">
                Mẫu
              </AppText>
            </View>
          </View>
          <View style={styles.heroText}>
            <AppText variant="tag" weight={800} style={styles.kicker}>
              {hero.kicker}
            </AppText>
            <AppText variant="title" weight={800} tone="paper" numberOfLines={2}>
              {hero.headline}
            </AppText>
            <View style={styles.heroBottom}>
              <AppText variant="caption" style={styles.sub} numberOfLines={1}>
                {hero.sub}
              </AppText>
              <View style={styles.pill}>
                <Camera size={14} color={colors.ink} strokeWidth={2.2} />
                <AppText variant="caption" weight={800}>
                  Thử ngay
                </AppText>
              </View>
            </View>
          </View>
        </Touchable>
      ) : null}
      {bodyOpen ? <BodySheet onClose={() => setBodyOpen(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { gap: 14, marginBottom: 16 },
  titleRow: { flexDirection: "row", alignItems: "flex-end", gap: 12 },
  title: { fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  hero: { borderRadius: 24, overflow: "hidden" },
  photo: { width: "100%", height: 260, backgroundColor: colors.surface, overflow: "hidden" },
  sample: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: radii.full, paddingHorizontal: 8, paddingVertical: 2 },
  heroText: { padding: 16, gap: 6 },
  kicker: { color: colors.lime, letterSpacing: 1 },
  heroBottom: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  sub: { flex: 1, color: "#C9D1CD" },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.lime, borderRadius: radii.full, paddingHorizontal: 14, minHeight: 36 },
});
