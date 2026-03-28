# Đổ Xăng Bao Nhiêu?

A lightweight web app that helps Vietnamese motorbike owners calculate fuel costs based on real-time petrol prices.

## Features

- **Real-time Fuel Prices**: Automatically fetches latest fuel prices from Petrolimex API with VnExpress news fallback
- **Motorbike Database**: 26 popular models from Honda, Yamaha, SYM, Piaggio, and Suzuki with accurate tank capacity and fuel consumption specs
- **Smart Calculations**:
  - Cost to fill up a full tank
  - Cost per 100km
  - Estimated range per full tank
- **Price Comparison**: Shows prices for both Zone 1 and Zone 2 (Vietnam fuel pricing regions)
- **Export & Share**: Generate and download calculation results as images
- **Mobile-first Design**: Optimized for Vietnamese motorbike riders on the go

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Runtime**: React 19
- **Styling**: Tailwind CSS
- **Fonts**: Be Vietnam Pro (Google Fonts)
- **Image Generation**: html2canvas
- **Analytics**: Vercel Analytics

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Data Sources

- **Primary**: Petrolimex Mobile API (official retail prices)
- **Fallback**: VnExpress fuel price news articles
- **Motorbike Specs**: Manufacturer data for tank capacity and fuel consumption

## Project Structure

```
├── app/                    # Next.js app router
│   ├── globals.css         # Global styles with custom color scheme
│   ├── layout.tsx          # Root layout with Be Vietnam Pro font
│   └── page.tsx            # Main page (server component)
├── components/             # React components
│   ├── HomeClient.tsx      # Main client-side logic
│   ├── FuelPriceBanner.tsx # Fuel price display component
│   ├── MotorcycleSelector.tsx
│   ├── ResultCard.tsx      # Calculation results display
│   ├── ExportCard.tsx      # Image export functionality
│   ├── ExportButton.tsx
│   └── FunnyConversion.tsx # Fun cost comparisons
├── lib/                    # Utilities and data
│   ├── fuel-prices.ts      # Price fetching logic (Petrolimex + VnExpress)
│   ├── motorcycles.ts      # Motorbike database
│   ├── calculations.ts     # Fuel cost calculations
│   └── types.ts            # TypeScript type definitions
├── public/
└── next.config.js         # Next.js configuration
```

## Environment Notes

The app uses Next.js `unstable_cache` to:
- Cache fuel prices for 5 minutes to minimize API calls
- Cache Petrolimex API tokens across serverless invocations
- Gracefully fallback to news sources if official API fails

## Fuel Price Sources Priority

1. **Petrolimex Mobile API** (official) - Zone 1 & Zone 2 prices
2. **VnExpress News** (fallback) - Latest fuel price articles

## License

MIT License - Created by [Nhat Nam](https://www.linkedin.com/in/namvunhatle/)

---

## 🚀 Roadmap

### Phase 1: Foundation (Done)
- [x] Real-time fuel price fetching
- [x] Motorbike database with 26 models
- [x] Basic cost calculations
- [x] Export to image

### Phase 2: Smart Features (In Progress)
- [ ] Fuel price predictions using ML
- [ ] Route-based fuel cost calculator (integrate Google Maps)
- [ ] Price drop alerts via Telegram/Email
- [ ] Historical price charts

### Phase 3: Community & Gamification
- [ ] User fuel logs & consumption tracking
- [ ] "Fuel efficiency" leaderboard among friends
- [ ] Achievement badges ("Scrooge McDuck" for saving fuel, "Road Warrior" for 1000km+)
- [ ] Social sharing with custom card designs

### Phase 4: AI & The Future
- [ ] AI chatbot: "Should I fill up today or wait?"
- [ ] Voice commands: "Hey Xăng, how much to Saigon?"
- [ ] AR mode: Point camera at fuel gauge, auto-calculates fill-up cost

---

## 🦄 Crazy Ideas (Brainstorm)

> Warning: These ideas range from "maybe doable" to "absolutely unhinged"

### The "Chơi Lớn" (Go Big) Ideas
1. **Xăng Prediction Market** - Let users bet on tomorrow's fuel prices with fake currency. Top predictors get bragging rights.

2. **Mood-Based Fuel Calculator** - "I'm feeling broke today" → suggests cheapest stations. "I'm feeling rich" → shows premium gas options with confetti animation.

3. **Fuel Price Horror Stories** - A "scary stories" mode that tells tales of people who filled up right before a price drop. Complete with flashlight effect and spooky sound effects.

4. **The "Trà Đá" Index** - Convert fuel costs into relatable Vietnamese street food equivalents:
   - "This trip costs 3 trà đá + 2 bánh mì"
   - "Full tank = 15 ly trà sữa trân châu"

5. **Người Yêu Cũ Comparison** - "Your ex's new partner fills up their Lexus for 500k. You fill up your Wave for 80k. Who's winning now?"

### The Tech-Heavy Ideas
6. **Smart Helmet Integration** - Connect with bluetooth helmets to whisper fuel prices as you ride past stations.

7. **Blockchain Fuel Tokens** - "XăngCoin" - because why not? Each liter mined (not really, it's a joke... or is it?)

8. **IoT Fuel Cap** - A physical smart cap that tracks your fuel level and texts you when prices drop.

9. **AI Fuel Attendant** - "Em chào anh chị! Đổ đầy bình ạ?" - A virtual attendant with Saigon accent that judges your fuel choices.

### The Absolutely Unhinged Ideas
10. **Doomsday Preppers Mode** - Calculate how many liters you need to escape Saigon during zombie apocalypse. Includes survival tips.

11. **Tử Vi Xăng** - Daily horoscope based on your motorbike's license plate number. "Today is not a good day to fill up. Wait until Mercury is in retrograde."

12. **Escape Room: The Petrol Station** - A mini-game where you have to calculate exact change before the pump times out.

13. **The "Compare to Europe" Reality Check** - Shows fuel prices in Europe with a big "Stop complaining" banner.

14. **Fuel ASMR Mode** - Recordings of fuel caps opening, pumps clicking, engines starting. For... relaxation purposes?

15. **Motorbike Dating App** - "Your Honda Wave and that Vespa at the pump would make a cute couple."

---

*Have a crazy idea? Open an issue! We promise we won't judge (much).*
