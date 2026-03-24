import { HomeClient } from "@/components/HomeClient";
import { getFuelPrices } from "@/lib/fuel-prices";

export const revalidate = 1800;

export default async function Home() {
  const fuelPrices = await getFuelPrices();

  return <HomeClient fuelPrices={fuelPrices} />;
}
