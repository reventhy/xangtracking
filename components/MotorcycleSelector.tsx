"use client";

import { useMemo, useState } from "react";
import { Brand, Motorcycle } from "@/lib/types";
import { formatDecimal } from "@/lib/calculations";

type MotorcycleSelectorProps = {
  motorcycles: Motorcycle[];
  selectedMotorcycle: Motorcycle;
  onSelect: (motorcycle: Motorcycle) => void;
};

const brands: Array<Brand | "Tất cả"> = [
  "Tất cả",
  "Honda",
  "Yamaha",
  "SYM",
  "Piaggio",
  "Suzuki"
];

export function MotorcycleSelector({
  motorcycles,
  selectedMotorcycle,
  onSelect
}: MotorcycleSelectorProps) {
  const [brandFilter, setBrandFilter] = useState<Brand | "Tất cả">("Tất cả");
  const [query, setQuery] = useState("");

  const filteredMotorcycles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return motorcycles.filter((motorcycle) => {
      const matchesBrand =
        brandFilter === "Tất cả" || motorcycle.brand === brandFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${motorcycle.brand} ${motorcycle.name}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesBrand && matchesQuery;
    });
  }, [brandFilter, motorcycles, query]);

  return (
    <section className="rounded-2xl border-[0.5px] border-black/10 bg-white px-5 py-5">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
            Chọn xe máy
          </p>
          <h2 className="mt-2 text-[13px] font-normal leading-5 text-[#1a1a18]">
            Tìm đúng mẫu xe để xem chi phí đổ đầy bình và mức tiêu hao thực tế.
          </h2>
        </div>

        <input
          aria-label="Tìm xe máy"
          className="w-full rounded-2xl border-[0.5px] border-black/10 bg-white px-4 py-3 text-[13px] text-[#1a1a18] outline-none placeholder:text-[#B4B2A9]"
          placeholder="Tìm theo tên xe hoặc hãng..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {brands.map((brand) => {
            const active = brand === brandFilter;
            return (
              <button
                key={brand}
                type="button"
                className={`shrink-0 rounded-[20px] border-[0.5px] px-4 py-2 text-[13px] font-medium ${
                  active
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
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {filteredMotorcycles.map((motorcycle) => {
          const active = motorcycle.id === selectedMotorcycle.id;
          return (
            <button
              key={motorcycle.id}
              type="button"
              className={`rounded-2xl border-[0.5px] p-4 text-left ${
                active
                  ? "border-[#1a1a18] bg-[#1a1a18] text-[#F0EDE6]"
                  : "border-black/10 bg-white text-[#1a1a18]"
              }`}
              onClick={() => onSelect(motorcycle)}
            >
              <div className="flex min-h-[84px] flex-col justify-between gap-3">
                <div>
                  <p
                    className={`text-[10px] font-medium uppercase tracking-[0.12em] ${
                      active ? "text-[#B4B2A9]" : "text-[#888780]"
                    }`}
                  >
                    {motorcycle.brand}
                  </p>
                  <h3 className="mt-2 text-[18px] font-medium leading-5">
                    {motorcycle.name}
                  </h3>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-medium ${
                    active
                      ? "bg-[#EAF3DE] text-[#3B6D11]"
                      : "bg-[#EAF3DE] text-[#3B6D11]"
                  }`}
                >
                  {motorcycle.fuel_type}
                </span>
              </div>

              <div
                className={`mt-4 flex flex-col gap-1 text-[13px] ${
                  active ? "text-[#F0EDE6]" : "text-[#888780]"
                }`}
              >
                <span>Bình xăng {formatDecimal(motorcycle.tank_liters)}L</span>
                <span>{formatDecimal(motorcycle.avg_consumption_per_100km)}L/100km</span>
              </div>
            </button>
          );
        })}
      </div>

      {filteredMotorcycles.length === 0 ? (
        <p className="mt-4 rounded-[10px] bg-[#F0EDE6] px-4 py-3 text-[13px] text-[#888780]">
          Không tìm thấy mẫu xe phù hợp.
        </p>
      ) : null}
    </section>
  );
}
