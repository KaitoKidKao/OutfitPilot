// Weather for the Gợi ý tab: Open-Meteo (free, no key, https), Hà Nội by default.
// What-to-wear is a simple RULE on temperature and rain chance, not AI.
import type { GarmentId } from "./catalog";

export const WEATHER_CITY = { name: "Hà Nội", lat: 21.03, lon: 105.85 } as const;

export interface WeatherNow {
  temp: number;
  code: number;
  /** Highest rain chance (%) over the next hours window. */
  rainMax: number;
  /** First upcoming hour ("HH:00") with rain chance ≥ 50%, if any. */
  rainFrom: string | null;
  /** Min / max temperature over the next hours. */
  tMin: number;
  tMax: number;
}

const URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_CITY.lat}&longitude=${WEATHER_CITY.lon}` +
  "&current=temperature_2m,weather_code&hourly=temperature_2m,precipitation_probability&forecast_hours=12&timezone=Asia%2FHo_Chi_Minh";

export async function fetchWeather(signal?: AbortSignal): Promise<WeatherNow> {
  const res = await fetch(URL, { signal });
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const j = await res.json();
  const temps: number[] = j.hourly?.temperature_2m ?? [];
  const rain: number[] = j.hourly?.precipitation_probability ?? [];
  const times: string[] = j.hourly?.time ?? [];
  const idx = rain.findIndex((p) => p >= 50);
  return {
    temp: Math.round(j.current.temperature_2m),
    code: j.current.weather_code,
    rainMax: rain.length ? Math.max(...rain) : 0,
    rainFrom: idx >= 0 && times[idx] ? times[idx].slice(11, 16) : null,
    tMin: temps.length ? Math.round(Math.min(...temps)) : Math.round(j.current.temperature_2m),
    tMax: temps.length ? Math.round(Math.max(...temps)) : Math.round(j.current.temperature_2m),
  };
}

/** WMO weather code → short Vietnamese description. */
export function describe(code: number): string {
  if (code === 0) return "Trời quang";
  if (code <= 2) return "Ít mây";
  if (code === 3) return "Nhiều mây";
  if (code === 45 || code === 48) return "Sương mù";
  if (code >= 51 && code <= 57) return "Mưa phùn";
  if (code >= 61 && code <= 67) return "Có mưa";
  if (code >= 80 && code <= 82) return "Mưa rào";
  if (code >= 95) return "Dông";
  return "Thay đổi";
}

export type WeatherKind = "rain" | "hot" | "warm" | "cool" | "cold";

export function weatherKind(w: WeatherNow): WeatherKind {
  if (w.rainMax >= 50 || (w.code >= 51 && w.code <= 82) || w.code >= 95) return "rain";
  if (w.tMax > 30) return "hot";
  if (w.tMax >= 24) return "warm";
  if (w.tMax >= 18) return "cool";
  return "cold";
}

export interface WearAdvice {
  headline: string;
  tip: string;
  garments: GarmentId[];
}

/** Rule-based "what to wear next": 3 catalog garments per weather kind and gender. */
export function wearAdvice(kind: WeatherKind, gender: "men" | "women"): WearAdvice {
  const men = gender === "men";
  switch (kind) {
    case "rain":
      return {
        headline: "Sắp mưa: mang áo khoác",
        tip: "Tránh đồ trắng, da lộn; chọn giày kín mũi.",
        garments: men ? ["G04", "G06", "P02"] : ["W06-01", "W05-02", "G04"],
      };
    case "hot":
      return {
        headline: "Trời nóng: vải mỏng, thoáng",
        tip: "Ưu tiên linen, cotton, tay ngắn, màu sáng.",
        garments: men ? ["M12_01", "M12_02", "G09"] : ["W07-01", "W07-02", "W10-01"],
      };
    case "warm":
      return {
        headline: "Dễ chịu: smart casual là vừa",
        tip: "Sơ mi hoặc polo, thêm lớp mỏng khi ra tối.",
        garments: men ? ["G09", "G02", "P05"] : ["W04-02", "W09-01", "W05-02"],
      };
    case "cool":
      return {
        headline: "Se lạnh: thêm một lớp",
        tip: "Len mỏng hoặc blazer khoác ngoài.",
        garments: men ? ["G08", "G01", "M15_01"] : ["W05-01", "W04-01", "W02-02"],
      };
    case "cold":
      return {
        headline: "Trời lạnh: mặc ấm nhiều lớp",
        tip: "Len dày, áo khoác dài, quần dài.",
        garments: men ? ["M15_01", "G10", "M15_03"] : ["W05-01", "G10", "W04-03"],
      };
  }
}
