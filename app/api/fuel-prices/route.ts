import { NextResponse } from "next/server";
import { getFuelPrices } from "@/lib/fuel-prices";

export const dynamic = "force-dynamic";

export async function GET() {
  // Future improvement:
  // If Petrolimex changes its internal API shape, keep this route stable
  // and adjust only the source adapter in lib/fuel-prices.ts.
  const prices = await getFuelPrices();
  const isError = prices.status === "error";

  return NextResponse.json(prices, {
    status: isError ? 503 : 200,
    headers: {
      "Cache-Control": isError
        ? "no-store, max-age=0"
        : "s-maxage=300, stale-while-revalidate=60"
    }
  });
}
