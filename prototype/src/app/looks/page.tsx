"use client";

import { Suspense, useEffect, useId, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { ArrowRight, Check, ImagePlus, Link2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Dock } from "@/components/Dock";
import { Field, SampleTag, Screen, TopBar, inputCls } from "@/components/Screen";
import { fileToDataUrl, hostOf, validateUrl } from "@/lib/image";
import { useStore } from "@/lib/store";
import type { Product, Slot } from "@/lib/types";

export default function LooksPage() {
  return (
    <Suspense>
      <Looks />
    </Suspense>
  );
}

function Looks() {
  const params = useSearchParams();
  const router = useRouter();
  const store = useStore();
  const { products, slots, look, assign, notify, tr } = store;

  const initialSlot: Slot = params.get("slot") === "b" ? "b" : params.get("slot") === "a" ? "a" : !slots.a ? "a" : !slots.b ? "b" : "a";
  const [slot, setSlot] = useState<Slot>(initialSlot);
  const [formOpen, setFormOpen] = useState(params.get("new") === "1");
  const [editing, setEditing] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pick = params.get("pick");
    if (pick && products.some((p) => p.id === pick)) {
      const target: Slot = !slots.a ? "a" : !slots.b ? "b" : slot;
      setSlot(target);
      if (slots[target] !== pick) {
        assign(target, pick);
        notify(`Hung on Look ${target.toUpperCase()}`);
      }
      router.replace(`/looks?slot=${target}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formOpen) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [formOpen]);

  const current = look(slot);
  const anyLook = Boolean(slots.a || slots.b);
  const L = slot.toUpperCase();

  return (
    <Screen>
      <TopBar back="/" title="My looks" />

      <div role="tablist" aria-label="Choose look slot" className="mx-5 mt-1 grid grid-cols-2 gap-1 rounded-[18px] bg-surface p-1">
        {(["a", "b"] as Slot[]).map((s) => {
          const p = look(s);
          const on = s === slot;
          return (
            <button
              key={s}
              role="tab"
              aria-selected={on}
              onClick={() => {
                setSlot(s);
                setEditing(false);
              }}
              className={clsx(
                "flex h-12 items-center gap-2 rounded-[14px] px-2 text-left transition-[background-color,box-shadow] duration-200 ease-out",
                on ? "bg-white shadow-lift" : "hover:bg-white/60",
              )}
            >
              <span className={clsx("flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] text-[13px] font-extrabold", on ? "bg-lime" : "bg-white")}>
                {s.toUpperCase()}
              </span>
              <span className="min-w-0 truncate text-[13px] font-semibold">{p ? p.name : "Empty"}</span>
            </button>
          );
        })}
      </div>

      <section className="px-5 pt-5" aria-live="polite">
        {current && !editing ? (
          <CurrentLook
            product={current}
            slotLabel={L}
            onEdit={() => setEditing(true)}
            onRemove={() => {
              assign(slot, null);
              notify(`Look ${L} cleared`);
            }}
          />
        ) : current && editing ? (
          <ProductForm
            key={current.id}
            initial={current}
            submitLabel="Save changes"
            onCancel={() => setEditing(false)}
            onSubmit={(data) => {
              store.updateProduct(current.id, data);
              setEditing(false);
              notify("Details saved");
            }}
          />
        ) : (
          <div className="rounded-[24px] border-[1.5px] border-dashed border-line px-5 py-8 text-center">
            <p className="text-[17px] font-bold">{tr(`Look ${L} is empty`, `Look ${L} đang trống`)}</p>
            <p className="mx-auto mt-1 max-w-[30ch] text-[14px] text-muted">
              {tr("Upload a photo below or pick one of your pieces.", "Tải ảnh lên ở dưới hoặc chọn một món có sẵn.")}
            </p>
            {slot === "b" && slots.a && (
              <p className="mx-auto mt-3 max-w-[32ch] text-[13px] text-muted">
                {tr("One piece is fine too: you can try Look A on its own.", "Chỉ một món cũng được: bạn có thể thử riêng Look A.")}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="pt-7">
        <div className="flex items-baseline justify-between px-5">
          <h2 className="text-[16px] font-bold tracking-[-0.01em]">Your pieces</h2>
          <span className="text-[13px] text-muted">Tap to hang on Look {L}</span>
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-2.5 px-5">
          <li>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-1.5 rounded-[16px] border-[1.5px] border-dashed border-line bg-surface text-[13px] font-semibold text-ink transition-colors hover:border-muted"
            >
              <Plus className="h-6 w-6" strokeWidth={2.25} />
              New piece
            </button>
          </li>
          {products.map((p) => {
            const on = slots[slot] === p.id;
            const other = slots[slot === "a" ? "b" : "a"] === p.id;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={`${p.name}${on ? `, on Look ${L}` : ""}`}
                  onClick={() => {
                    assign(slot, p.id);
                    setEditing(false);
                    notify(`Hung on Look ${L}`);
                  }}
                  className={clsx(
                    "relative block aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-surface ring-offset-2 transition-shadow duration-200",
                    on ? "ring-2 ring-ink" : "hover:ring-2 hover:ring-line",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  {(on || other) && (
                    <span
                      className={clsx(
                        "absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-[8px] text-[12px] font-extrabold",
                        on ? "bg-lime text-ink" : "bg-ink text-white",
                      )}
                    >
                      {on ? L : slot === "a" ? "B" : "A"}
                    </span>
                  )}
                </button>
                <p className="mt-1 truncate text-[12px] font-medium">{p.name}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {formOpen && (
        <section ref={formRef} className="scroll-mt-4 px-5 pt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold tracking-[-0.02em]">Add a product</h2>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              aria-label="Close form"
              className="flex h-11 w-11 items-center justify-center rounded-[14px] hover:bg-surface"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
          <div className="mt-3">
            <ProductForm
              submitLabel={`Hang on Look ${L}`}
              onCancel={() => setFormOpen(false)}
              onSubmit={(data) => {
                store.addProduct(data, slot);
                setFormOpen(false);
                notify(`Added to Look ${L}`);
              }}
            />
          </div>
        </section>
      )}

      {store.persistError && (
        <p role="alert" className="mx-5 mt-6 rounded-[14px] bg-danger-soft px-4 py-3 text-[13px] text-danger">
          This device is out of storage for photos. Your latest change may be lost after closing the app.
        </p>
      )}

      <Dock
        center={
          anyLook
            ? { label: "Set up", icon: <ArrowRight strokeWidth={2.25} />, showLabel: true, href: "/setup" }
            : { label: "Add a product", icon: <Plus strokeWidth={2.25} />, onClick: () => setFormOpen(true) }
        }
      />
    </Screen>
  );
}

function CurrentLook({ product, slotLabel, onEdit, onRemove }: { product: Product; slotLabel: string; onEdit: () => void; onRemove: () => void }) {
  const host = hostOf(product.url);
  return (
    <article className="animate-rise">
      <div className="relative aspect-[4/5] max-h-[380px] w-full overflow-hidden rounded-[24px] bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        <span className="absolute left-3 top-3 flex h-9 items-center rounded-[12px] bg-lime px-3 text-[13px] font-extrabold text-ink">Look {slotLabel}</span>
        {product.sample && <SampleTag className="absolute right-3 top-3" />}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.02em]">{product.name}</h2>
          <p className="mt-1 text-[14px] text-muted">{product.shop || host || "Shop not added"}</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" onClick={onEdit} aria-label="Edit details" className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-surface hover:bg-surface-deep">
            <Pencil className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove from Look ${slotLabel}`}
            className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-surface hover:bg-danger-soft hover:text-danger"
          >
            <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
        </div>
      </div>
      <dl className="mt-4 divide-y divide-line rounded-[18px] border border-line text-[14px]">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <dt className="text-muted">Price</dt>
          <dd className="text-right font-semibold">
            {product.price ? (
              <>
                <span className="tnum">{product.price}</span> <span className="font-normal text-muted">· you entered</span>
              </>
            ) : (
              <span className="font-normal text-muted">Not added</span>
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <dt className="text-muted">Product link</dt>
          <dd className="min-w-0 truncate text-right font-semibold">{host ?? <span className="font-normal text-muted">Not added</span>}</dd>
        </div>
      </dl>
    </article>
  );
}

type FormData = Pick<Product, "name" | "shop" | "price" | "url" | "image">;

function ProductForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Product;
  submitLabel: string;
  onSubmit: (d: FormData) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const { tr } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState(initial?.image ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [shop, setShop] = useState(initial?.shop ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ image?: string; url?: string | null }>({});

  async function onFile(f?: File) {
    if (!f) return;
    setBusy(true);
    try {
      setImage(await fileToDataUrl(f));
      setErrors((e) => ({ ...e, image: undefined }));
      if (!name) setName(f.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").slice(0, 40));
    } catch {
      setErrors((e) => ({
        ...e,
        image: tr("We couldn't open that file. Try a JPG or PNG photo.", "Không mở được tệp này. Hãy thử ảnh JPG hoặc PNG."),
      }));
    } finally {
      setBusy(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const urlErr = validateUrl(url);
    const imgErr = image ? undefined : tr("Add a photo of the item first.", "Cần thêm ảnh sản phẩm trước.");
    setErrors({ image: imgErr, url: urlErr });
    if (imgErr || urlErr) return;
    onSubmit({
      image,
      name: name.trim() || "Untitled piece",
      shop: shop.trim() || hostOf(url) || undefined,
      price: price.trim() || undefined,
      url: url.trim() || undefined,
    });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          id={`${id}-file`}
          aria-describedby={errors.image ? `${id}-file-msg` : undefined}
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        {image ? (
          <div className="relative flex gap-3 rounded-[18px] bg-surface p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Selected product photo" className="h-[104px] w-[84px] rounded-[12px] object-cover" />
            <div className="flex flex-1 flex-col justify-center">
              <p className="text-[14px] font-semibold">Photo ready</p>
              <button type="button" onClick={() => fileRef.current?.click()} className="mt-1 self-start py-1.5 text-[13px] font-semibold text-ink underline">
                Replace photo
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor={`${id}-file`}
            className={clsx(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border-[1.5px] border-dashed px-4 py-8 text-center transition-colors",
              errors.image ? "border-danger bg-danger-soft/40" : "border-line hover:border-muted hover:bg-surface",
            )}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-lime">
              {busy ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink border-t-transparent" /> : <ImagePlus className="h-6 w-6" strokeWidth={1.75} />}
            </span>
            <span className="text-[15px] font-semibold">{tr("Upload a photo", "Tải ảnh lên")}</span>
            <span className="text-[13px] text-muted">{tr("Screenshot or product image", "Ảnh chụp màn hình từ shop")}</span>
          </label>
        )}
        {errors.image && (
          <p id={`${id}-file-msg`} role="alert" className="mt-1.5 text-[13px] font-medium text-danger">
            {errors.image}
          </p>
        )}
      </div>

      <Field label="Name" htmlFor={`${id}-name`}>
        <input id={`${id}-name`} className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Linen overshirt" maxLength={60} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Shop" htmlFor={`${id}-shop`}>
          <input id={`${id}-shop`} className={inputCls} value={shop} onChange={(e) => setShop(e.target.value)} placeholder="Optional" maxLength={40} />
        </Field>
        <Field label="Price" htmlFor={`${id}-price`} hint="You type it; we don't check it.">
          <input id={`${id}-price`} className={clsx(inputCls, "tnum")} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="690.000₫" inputMode="text" maxLength={20} aria-describedby={`${id}-price-msg`} />
        </Field>
      </div>
      <Field
        label="Product link"
        htmlFor={`${id}-url`}
        error={errors.url}
        hint="Optional. Only used to reopen the shop later; we don't read the page."
      >
        <div className="relative">
          <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" strokeWidth={1.75} />
          <input
            id={`${id}-url`}
            className={clsx(inputCls, "pl-10")}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => setErrors((er) => ({ ...er, url: validateUrl(url) }))}
            placeholder="https://"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            aria-invalid={Boolean(errors.url)}
            aria-describedby={`${id}-url-msg`}
          />
        </div>
      </Field>

      <div className="flex gap-2.5 pt-1">
        <button type="button" onClick={onCancel} className="h-[52px] rounded-[16px] px-5 text-[15px] font-semibold text-ink hover:bg-surface">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-[16px] bg-ink text-[15px] font-semibold text-white transition-colors hover:bg-ink-well disabled:opacity-50">
          <Check className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden />
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
