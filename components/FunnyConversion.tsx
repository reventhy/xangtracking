"use client";

import { useState, useMemo } from "react";

// The legendary Trà Đá Index - Vietnamese street food currency
interface StreetFoodItem {
  name: string;
  price: number;
  icon: string;
  description: string;
}

const STREET_FOOD_MENU: StreetFoodItem[] = [
  { name: "ly trà đá", price: 3000, icon: "🧊", description: "The OG refreshment" },
  { name: "bánh tráng trộn", price: 15000, icon: "🥗", description: "Snack of champions" },
  { name: "ổ bánh mì", price: 15000, icon: "🥖", description: "Vietnamese sandwich king" },
  { name: "ly cà phê sữa đá", price: 20000, icon: "☕", description: "Fuel for the soul" },
  { name: "tô bún chả", price: 40000, icon: "🍜", description: "Hanoi in a bowl" },
  { name: "tô phở bò", price: 45000, icon: "🍲", description: "Liquid gold" },
  { name: "ly trà sữa trân châu", price: 35000, icon: "🧋", description: "Gen Z's choice" },
  { name: "bún đậu mắm tôm", price: 50000, icon: "🦐", description: "Adventurous eater" },
  { name: "cơm tấm sườn bì", price: 35000, icon: "🍚", description: "Saigon classic" },
  { name: "chè Thái", price: 25000, icon: "🍧", description: "Sweet escape" },
];

// Mood modes affect the message tone
export type MoodMode = "normal" | "broke" | "rich" | "hangry" | "romantic";

interface FunnyConversionProps {
  amount: number;
  mood?: MoodMode;
}

const MOOD_MESSAGES: Record<MoodMode, { prefix: string; suffix: string; color: string }> = {
  normal: {
    prefix: "Cùng số tiền này",
    suffix: "",
    color: "bg-[#0058A8]",
  },
  broke: {
    prefix: "💸 Ví mỏng alert!",
    suffix: "... đành ngắm vậy 😢",
    color: "bg-[#8B4513]",
  },
  rich: {
    prefix: "💎 Đẳng cấp thượng lưu",
    suffix: "- Treat yourself! ✨",
    color: "bg-[#FFD700]",
  },
  hangry: {
    prefix: "🍴 Đói rồi!",
    suffix: "- Đi ăn thôi! 🔥",
    color: "bg-[#D32F2F]",
  },
  romantic: {
    prefix: "💕 Date night budget",
    suffix: "- Mời em đi chơi! 🌹",
    color: "bg-[#E91E63]",
  },
};

export function FunnyConversion({ amount, mood = "normal" }: FunnyConversionProps) {
  const [showTraDaIndex, setShowTraDaIndex] = useState(false);

  const moodStyle = MOOD_MESSAGES[mood];

  const conversions = useMemo(() => {
    // Calculate how many of each item you could buy
    const results = STREET_FOOD_MENU.map((item) => ({
      ...item,
      quantity: Math.floor(amount / item.price),
      percentage: ((amount % item.price) / item.price) * 100,
    })).filter((item) => item.quantity > 0);

    // Sort by best value (most items)
    return results.sort((a, b) => b.quantity - a.quantity).slice(0, 3);
  }, [amount]);

  const traDaEquivalent = useMemo(() => {
    const traDa = STREET_FOOD_MENU[0]; // trà đá
    const quantity = Math.floor(amount / traDa.price);
    return { ...traDa, quantity };
  }, [amount]);

  const randomFunFact = useMemo(() => {
    const facts = [
      "Đủ mua một bữa trưa ngon lành! 🍽️",
      "Tiết kiệm được bằng 3 ly trà sữa! 🧋",
      "Bằng 2 ngày ăn cơm tấm liên tục! 🍚",
      "Đủ cho một buổi hẹn hò coffee date! ☕",
      "Có thể mua một chiếc áo Sài Gòn! 👕",
      "Bằng 10 lần gửi xe máy! 🛵",
    ];
    return facts[Math.floor(amount / 10000) % facts.length];
  }, [amount]);

  if (conversions.length === 0) {
    return (
      <div className={`rounded-[10px] ${moodStyle.color} p-4`}>
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/80">
          {moodStyle.prefix}
        </p>
        <p className="mt-2 text-[18px] font-medium text-white">
          Chưa đủ mua ly trà đá... 😅
        </p>
        <p className="mt-1 text-[13px] text-white/70">
          Cần thêm {3000 - amount}đ nữa!
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-[10px] ${moodStyle.color} p-4 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/80">
          {moodStyle.prefix}
        </p>
        <button
          onClick={() => setShowTraDaIndex(!showTraDaIndex)}
          className="text-[10px] underline underline-offset-2 text-white/70 hover:text-white transition-colors"
        >
          {showTraDaIndex ? "Ẩn Trà Đá Index" : "📊 Trà Đá Index"}
        </button>
      </div>

      {!showTraDaIndex ? (
        <>
          <p className="mt-2 text-[18px] font-medium text-white">
            {conversions[0].quantity} {conversions[0].icon} {conversions[0].name}
          </p>
          {conversions[1] && (
            <p className="mt-1 text-[13px] text-white/70">
              Hoặc {conversions[1].quantity} {conversions[1].icon} {conversions[1].name}
            </p>
          )}
          <p className="mt-2 text-[11px] text-white/60 italic">
            {randomFunFact} {moodStyle.suffix}
          </p>
        </>
      ) : (
        <div className="mt-3 space-y-2">
          <p className="text-[13px] font-medium text-white border-b border-white/20 pb-2">
            🧊 Trà Đá Index: {traDaEquivalent.quantity} ly
          </p>
          {conversions.slice(0, 4).map((item, idx) => (
            <div key={item.name} className="flex items-center justify-between text-[12px]">
              <span className="text-white/90">
                {item.icon} {item.name}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/80 rounded-full"
                    style={{ width: `${Math.min(100, (item.quantity / 10) * 100)}%` }}
                  />
                </div>
                <span className="text-white font-medium w-6 text-right">{item.quantity}</span>
              </div>
            </div>
          ))}
          <p className="text-[10px] text-white/50 mt-2 italic">
            *Giá tham khảo, có thể khác tùy khu vực
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

const MOODS: { value: MoodMode; label: string; emoji: string }[] = [
  { value: "normal", label: "Bình thường", emoji: "😊" },
  { value: "broke", label: "Ví mỏng", emoji: "💸" },
  { value: "rich", label: "Đại gia", emoji: "💎" },
  { value: "hangry", label: "Đói rồi", emoji: "🍴" },
  { value: "romantic", label: "Tỏ tình", emoji: "💕" },
];

export function MoodSelector({ currentMood, onMoodChange }: MoodSelectorProps) {
  return (
    <div className="rounded-[10px] bg-[#F0EDE6] p-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#888780] mb-2">
        Hôm nay bạn thế nào?
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
          >
            <span>{mood.emoji}</span>
            <span>{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
