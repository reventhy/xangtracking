export type Brand = "Honda" | "Yamaha" | "SYM" | "Piaggio" | "Suzuki";

export type FuelType = "E5 RON92" | "RON95-III" | "RON95-V";

export type FuelZone = "zone1" | "zone2";

export type Motorcycle = {
  id: string;
  name: string;
  brand: Brand;
  tank_liters: number;
  fuel_type: FuelType;
  avg_consumption_per_100km: number;
};

export type FuelProduct = {
  name: string;
  priceZone1: number;
  priceZone2: number;
};

export type FuelPrices = {
  zone1: Record<FuelType, number>;
  zone2: Record<FuelType, number>;
  allProducts: FuelProduct[];
  last_updated: string;
  next_update_note: string;
  source?: "official" | "news" | "ocr";
  source_url?: string;
};

export type FuelPricesState =
  | {
      status: "success";
      prices: FuelPrices;
    }
  | {
      status: "error";
      message: string;
      last_checked: string;
      source_url?: string;
    };

export type CalculationResult = {
  fillCost: number;
  costPer100km: number;
  fullTankRange: number;
};
