"use client";

import { formatCurrency } from "@/lib/calculations";
import { FuelPrices, Motorcycle, FuelType } from "@/lib/types";
import { FunnyConversion } from "./FunnyConversion";

interface ExportCardProps {
  motorcycle: Motorcycle;
  fuelPrices: FuelPrices;
  fuelType: FuelType;
  fillCost: number;
  mode: "full" | "amount";
  amount?: number;
  liters?: number;
  distance?: number;
}

export function ExportCard({
  motorcycle,
  fuelPrices,
  fuelType,
  fillCost,
  mode,
  amount,
  liters,
  distance,
}: ExportCardProps) {
  const today = new Date().toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  const pricePerLiter = fuelPrices[fuelType];

  return (
    <div
      id="export-card"
      className="w-[400px] rounded-[20px] border-[0.5px] border-black/10 bg-white p-6"
      style={{ position: "fixed", left: "-9999px", top: 0, backgroundColor: "#ffffff" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
            Đổ Xăng Bao Nhiêu?
          </p>
          <p className="mt-1 text-[13px] text-[#888780]">{today}</p>
        </div>
        <span className="rounded-full bg-[#EAF3DE] px-3 py-1 text-[11px] font-medium text-[#3B6D11]">
          {fuelType}
        </span>
      </div>

      {/* Main Content */}
      <div className="mt-6">
        <p className="text-[13px] text-[#888780]">
          {motorcycle.name} • {motorcycle.brand}
        </p>
        <p className="text-[13px] text-[#888780]">
          Bình {motorcycle.tank_liters} lít • {pricePerLiter.toLocaleString("vi-VN")} đ/lít
        </p>
      </div>

      {/* Cost Display */}
      <div className="mt-5 rounded-2xl bg-[#F0EDE6] px-5 py-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
          {mode === "full" ? "Đổ đầy bình" : "Số tiền đổ xăng"}
        </p>
        <p className="mt-2 text-[48px] font-medium tracking-[-1px] text-[#1a1a18] [font-variant-numeric:tabular-nums]">
          {formatCurrency(mode === "full" ? fillCost : (amount || 0))}
        </p>
      </div>

      {/* Amount mode extras */}
      {mode === "amount" && amount && amount > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-[10px] bg-[#F0EDE6] p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
              Đổ được
            </p>
            <p className="mt-2 text-[18px] font-medium text-[#1a1a18]">
              {liters?.toFixed(1)} lít
            </p>
          </div>
          <div className="rounded-[10px] bg-[#F0EDE6] p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
              Đi được
            </p>
            <p className="mt-2 text-[18px] font-medium text-[#1a1a18]">
              ~{Math.round(distance || 0)} km
            </p>
          </div>
        </div>
      )}

      {/* Funny Conversion */}
      <div className="mt-3">
        <FunnyConversion amount={mode === "full" ? fillCost : (amount || 0)} />
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4">
        <p className="text-[11px] text-[#888780]">
          Giá xăng • Vùng 1 • {today}
        </p>
        <p className="text-[11px] text-[#888780]">
          doxangbaonhieu.vercel.app
        </p>
      </div>
    </div>
  );
}
