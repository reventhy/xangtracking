"use client";

import { useEffect, useState } from "react";
import { calculateMotorcycleCosts, formatCurrency, formatDecimal } from "@/lib/calculations";
import { Brand, FuelPrices, FuelType, Motorcycle } from "@/lib/types";

type ResultCardProps = {
  motorcycles: Motorcycle[];
  fuelPrices: FuelPrices;
};

const brands: Array<Brand | "Tất cả"> = [
  "Tất cả",
  "Honda",
  "Yamaha",
  "SYM",
  "Piaggio",
  "Suzuki"
];

const fuelTypes: FuelType[] = ["E5 RON92", "RON95-III", "RON95-IV"];

export function ResultCard({ motorcycles, fuelPrices }: ResultCardProps) {
  const [selectedMotorcycle, setSelectedMotorcycle] = useState(motorcycles[0]);
  const [selectedFuelType, setSelectedFuelType] = useState<FuelType>(
    motorcycles[0].fuel_type
  );
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [brandFilter, setBrandFilter] = useState<Brand | "Tất cả">("Tất cả");
  const [showBikeHint, setShowBikeHint] = useState(true);
  const [isBikeHintFading, setIsBikeHintFading] = useState(false);

  const motorcycle = selectedMotorcycle;
  const result = calculateMotorcycleCosts(motorcycle, fuelPrices, selectedFuelType);
  const filteredMotorcycles = motorcycles.filter((item) => {
    return brandFilter === "Tất cả" || item.brand === brandFilter;
  });

  useEffect(() => {
    if (!showBikeHint) {
      return undefined;
    }

    const fadeTimer = window.setTimeout(() => {
      setIsBikeHintFading(true);
    }, 3600);
    const hideTimer = window.setTimeout(() => {
      setShowBikeHint(false);
    }, 4000);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [showBikeHint]);

  function handleSelectMotorcycle(nextMotorcycle: Motorcycle) {
    setSelectedMotorcycle(nextMotorcycle);
    setSelectedFuelType(nextMotorcycle.fuel_type);
    setIsSelectorOpen(false);
  }

  function dismissBikeHint(immediate = false) {
    if (!showBikeHint) {
      return;
    }

    if (immediate) {
      setShowBikeHint(false);
      return;
    }

    setIsBikeHintFading(true);
    window.setTimeout(() => setShowBikeHint(false), 250);
  }

  return (
    <section className="rounded-[20px] border-[0.5px] border-black/10 bg-white p-6">
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isSelectorOpen
            ? "max-h-0 opacity-0 pointer-events-none overflow-hidden"
            : "max-h-[720px] opacity-100 overflow-visible"
        }`}
        aria-hidden={isSelectorOpen}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
              Kết quả ước tính
            </p>
            <button
              type="button"
              className="relative mt-2 inline-flex items-center gap-2 text-left text-[24px] font-medium leading-7 text-[#1a1a18]"
              onClick={() => {
                dismissBikeHint(true);
                setIsSelectorOpen(true);
              }}
            >
              {showBikeHint ? (
                <span
                  className={`absolute bottom-full left-0 mb-3 inline-flex flex-col items-start transition-all duration-300 ${
                    isBikeHintFading ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"
                  }`}
                >
                  <span className="rounded-xl bg-[#1a1a18] px-3 py-2 text-[13px] font-medium text-[#F0EDE6]">
                    Chỉnh xe ở đây nè ✦
                  </span>
                  <span className="ml-6 h-0 w-0 border-l-[7px] border-r-[7px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#1a1a18]" />
                </span>
              ) : null}
              <span>{motorcycle.name}</span>
              <span aria-hidden="true" className="text-[18px] text-[#888780]">
                ˅
              </span>
            </button>
            <p className="mt-2 text-[13px] text-[#888780]">
              Bình xăng {formatDecimal(motorcycle.tank_liters)} lít • {motorcycle.brand}
            </p>
          </div>

          <span className="rounded-full bg-[#EAF3DE] px-3 py-1 text-[11px] font-medium text-[#3B6D11]">
            Khuyến nghị: {motorcycle.fuel_type}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {fuelTypes.map((fuelType) => {
            const isActive = selectedFuelType === fuelType;

            return (
              <button
                key={fuelType}
                type="button"
                className={`rounded-[20px] border-[0.5px] px-3 py-2 text-[13px] font-medium ${
                  isActive
                    ? "border-[#1a1a18] bg-[#1a1a18] text-[#F0EDE6]"
                    : "border-black/10 bg-white text-[#888780]"
                }`}
                onClick={() => setSelectedFuelType(fuelType)}
              >
                {fuelType}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <div className="rounded-2xl bg-[#F0EDE6] px-5 py-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
              Đổ đầy bình
            </p>
            <p className="mt-2 text-[40px] font-medium tracking-[-1px] text-[#1a1a18] [font-variant-numeric:tabular-nums]">
              {formatCurrency(result.fillCost)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[10px] bg-[#F0EDE6] p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
                Chi phí /100km
              </p>
              <p className="mt-2 text-[18px] font-medium text-[#1a1a18] [font-variant-numeric:tabular-nums]">
                {formatCurrency(result.costPer100km)}
              </p>
            </div>

            <div className="rounded-[10px] bg-[#F0EDE6] p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
                Phạm vi 1 bình
              </p>
              <p className="mt-2 text-[18px] font-medium text-[#1a1a18] [font-variant-numeric:tabular-nums]">
                ~{new Intl.NumberFormat("vi-VN").format(Math.round(result.fullTankRange))} km
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-200 ${
          isSelectorOpen ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isSelectorOpen}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
              Chọn xe máy
            </p>
            <h3
              className="mt-2 text-[28px] font-normal leading-8 tracking-[-0.5px] text-[#1a1a18]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Danh sách mẫu xe
            </h3>
          </div>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a18] text-[13px] font-medium text-[#F0EDE6]"
            onClick={() => setIsSelectorOpen(false)}
          >
            X
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {brands.map((brand) => {
            const isActive = brandFilter === brand;

            return (
              <button
                key={brand}
                type="button"
                className={`shrink-0 rounded-[20px] border-[0.5px] px-4 py-2 text-[13px] font-medium ${
                  isActive
                    ? "border-[#1a1a18] bg-[#1a1a18] text-[#F0EDE6]"
                    : "border-black/10 bg-white text-[#888780]"
                }`}
                onClick={() => setBrandFilter(brand)}
              >
                {brand}
              </button>
            );
          })}
        </div>

        <div className="mt-4 max-h-[420px] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            {filteredMotorcycles.map((item) => {
              const isActive = item.id === motorcycle.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`rounded-2xl border-[0.5px] p-4 text-left ${
                    isActive
                      ? "border-[#1a1a18] bg-[#1a1a18] text-[#F0EDE6]"
                      : "border-black/10 bg-white text-[#1a1a18]"
                  }`}
                  onClick={() => handleSelectMotorcycle(item)}
                >
                  <p
                    className={`text-[10px] font-medium uppercase tracking-[0.12em] ${
                      isActive ? "text-[#B4B2A9]" : "text-[#888780]"
                    }`}
                  >
                    {item.brand}
                  </p>
                  <p className="mt-2 text-[18px] font-medium leading-5">{item.name}</p>
                  <p
                    className={`mt-3 text-[13px] ${
                      isActive ? "text-[#F0EDE6]" : "text-[#888780]"
                    }`}
                  >
                    {formatDecimal(item.tank_liters)}L •{" "}
                    {formatDecimal(item.avg_consumption_per_100km)}L/100km
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
