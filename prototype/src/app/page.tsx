"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRight, Bookmark, Check, Plus } from "lucide-react";
import { Dock } from "@/components/Dock";
import { LocaleSwitch, SampleTag, Screen } from "@/components/Screen";
import { useStore } from "@/lib/store";

export default function Home() {
  const { products, saved, locale, tr } = useStore();
  // Demo pieces don't count: step 1 is done only once the shopper added a photo of their own.
  const hasOwnPiece = products.some((p) => !p.sample);
  const recent = [...products].sort((x, y) => y.addedAt - x.addedAt).slice(0, 8);

  const steps = [
    {
      title: tr("Add a product photo", "Thêm ảnh sản phẩm"),
      sub: tr("Screenshot or photo from any shop", "Ảnh chụp màn hình từ shop"),
      href: "/looks",
      done: hasOwnPiece,
    },
    {
      title: tr("Prop your phone, step back", "Dựng máy, lùi lại khoảng 1,5 m"),
      sub: tr("Stand about 1.5 m away in good light", "Đứng cách máy khoảng 1,5 m nơi đủ sáng"),
      href: "/setup",
      done: false,
    },
    {
      title: tr("Compare A / B, then decide", "So sánh A / B rồi quyết định"),
      sub: tr("Switch looks and save your favourite", "Đổi qua lại và lưu món ưng ý"),
      href: "/studio",
      done: false,
    },
  ];
  const current = steps.findIndex((s) => !s.done);

  return (
    <Screen>
      <header className="flex items-center justify-between px-5 pt-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-ink text-[12px] font-extrabold tracking-tight text-lime">
            OP
          </span>
          <span className="text-[16px] font-bold tracking-[-0.01em]">OutfitPilot</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/saved"
            className="flex h-11 items-center gap-1.5 rounded-[14px] bg-surface px-3.5 text-[13px] font-semibold transition-colors hover:bg-surface-deep"
          >
            <Bookmark className="h-4 w-4" strokeWidth={2} />
            {tr("Saved", "Đã lưu")} <span className="tnum">{saved.length}</span>
          </Link>
          <LocaleSwitch />
        </div>
      </header>

      <section className="px-5 pt-8">
        <h1 className="text-balance text-[40px] font-extrabold leading-[1.02] tracking-[-0.04em]">
          {locale === "vi" ? (
            <>
              Thử đồ <span className="rounded-[10px] bg-lime px-1.5 [box-decoration-break:clone]">trước khi</span> mua.
            </>
          ) : (
            <>
              Try it <span className="rounded-[10px] bg-lime px-1.5 [box-decoration-break:clone]">before</span> you buy it.
            </>
          )}
        </h1>
        <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-muted">
          {tr("See two pieces on you, one after the other.", "Thử hai món trên chính bạn rồi mới quyết định.")}
        </p>
      </section>

      <ol className="mx-5 mt-7 divide-y divide-line rounded-[22px] border border-line">
        {steps.map((s, i) => {
          const isCurrent = i === current;
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group flex min-h-[68px] items-center gap-3.5 px-4 py-3 transition-colors first:rounded-t-[22px] last:rounded-b-[22px] hover:bg-surface"
              >
                <span
                  className={clsx(
                    "tnum flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-[14px] font-bold",
                    s.done ? "bg-ink text-lime" : isCurrent ? "bg-lime text-ink" : "bg-surface text-ink",
                  )}
                >
                  {s.done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">{s.title}</span>
                  <span className="mt-0.5 block text-[13px] text-muted">{s.sub}</span>
                </span>
                <ArrowRight
                  className={clsx(
                    "h-5 w-5 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5",
                    isCurrent ? "text-ink" : "text-muted/60",
                  )}
                  strokeWidth={1.75}
                />
              </Link>
            </li>
          );
        })}
      </ol>

      <section className="pt-7">
        <div className="flex items-baseline justify-between px-5">
          <h2 className="text-[16px] font-bold tracking-[-0.01em]">{tr("Your pieces", "Tủ đồ của bạn")}</h2>
          <Link href="/looks" className="-mr-2 flex min-h-11 items-center px-2 text-[13px] font-semibold text-muted hover:text-ink">
            {tr("My looks", "Look của tôi")}
          </Link>
        </div>
        {recent.length ? (
          <ul className="no-scrollbar mt-2 flex snap-x scroll-px-5 gap-2.5 overflow-x-auto px-5 pb-1">
            {recent.map((p) => (
              <li key={p.id} className="snap-start">
                <Link href={`/looks?pick=${p.id}`} className="block w-[84px]">
                  <span className="relative block h-[104px] overflow-hidden rounded-[16px] bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </span>
                  <span className="mt-1.5 block truncate text-[12px] font-medium">{p.name}</span>
                </Link>
              </li>
            ))}
            <li className="snap-start">
              <Link
                href="/looks"
                className="flex h-[104px] w-[84px] flex-col items-center justify-center gap-1 rounded-[16px] border-[1.5px] border-dashed border-line text-[12px] font-semibold text-muted hover:border-muted"
              >
                <Plus className="h-5 w-5" strokeWidth={2} />
                {tr("Add", "Thêm")}
              </Link>
            </li>
          </ul>
        ) : (
          <p className="mx-5 mt-2 rounded-[16px] bg-surface px-4 py-5 text-[14px] text-muted">
            {tr("Nothing yet. Add a screenshot from any shop to start.", "Chưa có món nào. Hãy thêm ảnh chụp màn hình từ shop để bắt đầu.")}
          </p>
        )}
        {recent.some((p) => p.sample) && (
          <p className="mt-3 flex items-center gap-2 px-5 text-[12px] text-muted">
            <SampleTag className="shadow-none ring-1 ring-line" />{" "}
            {tr("Demo pieces with Unsplash photos. Replace them with your own.", "Các món mẫu dùng ảnh Unsplash. Bạn có thể thay bằng ảnh của mình.")}
          </p>
        )}
      </section>

      <Dock center={{ label: tr("Add a product", "Thêm sản phẩm"), icon: <Plus strokeWidth={2.25} />, href: "/looks?new=1" }} />
    </Screen>
  );
}
