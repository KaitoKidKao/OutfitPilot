// "Sắp tới nên mặc gì": upcoming Vietnamese holidays / events, counted from today.
// Tapping one asks the Stylist for two looks for that occasion (occasion "other"
// + customOccasion = `ask`). Dates are fixed per year; lunar Tết is listed per year.

export interface UpcomingEvent {
  id: string;
  title: string;
  /** Short dress hint shown on the card. */
  hint: string;
  /** Text sent to the Stylist as the custom occasion. */
  ask: string;
  date: Date;
  daysLeft: number;
}

interface EventDef {
  id: string;
  title: string;
  hint: string;
  ask: string;
  /** Fixed month/day every year … */
  md?: [number, number];
  /** … or explicit dates for moving holidays (month is 1-based). */
  dates?: [number, number, number][];
}

const EVENTS: EventDef[] = [
  { id: "teacher", title: "Ngày Nhà giáo 20/11", hint: "Lịch sự, nhẹ nhàng", ask: "Ngày Nhà giáo 20/11, đi chúc mừng thầy cô", md: [11, 20] },
  { id: "blackfriday", title: "Black Friday", hint: "Đi mua sắm, thoải mái", ask: "Đi mua sắm Black Friday cả ngày, thoải mái dễ đi", dates: [[2026, 11, 27], [2027, 11, 26], [2028, 11, 24]] },
  { id: "xmas", title: "Giáng sinh", hint: "Ấm áp, có điểm nhấn", ask: "Đêm Giáng sinh đi chơi phố cùng bạn bè", md: [12, 24] },
  { id: "countdown", title: "Countdown năm mới", hint: "Nổi bật, đi tiệc", ask: "Tiệc countdown đêm 31/12 đón năm mới", md: [12, 31] },
  { id: "tet", title: "Tết Nguyên đán", hint: "Chỉn chu, đi chúc Tết", ask: "Đi chúc Tết họ hàng ngày mùng 1 Tết Nguyên đán", dates: [[2027, 2, 6], [2028, 1, 26], [2029, 2, 13]] },
  { id: "valentine", title: "Valentine 14/2", hint: "Hẹn hò, lãng mạn", ask: "Hẹn hò tối Valentine 14/2", md: [2, 14] },
  { id: "women", title: "Quốc tế Phụ nữ 8/3", hint: "Thanh lịch, tươi tắn", ask: "Đi ăn mừng ngày 8/3", md: [3, 8] },
];

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** The next `limit` events on or after today (today counts as 0 days left). */
export function upcomingEvents(now: Date = new Date(), limit = 5): UpcomingEvent[] {
  const today = startOfDay(now);
  const out: UpcomingEvent[] = [];
  for (const e of EVENTS) {
    let next: Date | null = null;
    if (e.md) {
      const [m, d] = e.md;
      const thisYear = new Date(today.getFullYear(), m - 1, d);
      next = thisYear >= today ? thisYear : new Date(today.getFullYear() + 1, m - 1, d);
    } else if (e.dates) {
      next =
        e.dates
          .map(([y, m, d]) => new Date(y, m - 1, d))
          .filter((x) => x >= today)
          .sort((a, b) => a.getTime() - b.getTime())[0] ?? null;
    }
    if (!next) continue;
    out.push({ id: e.id, title: e.title, hint: e.hint, ask: e.ask, date: next, daysLeft: Math.round((next.getTime() - today.getTime()) / DAY) });
  }
  return out.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, limit);
}

export function daysLeftLabel(n: number): string {
  if (n <= 0) return "Hôm nay";
  if (n === 1) return "Ngày mai";
  return `Còn ${n} ngày`;
}
