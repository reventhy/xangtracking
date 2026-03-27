"use client";

import { useMemo } from "react";

interface ConversionItem {
  name: string;
  price: number;
}

const CONVERSION_ITEMS: ConversionItem[] = [
  { name: "tô phở", price: 35000 },
  { name: "ly cà phê", price: 25000 },
  { name: "ổ bánh mì", price: 15000 },
  { name: "ly trà sữa", price: 45000 },
  { name: "tô bún chả", price: 40000 },
  { name: "vé xe buýt", price: 7000 },
  { name: "hộp xôi", price: 12000 },
  { name: "chai nước suối", price: 5000 },
];

interface FunnyConversionProps {
  amount: number;
}

export function FunnyConversion({ amount }: FunnyConversionProps) {
  const conversion = useMemo(() => {
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
      message: `Đổ được ${quantity} ${item.name}`,
    };
  }, [amount]);

  const alternative = useMemo(() => {
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
    <div className="rounded-[10px] bg-[#0058A8] p-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/80">
        Cùng số tiền này
      </p>
      <p className="mt-2 text-[18px] font-medium text-white">
        {conversion.message}
      </p>
      {alternative && alternative.quantity >= 1 && (
        <p className="mt-1 text-[13px] text-white/70">
          Hoặc {alternative.quantity} {alternative.item.name}
        </p>
      )}
    </div>
  );
}
