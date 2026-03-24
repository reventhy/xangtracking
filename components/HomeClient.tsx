"use client";

import { useState } from "react";
import { FuelPriceBanner } from "@/components/FuelPriceBanner";
import { ResultCard } from "@/components/ResultCard";
import { formatShortDateTime } from "@/lib/calculations";
import { motorcycles } from "@/lib/motorcycles";
import { FuelPrices } from "@/lib/types";

type HomeClientProps = {
  fuelPrices: FuelPrices;
};

export function HomeClient({ fuelPrices }: HomeClientProps) {
  const isFallback = fuelPrices.source === "fallback";
  const isOcr = fuelPrices.source === "ocr";
  const [showFuelPrices, setShowFuelPrices] = useState(false);
  const sourceLabel = isFallback
    ? "Đang dùng giá Vùng 1 dự phòng"
    : isOcr
      ? "OCR giá Vùng 1 từ Petrolimex"
      : "Đồng bộ giá Vùng 1 từ Petrolimex";

  return (
    <main className="min-h-screen bg-[#F0EDE6]">
      <div className="mx-auto flex w-full max-w-[400px] flex-col gap-6 px-4 py-6">
        <div
          className={`overflow-hidden transition-all duration-300 ${
            showFuelPrices
              ? "max-h-[640px] opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
          aria-hidden={!showFuelPrices}
        >
          <FuelPriceBanner prices={fuelPrices} />
        </div>

        <section className="rounded-2xl border-[0.5px] border-black/10 bg-white px-5 py-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
            Công cụ tính nhanh
          </p>
          <h1
            className="mt-3 text-[28px] font-normal leading-8 tracking-[-0.5px] text-[#1a1a18]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Đổ Xăng Bao Nhiêu?
          </h1>
          <p className="mt-3 text-[13px] leading-5 text-[#1a1a18]">
            Biết giá xăng, chủ động túi tiền
          </p>
          <p className="mt-3 text-[13px] leading-5 text-[#888780]">
            Chọn mẫu xe để xem ngay tiền đổ đầy bình, chi phí mỗi 100km và quãng
            đường ước tính cho một bình xăng.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-[13px] text-[#888780]">
            <button
              type="button"
              className={`rounded-full px-3 py-2 transition-colors ${
                showFuelPrices
                  ? "bg-[#1a1a18] text-[#F0EDE6]"
                  : "bg-[#F0EDE6] text-[#888780]"
              }`}
              onClick={() => setShowFuelPrices((current) => !current)}
            >
              {sourceLabel}
            </button>
            <span className="rounded-full bg-[#F0EDE6] px-3 py-2">
              Cập nhật {formatShortDateTime(fuelPrices.last_updated)}
            </span>
          </div>
        </section>

        <ResultCard motorcycles={motorcycles} fuelPrices={fuelPrices} />

        <footer className="pb-4 text-center text-[13px] text-[#888780]">
          Giá xăng Vùng 1 theo Petrolimex • Cập nhật {formatShortDateTime(fuelPrices.last_updated)}
        </footer>
      </div>
    </main>
  );
}
