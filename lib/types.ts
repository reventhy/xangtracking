export type Brand = "Honda" | "Yamaha" | "SYM" | "Piaggio" | "Suzuki";

export type FuelType = "E5 RON92" | "RON95-III" | "RON95-IV";

export type Motorcycle = {
  id: string;
  name: string;
  brand: Brand;
  tank_liters: number;
  fuel_type: FuelType;
  avg_consumption_per_100km: number;
};

export type FuelPrices = {
  "E5 RON92": number;
  "RON95-III": number;
  "RON95-IV": number;
  last_updated: string;
  next_update_note: string;
  source?: "official" | "ocr" | "fallback";
  source_url?: string;
};

export type CalculationResult = {
  fillCost: number;
  costPer100km: number;
  fullTankRange: number;
};
