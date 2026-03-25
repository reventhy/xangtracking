import { formatCurrency, formatShortDateTime } from "@/lib/calculations";
import { FuelPricesState } from "@/lib/types";

type FuelPriceBannerProps = {
  state: FuelPricesState;
};

export function FuelPriceBanner({ state }: FuelPriceBannerProps) {
  if (state.status === "error") {
    return (
      <section className="rounded-2xl border-[0.5px] border-black/10 bg-white px-5 py-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
          Giá xăng hôm nay · Vùng 1
        </p>
        <p className="mt-2 text-[13px] leading-5 text-[#1a1a18]">{state.message}</p>
        <p className="mt-3 text-[13px] text-[#888780]">
          Kiểm tra lúc {formatShortDateTime(state.last_checked)}
        </p>
        {state.source_url ? (
          <a
            href={state.source_url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-[13px] text-[#1a1a18] underline underline-offset-2"
          >
            Xem nguồn Petrolimex
          </a>
        ) : null}
      </section>
    );
  }

  const prices = state.prices;
  const isNews = prices.source === "news";
  const isOcr = prices.source === "ocr";
  const items = [
    { label: "E5 RON92", value: prices["E5 RON92"] },
    { label: "RON95-III", value: prices["RON95-III"] }
  ];

  return (
    <section className="rounded-2xl border-[0.5px] border-black/10 bg-white px-5 py-5">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
          {isNews ? "Giá xăng hôm nay" : "Giá xăng hôm nay · Vùng 1"}
        </p>
        <p className="mt-2 text-[13px] font-normal leading-5 text-[#888780]">
          {isNews
            ? "Theo bảng giá xăng dầu trên VnExpress"
            : isOcr
              ? "OCR từ thông cáo Petrolimex"
              : "Theo Petrolimex"}{" "}
          • {isNews ? "Cập nhật" : "Áp dụng Vùng 1 • Cập nhật"}{" "}
          {formatShortDateTime(prices.last_updated)}
        </p>
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
            <p className="mt-1 text-[13px] text-[#888780]">
              {isNews ? "Theo nguồn công khai • mỗi lít" : "Vùng 1 • mỗi lít"}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[13px] leading-5 text-[#888780]">
        ⚠️{" "}
        {isNews
          ? prices.next_update_note
          : isOcr
            ? "Giá Vùng 1 được đọc từ ảnh thông cáo Petrolimex, nên có thể có sai số OCR nhỏ"
            : "Giá hiển thị chỉ áp dụng cho Vùng 1 và có thể thay đổi theo kỳ điều hành"}
      </p>
    </section>
  );
}
