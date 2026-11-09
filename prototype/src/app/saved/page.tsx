"use client";

import Link from "next/link";
import { ExternalLink, Plus, X } from "lucide-react";
import { Dock } from "@/components/Dock";
import { SampleTag, Screen, TopBar } from "@/components/Screen";
import { hostOf } from "@/lib/image";
import { useStore } from "@/lib/store";

export default function SavedPage() {
  const { saved, byId, unsave, notify } = useStore();
  const items = saved.map((s) => ({ s, p: byId(s.productId) })).filter((x) => x.p);

  return (
    <Screen>
      <TopBar back="/" />
      <div className="px-5">
        <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.03em]">Kept for later</h1>
        <p className="mt-1 text-[14px] text-muted">Pieces you chose, with the way back to the shop. · Những món bạn đã chọn.</p>
      </div>

      {items.length === 0 ? (
        <div className="mx-5 mt-6 rounded-[22px] border-[1.5px] border-dashed border-line px-6 py-10 text-center">
          <p className="text-[16px] font-bold">No saved looks yet</p>
          <p className="mx-auto mt-1 max-w-[28ch] text-[14px] text-muted">Try two pieces in the studio and keep the one you like.</p>
          <Link href="/looks?new=1" className="mt-4 inline-flex h-12 items-center gap-2 rounded-[14px] bg-lime px-5 text-[15px] font-semibold">
            <Plus className="h-5 w-5" strokeWidth={2.25} /> Add a product
          </Link>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {items.map(({ p }) => {
            if (!p) return null;
            const host = hostOf(p.url);
            return (
              <li key={p.id} className="flex animate-rise items-center gap-3.5 px-5 py-3.5">
                <div className="relative h-[92px] w-[74px] shrink-0 overflow-hidden rounded-[14px] bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold">{p.name}</p>
                  <p className="mt-0.5 truncate text-[13px] text-muted">{p.shop || host || "Shop not added"}</p>
                  <p className="mt-1 text-[13px] leading-snug">
                    {p.price ? (
                      <>
                        <span className="tnum block font-semibold">{p.price}</span>
                        <span className="block whitespace-nowrap text-[12px] text-muted">you entered</span>
                      </>
                    ) : (
                      <span className="text-muted">No price</span>
                    )}
                  </p>
                  {p.sample && <SampleTag className="mt-1.5 inline-block shadow-none ring-1 ring-line" />}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 items-center gap-1.5 rounded-[14px] bg-ink px-3.5 text-[13px] font-semibold text-white hover:bg-ink-well"
                    >
                      Open store <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                    </a>
                  ) : (
                    <Link href={`/looks?pick=${p.id}`} className="flex h-11 items-center rounded-[14px] bg-surface px-3.5 text-[13px] font-semibold hover:bg-surface-deep">
                      Add link
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      unsave(p.id);
                      notify("Removed from saved");
                    }}
                    aria-label={`Remove ${p.name} from saved`}
                    className="flex h-11 w-11 items-center justify-center rounded-[14px] text-muted hover:bg-surface hover:text-ink"
                  >
                    <X className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dock center={{ label: "Add a product", icon: <Plus strokeWidth={2.25} />, href: "/looks?new=1" }} />
    </Screen>
  );
}
