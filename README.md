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
