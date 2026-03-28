"use client";

import { useEffect, useState } from "react";
import { calculateMotorcycleCosts, formatCurrency, formatDecimal, getFuelPrice } from "@/lib/calculations";
import { Brand, FuelPrices, FuelType, FuelZone, Motorcycle } from "@/lib/types";
import { FunnyConversion, MoodSelector, MoodMode } from "./FunnyConversion";

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

const fuelTypes: FuelType[] = ["E5 RON92", "RON95-III", "RON95-V"];
const fuelZones: Array<{ id: FuelZone; label: string }> = [
  { id: "zone1", label: "Vùng 1" },
  { id: "zone2", label: "Vùng 2" }
];
const calculatorModes = [
  { id: "full", label: "Đổ đầy bình" },
  { id: "amount", label: "Nhập số tiền" }
] as const;

export function ResultCard({ motorcycles, fuelPrices }: ResultCardProps) {
  const [selectedMotorcycle, setSelectedMotorcycle] = useState(motorcycles[0]);
  const [selectedFuelType, setSelectedFuelType] = useState<FuelType>(
    motorcycles[0].fuel_type
  );
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [brandFilter, setBrandFilter] = useState<Brand | "Tất cả">("Tất cả");
  const [showBikeHint, setShowBikeHint] = useState(true);
  const [isBikeHintFading, setIsBikeHintFading] = useState(false);
  const [calculatorMode, setCalculatorMode] =
    useState<(typeof calculatorModes)[number]["id"]>("full");
  const [amountInput, setAmountInput] = useState("");
  const [selectedZone, setSelectedZone] = useState<FuelZone>("zone1");
  const [mood, setMood] = useState<MoodMode>("normal");

  // Mood-based recommended amounts (in VND)
  const MOOD_RECOMMENDATIONS: Record<MoodMode, number> = {
    normal: 100000,    // Standard fill
    broke: 50000,      // Minimum viable
    rich: 200000,      // Premium fill
    hangry: 30000,     // Just enough to get to food
    romantic: 150000,  // Nice round number for date
  };

  // Handle mood change - auto-switch to amount mode and fill recommended amount
  function handleMoodChange(newMood: MoodMode) {
    setMood(newMood);
    setCalculatorMode("amount");
    setAmountInput(String(MOOD_RECOMMENDATIONS[newMood]));
  }

  const motorcycle = selectedMotorcycle;
  const result = calculateMotorcycleCosts(motorcycle, fuelPrices, selectedFuelType, selectedZone);
  const pricePerLiter = getFuelPrice(fuelPrices, selectedFuelType, selectedZone);
  const amountValue = Number.parseInt(amountInput || "0", 10);
  const purchasedLiters = amountValue > 0 ? amountValue / pricePerLiter : 0;
  const estimatedDistance =
    purchasedLiters > 0
      ? (purchasedLiters / motorcycle.avg_consumption_per_100km) * 100
      : 0;
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

  function handleAmountChange(value: string) {
    setAmountInput(value.replace(/\D/g, ""));
  }

  return (
    <section className="rounded-[20px] border-[0.5px] border-black/10 bg-white p-6">
      <div
        id="result-card-content"
        className={`overflow-hidden transition-all duration-200 ${
          isSelectorOpen
            ? "max-h-0 opacity-0 pointer-events-none overflow-hidden"
            : "max-h-[720px] opacity-100 overflow-visible"
        }`}
        aria-hidden={isSelectorOpen}
      >
        <div className="mb-3.5 h-9 rounded-[20px] bg-[#F0EDE6] p-[3px]">
          <div className="grid grid-cols-2 gap-1">
            {calculatorModes.map((mode) => {
              const isActive = calculatorMode === mode.id;

              return (
                <button
                  key={mode.id}
                  type="button"
                  className={`h-[30px] rounded-[17px] px-3 text-[13px] font-medium leading-none transition-colors ${
                    isActive
                      ? "bg-[#1a1a18] text-[#F0EDE6]"
                      : "bg-transparent text-[#888780]"
                  }`}
                  onClick={() => setCalculatorMode(mode.id)}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
              Kết quả ước tính
            </p>
            <button
              type="button"
              className="relative mt-2 inline-flex items-center gap-2 text-left text-[20px] sm:text-[24px] font-medium leading-7 text-[#1a1a18] max-w-full"
              onClick={() => {
                dismissBikeHint(true);
                setIsSelectorOpen(true);
              }}
            >
              {showBikeHint ? (
                <span
                  className={`absolute right-full top-1/2 mr-3 inline-flex -translate-y-1/2 items-center transition-all duration-300 hidden sm:inline-flex ${
                    isBikeHintFading
                      ? "-translate-x-1 -translate-y-1/2 opacity-0"
                      : "translate-x-0 -translate-y-1/2 opacity-100"
                  }`}
                >
                  <span className="whitespace-nowrap rounded-xl bg-[#1a1a18] px-3 py-2 text-[13px] font-medium text-[#F0EDE6]">
                    Chỉnh xe ở đây nè ✦
                  </span>
                  <span className="h-0 w-0 border-b-[7px] border-l-[8px] border-t-[7px] border-b-transparent border-l-[#1a1a18] border-t-transparent" />
                </span>
              ) : null}
              <span className="truncate">{motorcycle.name}</span>
              <span aria-hidden="true" className="text-[18px] text-[#888780] shrink-0">
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

        <div className="mt-2 flex gap-2">
          {fuelZones.map((zone) => {
            const isActive = selectedZone === zone.id;

            return (
              <button
                key={zone.id}
                type="button"
                className={`rounded-[20px] border-[0.5px] px-3 py-2 text-[13px] font-medium ${
                  isActive
                    ? "border-[#1a1a18] bg-[#1a1a18] text-[#F0EDE6]"
                    : "border-black/10 bg-white text-[#888780]"
                }`}
                onClick={() => setSelectedZone(zone.id)}
              >
                {zone.label}
              </button>
            );
          })}
        </div>

        {calculatorMode === "full" ? (
          <div className="mt-5 flex flex-col gap-3">
            <div className="rounded-2xl bg-[#F0EDE6] px-4 sm:px-5 py-4 sm:py-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
                Đổ đầy bình
              </p>
              <p className="mt-2 text-[32px] sm:text-[40px] font-medium tracking-[-1px] text-[#1a1a18] [font-variant-numeric:tabular-nums] break-all">
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

            <FunnyConversion amount={result.fillCost} mood={mood} />
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
                Số tiền
              </p>
              <div className="mt-2 flex items-end gap-2 border-b-[1.5px] border-[#1a1a18] pb-2">
                <input
                  inputMode="numeric"
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[28px] sm:text-[36px] font-medium tracking-[-1px] text-[#1a1a18] outline-none placeholder:text-[#B4B2A9] [font-variant-numeric:tabular-nums]"
                  placeholder="50.000"
                  value={
                    amountInput.length > 0
                      ? new Intl.NumberFormat("vi-VN").format(Number.parseInt(amountInput, 10))
                      : ""
                  }
                  onChange={(event) => handleAmountChange(event.target.value)}
                />
                <span className="pb-1 text-[24px] font-medium text-[#1a1a18]">đ</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[20000, 50000, 100000, 200000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className="rounded-full bg-[#F0EDE6] px-3 py-2 text-[13px] font-medium text-[#1a1a18] [font-variant-numeric:tabular-nums]"
                  onClick={() => setAmountInput(String(amount))}
                >
                  {new Intl.NumberFormat("vi-VN").format(amount)}đ
                </button>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[10px] bg-[#F0EDE6] p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
                  Đổ được
                </p>
                <p className="mt-2 text-[18px] font-medium text-[#1a1a18] [font-variant-numeric:tabular-nums]">
                  {amountValue > 0 ? `${formatDecimal(purchasedLiters)} lít` : "—"}
                </p>
              </div>

              <div className="rounded-[10px] bg-[#F0EDE6] p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
                  Đi được khoảng
                </p>
                <p className="mt-2 text-[18px] font-medium text-[#1a1a18] [font-variant-numeric:tabular-nums]">
                  {amountValue > 0
                    ? `~${new Intl.NumberFormat("vi-VN").format(
                        Math.round(estimatedDistance)
                      )} km`
                    : "—"}
                </p>
              </div>
            </div>

            <MoodSelector currentMood={mood} onMoodChange={handleMoodChange} />

            {amountValue > 0 && <FunnyConversion amount={amountValue} mood={mood} />}
          </div>
        )}
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
