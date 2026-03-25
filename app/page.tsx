import { HomeClient } from "@/components/HomeClient";
import { getFuelPrices } from "@/lib/fuel-prices";

export const revalidate = 1800;

export default async function Home() {
  const fuelPricesState = await getFuelPrices();

  return <HomeClient fuelPricesState={fuelPricesState} />;
}
