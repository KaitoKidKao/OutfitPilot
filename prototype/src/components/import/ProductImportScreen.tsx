"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Camera, Upload, Link2, Check, Sparkles } from "lucide-react";
import { ProductItem } from "@/types";
import { DEMO_LOOK } from "@/data/mockData";

interface ProductImportScreenProps {
  onBack: () => void;
  onProceedToCamera: (lookA: ProductItem | null, lookB: ProductItem | null) => void;
  initialItem?: ProductItem;
}

export function ProductImportScreen({
  onBack,
  onProceedToCamera,
  initialItem,
}: ProductImportScreenProps) {
  const [lookA, setLookA] = useState<ProductItem | null>(initialItem || DEMO_LOOK);
  const [lookB, setLookB] = useState<ProductItem | null>(null);
  const [activeSlot, setActiveSlot] = useState<"A" | "B">("B");

  // Input states for current slot
  const [itemName, setItemName] = useState("");
  const [shopName, setShopName] = useState("");
  const [price, setPrice] = useState("");
  const [urlInput, setUrlInput] = useState("");

  const handleApplyToSlot = () => {
    if (!itemName) return;
    const newItem: ProductItem = {
      id: `custom-${Date.now()}`,
      name: itemName,
      shopName: shopName || "Shop tự nhập",
      price: price || undefined,
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
      sourceUrl: urlInput || undefined,
      status: "recent",
    };

    if (activeSlot === "A") {
      setLookA(newItem);
    } else {
      setLookB(newItem);
    }

    // Reset input fields
    setItemName("");
    setShopName("");
    setPrice("");
    setUrlInput("");
  };

  const handleSelectSampleB = () => {
    setLookB({
      id: "sample-b",
      name: "Đầm Lụa Midi Dáng Ôm Tối Giản",
      shopName: "The Silk Co.",
      price: "1.250.000₫",
      imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop",
      sourceUrl: "https://silkco.vn/midi-dress",
      status: "demo",
    });
  };

  const canProceed = lookA !== null;

  return (
    <div className="flex flex-col min-h-full pb-8">
      {/* Top Header */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-[#E9EBE4] bg-[#F8F8F3]/90 backdrop-blur-sm sticky top-0 z-20">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center text-[#162820]"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-sm text-[#162820]">
          Chuẩn bị trang phục
        </span>
        <div className="w-10" />
      </header>

      <div className="px-5 pt-5 flex flex-col gap-6">
        {/* Intro */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#162820]">
            Chọn mẫu trang phục A & B
          </h1>
          <p className="text-xs text-[#5A6B5C] mt-1 leading-relaxed">
            Bạn có thể thử 1 mẫu độc lập hoặc chọn cả 2 mẫu A/B để so sánh trực tiếp trong phòng thử đồ.
          </p>
        </div>

        {/* Look A and Look B Slots */}
        <div className="grid grid-cols-2 gap-3">
          {/* Slot A */}
          <button
            onClick={() => setActiveSlot("A")}
            className={`p-3 rounded-2xl border flex flex-col text-left transition-all ${
              activeSlot === "A"
                ? "border-[#162820] bg-white ring-2 ring-[#162820]/10"
                : "border-[#E9EBE4] bg-white/60 hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#162820] px-2 py-0.5 rounded-md bg-[#D8EFBD]">
                Look A
              </span>
              {lookA && <Check className="w-4 h-4 text-[#6F856E]" />}
            </div>
            {lookA ? (
              <div className="flex flex-col gap-1.5">
                <div className="w-full h-32 rounded-xl bg-[#F8F8F3] overflow-hidden border border-[#E9EBE4]">
                  <img
                    src={lookA.imageUrl}
                    alt={lookA.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-[#162820] line-clamp-1 mt-1">
                  {lookA.name}
                </span>
                <span className="text-[11px] text-[#5A6B5C]">
                  {lookA.price || lookA.shopName}
                </span>
              </div>
            ) : (
              <div className="w-full h-32 rounded-xl border border-dashed border-[#E9EBE4] flex flex-col items-center justify-center gap-1.5 text-center p-2">
                <Upload className="w-5 h-5 text-[#5A6B5C]" />
                <span className="text-[11px] text-[#5A6B5C] font-medium">
                  Chạm để thêm Look A
                </span>
              </div>
            )}
          </button>

          {/* Slot B */}
          <button
            onClick={() => setActiveSlot("B")}
            className={`p-3 rounded-2xl border flex flex-col text-left transition-all ${
              activeSlot === "B"
                ? "border-[#162820] bg-white ring-2 ring-[#162820]/10"
                : "border-[#E9EBE4] bg-white/60 hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#162820] px-2 py-0.5 rounded-md bg-[#DFEAE7]">
                Look B (So sánh)
              </span>
              {lookB && <Check className="w-4 h-4 text-[#6F856E]" />}
            </div>
            {lookB ? (
              <div className="flex flex-col gap-1.5">
                <div className="w-full h-32 rounded-xl bg-[#F8F8F3] overflow-hidden border border-[#E9EBE4]">
                  <img
                    src={lookB.imageUrl}
                    alt={lookB.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-[#162820] line-clamp-1 mt-1">
                  {lookB.name}
                </span>
                <span className="text-[11px] text-[#5A6B5C]">
                  {lookB.price || lookB.shopName}
                </span>
              </div>
            ) : (
              <div className="w-full h-32 rounded-xl border border-dashed border-[#E9EBE4] flex flex-col items-center justify-center gap-1.5 text-center p-2">
                <Upload className="w-5 h-5 text-[#5A6B5C]" />
                <span className="text-[11px] text-[#5A6B5C] font-medium">
                  Chưa chọn Look B (Tùy chọn)
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Input Details for active slot */}
        <div className="p-4 bg-white rounded-2xl border border-[#E9EBE4] flex flex-col gap-3 shadow-soft-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#162820]">
              Nhập thông tin cho Look {activeSlot}
            </span>
            {!lookB && activeSlot === "B" && (
              <button
                onClick={handleSelectSampleB}
                className="text-[11px] text-[#162820] font-medium underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-[#6F856E]" />
                <span>Gợi ý mẫu mẫu B</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-[#5A6B5C] mb-1 block">
                Tên trang phục
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Váy hoa nhí / Áo blazer..."
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full h-11 px-3 text-xs rounded-xl bg-[#F8F8F3] border border-[#E9EBE4] text-[#162820] placeholder-[#5A6B5C]/60 focus:outline-none focus:border-[#162820]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-[#5A6B5C] mb-1 block">
                  Tên cửa hàng
                </label>
                <input
                  type="text"
                  placeholder="Zara / Local brand..."
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl bg-[#F8F8F3] border border-[#E9EBE4] text-[#162820] placeholder-[#5A6B5C]/60 focus:outline-none focus:border-[#162820]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#5A6B5C] mb-1 block">
                  Giá (nếu có)
                </label>
                <input
                  type="text"
                  placeholder="850.000₫"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl bg-[#F8F8F3] border border-[#E9EBE4] text-[#162820] placeholder-[#5A6B5C]/60 focus:outline-none focus:border-[#162820]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#5A6B5C] mb-1 block">
                Link sản phẩm gốc (tùy chọn)
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-[#5A6B5C] absolute left-3 top-3.5" />
                <input
                  type="url"
                  placeholder="https://..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 text-xs rounded-xl bg-[#F8F8F3] border border-[#E9EBE4] text-[#162820] placeholder-[#5A6B5C]/60 focus:outline-none focus:border-[#162820]"
                />
              </div>
            </div>

            {itemName && (
              <button
                onClick={handleApplyToSlot}
                className="mt-1 w-full h-10 bg-[#162820] text-white text-xs font-semibold rounded-xl hover:bg-[#192E25] transition-colors"
              >
                Cập nhật vào Look {activeSlot}
              </button>
            )}
          </div>
        </div>

        {/* CTA to Camera Setup */}
        <div className="mt-2">
          <button
            disabled={!canProceed}
            onClick={() => onProceedToCamera(lookA, lookB)}
            className={`w-full h-14 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 transition-all shadow-sm ${
              canProceed
                ? "bg-[#D8EFBD] text-[#162820] hover:bg-[#CBE4AE] border border-[#C5DFAB]"
                : "bg-[#E9EBE4] text-[#7B867D] cursor-not-allowed"
            }`}
          >
            <Camera className="w-5 h-5" />
            <span>Tiến hành căn Camera</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
