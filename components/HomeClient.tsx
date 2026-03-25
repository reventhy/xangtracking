"use client";

import { useState } from "react";
import { FuelPriceBanner } from "@/components/FuelPriceBanner";
import { ResultCard } from "@/components/ResultCard";
import { formatShortDateTime } from "@/lib/calculations";
import { motorcycles } from "@/lib/motorcycles";
import { FuelPricesState } from "@/lib/types";

type HomeClientProps = {
  fuelPricesState: FuelPricesState;
};

export function HomeClient({ fuelPricesState }: HomeClientProps) {
  const isSuccess = fuelPricesState.status === "success";
  const isOcr = isSuccess && fuelPricesState.prices.source === "ocr";
  const [showFuelPrices, setShowFuelPrices] = useState(false);
  const sourceLabel = !isSuccess
    ? "Không tải được giá xăng"
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
          <FuelPriceBanner state={fuelPricesState} />
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
              {isSuccess
                ? `Cập nhật ${formatShortDateTime(fuelPricesState.prices.last_updated)}`
                : `Kiểm tra ${formatShortDateTime(fuelPricesState.last_checked)}`}
            </span>
          </div>
        </section>

        {isSuccess ? (
          <ResultCard
            motorcycles={motorcycles}
            fuelPrices={fuelPricesState.prices}
          />
        ) : (
          <section className="rounded-[20px] border-[0.5px] border-black/10 bg-white p-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
              Không tải được giá xăng
            </p>
            <h2
              className="mt-3 text-[28px] font-normal leading-8 tracking-[-0.5px] text-[#1a1a18]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Chưa thể tính toán
            </h2>
            <p className="mt-3 text-[13px] leading-5 text-[#888780]">
              {fuelPricesState.message}
            </p>
            {fuelPricesState.source_url ? (
              <a
                href={fuelPricesState.source_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-[13px] text-[#1a1a18] underline underline-offset-2"
              >
                Mở nguồn Petrolimex
              </a>
            ) : null}
          </section>
        )}

        <footer className="pb-4 text-center text-[13px] text-[#888780]">
          <a
            href="https://www.linkedin.com/in/namvunhatle/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            Nhat Nam
          </a>
        </footer>
      </div>
    </main>
  );
}
