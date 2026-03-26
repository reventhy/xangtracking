import { CalculationResult, FuelPrices, FuelType, FuelZone, Motorcycle } from "@/lib/types";

export function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(value))} đ`;
}

export function formatDecimal(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
}

export function formatShortDateTime(isoDate: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh"
  }).format(new Date(isoDate));
}

export function getFuelPrice(prices: FuelPrices, fuelType: FuelType, zone: FuelZone = "zone1") {
  return prices[zone][fuelType];
}

export function calculateMotorcycleCosts(
  motorcycle: Motorcycle,
  prices: FuelPrices,
  fuelType: FuelType = motorcycle.fuel_type,
  zone: FuelZone = "zone1"
): CalculationResult {
  const pricePerLiter = getFuelPrice(prices, fuelType, zone);

  return {
    fillCost: motorcycle.tank_liters * pricePerLiter,
    costPer100km: motorcycle.avg_consumption_per_100km * pricePerLiter,
    fullTankRange:
      (motorcycle.tank_liters / motorcycle.avg_consumption_per_100km) * 100
  };
}
