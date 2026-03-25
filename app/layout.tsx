import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "Đổ Xăng Bao Nhiêu?",
  description: "Biết giá xăng, chủ động túi tiền cho chủ xe máy Việt Nam."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={beVietnamPro.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
