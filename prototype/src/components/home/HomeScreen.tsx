"use client";

import React, { useState } from "react";
import { ArrowRight, Bookmark, Sparkles, ExternalLink, RefreshCw, UploadCloud } from "lucide-react";
import { ProductItem } from "@/types";
import { DEMO_LOOK, RECENTLY_TRIED } from "@/data/mockData";

interface HomeScreenProps {
  onStartTryOn: (initialItem?: ProductItem) => void;
  onViewSaved: () => void;
}

export function HomeScreen({ onStartTryOn, onViewSaved }: HomeScreenProps) {
  const [recentItems] = useState<ProductItem[]>(RECENTLY_TRIED);

  return (
    <div className="flex flex-col min-h-full pb-8">
      {/* 1. Header Navigation */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-[#E9EBE4] bg-[#F8F8F3]/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg tracking-tight text-[#162820]">
            Outfit<span className="text-[#527050]">Pilot</span>
          </span>
          <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#E9EBE4] text-[#162820]/80">
            V4
          </span>
        </div>
        <button
          onClick={onViewSaved}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E9EBE4] bg-white text-[#162820] text-xs font-medium hover:border-[#162820]/30 transition-colors min-h-[44px] min-w-[44px] justify-center"
          aria-label="Xem danh sách trang phục đã lưu"
        >
          <Bookmark className="w-3.5 h-3.5 text-[#162820]" />
          <span>Đã lưu</span>
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#D8EFBD] text-[#162820] text-[10px] font-bold">
            2
          </span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="px-5 pt-6 flex flex-col gap-7">
        {/* 2. Hero Section */}
        <section className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-[#162820] leading-[1.2]">
            Try it before you buy it.
          </h1>
          <p className="text-sm leading-relaxed text-[#5A6B5C]">
            Trực quan hóa trang phục thật lên vóc dáng của bạn qua camera và so sánh trực quan hai mẫu A/B trước khi ra quyết định mua.
          </p>
        </section>

        {/* 3. Primary CTA Action */}
        <section className="flex flex-col gap-2.5">
          <button
            onClick={() => onStartTryOn()}
            className="w-full h-14 bg-[#D8EFBD] hover:bg-[#CBE4AE] active:scale-[0.99] text-[#162820] font-semibold text-base rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-sm border border-[#C5DFAB]"
          >
            <span>Thử đồ ngay</span>
            <ArrowRight className="w-5 h-5 text-[#162820]" />
          </button>
          
          <button
            onClick={() => onStartTryOn(DEMO_LOOK)}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-[#162820] bg-white border border-[#E9EBE4] hover:bg-[#F3F5EE] transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5A6B5C]" />
            <span>Thử nhanh mẫu có sẵn: <strong className="font-semibold">{DEMO_LOOK.name}</strong></span>
          </button>
        </section>

        {/* 4. Process Steps (Upload -> Try On -> Compare -> Decide) */}
        <section className="rounded-2xl p-4 bg-white border border-[#E9EBE4] shadow-soft-card">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#162820] mb-3">
            Quy trình thử đồ 4 bước
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              { step: "01", label: "Tải ảnh", desc: "Upload / Link" },
              { step: "02", label: "Căn máy", desc: "Hands-free" },
              { step: "03", label: "Thử & So sánh", desc: "Look A/B" },
              { step: "04", label: "Quyết định", desc: "Chốt lựa chọn" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col text-center">
                <span className="text-[10px] font-bold text-[#6F856E] mb-0.5">
                  {item.step}
                </span>
                <span className="text-xs font-semibold text-[#162820] leading-tight">
                  {item.label}
                </span>
                <span className="text-[10px] text-[#5A6B5C] mt-0.5">
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Recently Tried */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-[#162820]">
              Mẫu đã thử gần đây
            </h2>
            <button
              onClick={onViewSaved}
              className="text-xs font-medium text-[#5A6B5C] hover:text-[#162820] transition-colors min-h-[44px] flex items-center"
            >
              Xem tất cả ({recentItems.length})
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {recentItems.map((item) => (
              <article
                key={item.id}
                className="p-3 bg-white rounded-2xl border border-[#E9EBE4] flex items-center justify-between gap-3 shadow-soft-card hover:border-[#162820]/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-16 rounded-xl bg-[#F8F8F3] overflow-hidden flex-shrink-0 border border-[#E9EBE4]">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[#5A6B5C] font-medium">
                      {item.shopName}
                    </span>
                    <h3 className="text-sm font-medium text-[#162820] line-clamp-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-[#162820]">
                        {item.price}
                      </span>
                      {item.triedAt && (
                        <span className="text-[10px] text-[#7B867D]">
                          • {item.triedAt}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onStartTryOn(item)}
                    className="p-2 rounded-xl text-[#162820] bg-[#F8F8F3] hover:bg-[#D8EFBD] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Thử lại mẫu này"
                    aria-label={`Thử lại ${item.name}`}
                  >
                    <RefreshCw className="w-4 h-4 text-[#162820]" />
                  </button>
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl text-[#5A6B5C] hover:text-[#162820] hover:bg-[#F8F8F3] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Mở shop gốc"
                      aria-label={`Mở liên kết shop của ${item.name}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
