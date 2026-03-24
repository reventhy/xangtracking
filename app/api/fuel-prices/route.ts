import { NextResponse } from "next/server";
import { getFuelPrices } from "@/lib/fuel-prices";

export const revalidate = 1800;

export async function GET() {
  // Future improvement:
  // If Petrolimex changes its internal API shape, keep this route stable
  // and adjust only the source adapter in lib/fuel-prices.ts.
  const prices = await getFuelPrices();

  return NextResponse.json(prices, {
    headers: {
      "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400"
    }
  });
}
