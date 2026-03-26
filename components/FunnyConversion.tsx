"use client";

import { useMemo } from "react";

interface ConversionItem {
  name: string;
  price: number;
  icon: string;
}

const CONVERSION_ITEMS: ConversionItem[] = [
  { name: "tô phở", price: 35000, icon: "🍜" },
  { name: "ly cà phê", price: 25000, icon: "☕" },
  { name: "ổ bánh mì", price: 15000, icon: "🥖" },
  { name: "ly trà sữa", price: 45000, icon: "🧋" },
  { name: "tô bún chả", price: 40000, icon: "🍲" },
  { name: "vé xe buýt", price: 7000, icon: "🚌" },
  { name: "hộp xôi", price: 12000, icon: "🍚" },
  { name: "chai nước suối", price: 5000, icon: "💧" },
];

interface FunnyConversionProps {
  amount: number;
}

export function FunnyConversion({ amount }: FunnyConversionProps) {
  const conversion = useMemo(() => {
    // Pick a random item based on the amount to keep it consistent for the same value
    const itemIndex = Math.floor(amount / 10000) % CONVERSION_ITEMS.length;
    const item = CONVERSION_ITEMS[itemIndex];
    const quantity = Math.floor(amount / item.price);

    if (quantity < 1) {
      return {
        item,
        quantity: 1,
        message: `Chưa đủ cho 1 ${item.name}`,
      };
    }

    return {
      item,
      quantity,
      message: `Đổ được ${quantity} ${item.name} ${item.icon}`,
    };
  }, [amount]);

  const alternative = useMemo(() => {
    // Find a secondary conversion
    const alternatives = CONVERSION_ITEMS.filter(
      (item) => item.name !== conversion.item.name
    );
    const randomIndex = Math.floor(amount / 5000) % alternatives.length;
    const item = alternatives[randomIndex];
    const quantity = Math.floor(amount / item.price);

    if (quantity < 1) return null;

    return { item, quantity };
  }, [amount, conversion.item.name]);

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-100">
      <p className="text-sm text-amber-800 font-medium">
        💡 Cùng số tiền này, bạn có thể mua:
      </p>
      <p className="text-base text-amber-900 font-semibold mt-1">
        {conversion.message}
      </p>
      {alternative && alternative.quantity >= 1 && (
        <p className="text-xs text-amber-700 mt-1">
          Hoặc {alternative.quantity} {alternative.item.name} {alternative.item.icon}
        </p>
      )}
    </div>
  );
}
