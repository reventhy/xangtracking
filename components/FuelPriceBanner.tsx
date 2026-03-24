import { formatCurrency, formatShortDateTime } from "@/lib/calculations";
import { FuelPrices } from "@/lib/types";

type FuelPriceBannerProps = {
  prices: FuelPrices;
};

export function FuelPriceBanner({ prices }: FuelPriceBannerProps) {
  const isFallback = prices.source === "fallback";
  const isOcr = prices.source === "ocr";
  const items = [
    { label: "E5 RON92", value: prices["E5 RON92"] },
    { label: "RON95-III", value: prices["RON95-III"] },
    { label: "RON95-IV", value: prices["RON95-IV"] }
  ];

  return (
    <section className="rounded-2xl border-[0.5px] border-black/10 bg-white px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
            Giá xăng hôm nay · Vùng 1
          </p>
          <p className="mt-2 text-[13px] font-normal leading-5 text-[#888780]">
            {isFallback
              ? "Giá lưu gần nhất theo Petrolimex"
              : isOcr
                ? "OCR từ thông cáo Petrolimex"
                : "Theo Petrolimex"}{" "}
            • Áp dụng Vùng 1 • Cập nhật {formatShortDateTime(prices.last_updated)}
          </p>
        </div>
        <span className="rounded-full bg-[#EAF3DE] px-3 py-1 text-[11px] font-medium text-[#3B6D11]">
          {prices.next_update_note}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-[10px] bg-[#F0EDE6] px-4 py-3"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
              {item.label}
            </p>
            <p className="mt-1 text-[18px] font-medium tabular-nums text-[#1a1a18]">
              {formatCurrency(item.value)}
            </p>
            <p className="mt-1 text-[13px] text-[#888780]">Vùng 1 • mỗi lít</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[13px] leading-5 text-[#888780]">
        ⚠️{" "}
        {isFallback
          ? "Nguồn chính thức đang chậm phản hồi, app tạm dùng giá dự phòng cho Vùng 1"
          : isOcr
            ? "Giá Vùng 1 được đọc từ ảnh thông cáo Petrolimex, nên có thể có sai số OCR nhỏ"
            : "Giá hiển thị chỉ áp dụng cho Vùng 1 và có thể thay đổi theo kỳ điều hành"}
      </p>
    </section>
  );
}
