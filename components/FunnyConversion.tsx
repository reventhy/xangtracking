"use client";

import { useState, useMemo } from "react";

// The legendary Trà Đá Index - Vietnamese street food currency
interface StreetFoodItem {
  name: string;
  price: number;
  icon: string;
}

const STREET_FOOD_MENU: StreetFoodItem[] = [
  { name: "ly trà đá", price: 3000, icon: "🧊" },
  { name: "bánh tráng trộn", price: 15000, icon: "🥗" },
  { name: "ổ bánh mì", price: 15000, icon: "🥖" },
  { name: "ly cà phê sữa đá", price: 20000, icon: "☕" },
  { name: "tô bún chả", price: 40000, icon: "🍜" },
  { name: "tô phở bò", price: 45000, icon: "🍲" },
  { name: "ly trà sữa", price: 35000, icon: "🧋" },
  { name: "cơm tấm", price: 35000, icon: "🍚" },
  { name: "chè Thái", price: 25000, icon: "🍧" },
];

// Mood modes affect the message tone
export type MoodMode = "normal" | "broke" | "rich" | "hangry" | "romantic";

interface FunnyConversionProps {
  amount: number;
  mood?: MoodMode;
}

const MOOD_MESSAGES: Record<MoodMode, { prefix: string; suffix: string }> = {
  normal: {
    prefix: "Cùng số tiền này",
    suffix: "",
  },
  broke: {
    prefix: "💸 Ví mỏng",
    suffix: "... đành ngắm vậy",
  },
  rich: {
    prefix: "💎 Đẳng cấp",
    suffix: "- Treat yourself!",
  },
  hangry: {
    prefix: "🍴 Đói rồi",
    suffix: "- Đi ăn thôi!",
  },
  romantic: {
    prefix: "💕 Date night",
    suffix: "- Mời em đi chơi!",
  },
};

export function FunnyConversion({ amount, mood = "normal" }: FunnyConversionProps) {
  const [showTraDaIndex, setShowTraDaIndex] = useState(false);

  const moodStyle = MOOD_MESSAGES[mood];

  const conversions = useMemo(() => {
    const results = STREET_FOOD_MENU.map((item) => ({
      ...item,
      quantity: Math.floor(amount / item.price),
    })).filter((item) => item.quantity > 0);

    return results.sort((a, b) => b.quantity - a.quantity).slice(0, 3);
  }, [amount]);

  const traDaEquivalent = useMemo(() => {
    const traDa = STREET_FOOD_MENU[0];
    const quantity = Math.floor(amount / traDa.price);
    return { ...traDa, quantity };
  }, [amount]);

  if (conversions.length === 0) {
    return (
      <div className="rounded-[10px] bg-[#F0EDE6] p-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
          {moodStyle.prefix}
        </p>
        <p className="mt-2 text-[16px] font-medium text-[#1a1a18]">
          Chưa đủ mua ly trà đá...
        </p>
        <p className="mt-1 text-[13px] text-[#888780]">
          Cần thêm {3000 - amount}đ nữa
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] bg-[#F0EDE6] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780]">
          {moodStyle.prefix}
        </p>
        <button
          onClick={() => setShowTraDaIndex(!showTraDaIndex)}
          className="text-[10px] underline underline-offset-2 text-[#888780] hover:text-[#1a1a18] transition-colors"
        >
          {showTraDaIndex ? "Ẩn chi tiết" : "📊 Trà Đá Index"}
        </button>
      </div>

      {!showTraDaIndex ? (
        <>
          <p className="mt-2 text-[16px] font-medium text-[#1a1a18]">
            {conversions[0].quantity} {conversions[0].icon} {conversions[0].name}
          </p>
          {conversions[1] && (
            <p className="mt-1 text-[13px] text-[#888780]">
              Hoặc {conversions[1].quantity} {conversions[1].icon} {conversions[1].name}
            </p>
          )}
          {moodStyle.suffix && (
            <p className="mt-1 text-[12px] text-[#888780] italic">
              {moodStyle.suffix}
            </p>
          )}
        </>
      ) : (
        <div className="mt-3 space-y-2">
          <p className="text-[13px] font-medium text-[#1a1a18] border-b border-black/10 pb-2">
            🧊 Trà Đá Index: {traDaEquivalent.quantity} ly
          </p>
          {conversions.slice(0, 5).map((item) => (
            <div key={item.name} className="flex items-center justify-between text-[12px]">
              <span className="text-[#1a1a18]">
                {item.icon} {item.name}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-black/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1a1a18]/60 rounded-full"
                    style={{ width: `${Math.min(100, (item.quantity / 10) * 100)}%` }}
                  />
                </div>
                <span className="text-[#1a1a18] font-medium w-6 text-right">{item.quantity}</span>
              </div>
            </div>
          ))}
          <p className="text-[10px] text-[#888780] mt-2 italic">
            *Giá tham khảo
          </p>
        </div>
      )}
    </div>
  );
}

// Mood selector component
interface MoodSelectorProps {
  currentMood: MoodMode;
  onMoodChange: (mood: MoodMode) => void;
}

const MOODS: { value: MoodMode; label: string; emoji: string; hint: string }[] = [
  { value: "normal", label: "Bình thường", emoji: "😊", hint: "100k" },
  { value: "broke", label: "Ví mỏng", emoji: "💸", hint: "50k" },
  { value: "rich", label: "Đại gia", emoji: "💎", hint: "200k" },
  { value: "hangry", label: "Đói rồi", emoji: "🍴", hint: "30k" },
  { value: "romantic", label: "Tỏ tình", emoji: "💕", hint: "150k" },
];

export function MoodSelector({ currentMood, onMoodChange }: MoodSelectorProps) {
  return (
    <div className="rounded-[10px] bg-[#F0EDE6] p-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780] mb-2">
        Chọn tâm trạng (tự động gợi ý)
      </p>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => onMoodChange(mood.value)}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] transition-all ${
              currentMood === mood.value
                ? "bg-[#1a1a18] text-[#F0EDE6]"
                : "bg-white text-[#888780] hover:bg-[#1a1a18]/10"
            }`}
            title={`Gợi ý: ${mood.hint}`}
          >
            <span>{mood.emoji}</span>
            <span>{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
