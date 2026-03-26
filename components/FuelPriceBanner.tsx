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
          Giá xăng dầu hôm nay
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

  const { prices } = state;
  const isNews = prices.source === "news";

  return (
    <section className="rounded-2xl border-[0.5px] border-black/10 bg-white px-5 py-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
        Giá xăng dầu hôm nay
      </p>
      <p className="mt-2 text-[13px] font-normal leading-5 text-[#888780]">
        {isNews ? "Theo VnExpress" : "Theo Petrolimex"} • Cập nhật{" "}
        {formatShortDateTime(prices.last_updated)}
      </p>

      <div className="mt-4 overflow-hidden rounded-[10px] bg-[#F0EDE6]">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-4 py-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
            Mặt hàng
          </span>
          <span className="w-20 text-right text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
            Vùng 1
          </span>
          <span className="w-20 text-right text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
            Vùng 2
          </span>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-black/[0.06]" />

        {/* Product rows */}
        {prices.allProducts.map((product, index) => (
          <div
            key={product.name}
            className={`grid grid-cols-[1fr_auto_auto] gap-x-4 px-4 py-3 ${
              index < prices.allProducts.length - 1 ? "border-b border-black/[0.06]" : ""
            }`}
          >
            <span className="text-[13px] text-[#1a1a18]">{product.name}</span>
            <span className="w-20 text-right text-[13px] font-medium tabular-nums text-[#1a1a18]">
              {formatCurrency(product.priceZone1)}
            </span>
            <span className="w-20 text-right text-[13px] tabular-nums text-[#888780]">
              {isNews ? "—" : formatCurrency(product.priceZone2)}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[13px] leading-5 text-[#888780]">
        ⚠️{" "}
        {isNews
          ? "Nguồn dự phòng từ VnExpress — không phân biệt vùng, RON 95-V lấy theo giá RON 95-III"
          : "Giá có thể thay đổi theo kỳ điều hành • Đơn vị: đồng/lít"}
      </p>
    </section>
  );
}
