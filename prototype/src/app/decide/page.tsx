"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, RotateCcw } from "lucide-react";
import { Dock } from "@/components/Dock";
import { SampleTag, Screen, TopBar } from "@/components/Screen";
import { hostOf } from "@/lib/image";
import { useStore } from "@/lib/store";
import type { Product, Slot } from "@/lib/types";

export default function DecidePage() {
  const router = useRouter();
  const { look, save, notify, updateProduct } = useStore();
  const a = look("a");
  const b = look("b");

  const keep = (slot: Slot) => {
    const p = look(slot);
    if (!p) return;
    save(p.id);
    notify(`Saved ${p.name}`);
    router.push("/saved");
  };

  return (
    <Screen>
      <TopBar back="/studio" />
      <div className="px-5">
        <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.03em]">Which one do you keep?</h1>
        <p className="mt-1 text-[14px] text-muted">Bạn chọn món nào? Facts on top, your own notes below.</p>
      </div>

      {!a && !b ? (
        <div className="mx-5 mt-6 rounded-[22px] border-[1.5px] border-dashed border-line p-6 text-center">
          <p className="text-[16px] font-bold">Nothing to compare yet</p>
          <Link href="/looks?new=1" className="mt-4 inline-flex h-12 items-center rounded-[14px] bg-lime px-5 text-[15px] font-semibold">
            Add a product
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-x-3 px-5">
          <Column slot="a" product={a} onNote={(n) => a && updateProduct(a.id, { note: n })} />
          <Column slot="b" product={b} onNote={(n) => b && updateProduct(b.id, { note: n })} />
        </div>
      )}

      <p className="mx-5 mt-6 rounded-[16px] bg-surface px-4 py-3 text-[12px] leading-relaxed text-muted">
        Prices are what you typed. OutfitPilot doesn&apos;t check stock, size or fabric, and can&apos;t measure your size. · Giá do bạn nhập; size và chất liệu hãy hỏi shop.
      </p>

      <Dock
        mode={{ kind: "keep", onKeep: keep }}
        center={{ label: "Try them again in the studio", icon: <RotateCcw strokeWidth={2} />, href: "/studio", tone: "quiet" }}
      />
    </Screen>
  );
}

function Column({ slot, product, onNote }: { slot: Slot; product?: Product; onNote: (n: string) => void }) {
  const L = slot.toUpperCase();
  if (!product)
    return (
      <div className="flex flex-col">
        <div className="flex aspect-[4/5] items-center justify-center rounded-[20px] border-[1.5px] border-dashed border-line text-center">
          <span className="px-3 text-[13px] text-muted">Look {L} empty</span>
        </div>
        <Link href={`/looks?slot=${slot}`} className="mt-3 flex h-11 items-center justify-center rounded-[14px] bg-surface text-[13px] font-semibold">
          Add Look {L}
        </Link>
      </div>
    );
  const host = hostOf(product.url);
  return (
    <article className="flex min-w-0 flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-[10px] bg-ink text-[14px] font-extrabold text-white">{L}</span>
        {product.sample && <SampleTag className="absolute bottom-2 left-2" />}
      </div>
      <h2 className="mt-3 line-clamp-2 min-h-[2.5em] text-[15px] font-bold leading-tight">{product.name}</h2>

      <dl className="mt-2 divide-y divide-line border-y border-line text-[12px]">
        <Row label="Price">
          {product.price ? (
            <span>
              <span className="tnum text-[14px] font-bold">{product.price}</span>
              <span className="block text-muted">you entered</span>
            </span>
          ) : (
            <span className="text-muted">Not added</span>
          )}
        </Row>
        <Row label="Shop">
          <span className="block truncate font-semibold">{product.shop || host || "Not added"}</span>
        </Row>
        <Row label="Size · fabric · returns">
          <span className="font-semibold text-lime-ink">Check with store</span>
        </Row>
      </dl>

      <label htmlFor={`note-${slot}`} className="mt-3 text-[12px] font-semibold">
        Your note <span className="font-normal text-muted">· your opinion</span>
      </label>
      <textarea
        id={`note-${slot}`}
        defaultValue={product.note}
        onBlur={(e) => onNote(e.target.value.trim())}
        placeholder="Fit, colour, what it goes with…"
        rows={3}
        maxLength={160}
        className="mt-1 w-full resize-none rounded-[12px] border border-line bg-white px-3 py-2 text-[13px] placeholder:text-muted/80 focus:border-ink focus:outline-none"
      />

      {product.url ? (
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 flex h-11 items-center justify-center gap-1.5 rounded-[14px] bg-surface text-[13px] font-semibold hover:bg-surface-deep"
        >
          Open store <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
        </a>
      ) : (
        <p className="mt-2.5 flex h-11 items-center justify-center rounded-[14px] text-[12px] text-muted">No link saved</p>
      )}
    </article>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
