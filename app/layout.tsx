import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-sans" });
const manrope = Manrope({ subsets: ["latin", "vietnamese"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "TrendBridge AI — Product Intelligence & Launch Platform",
  description: "Từ ý tưởng sản phẩm đến quyết định đầu tư dựa trên bằng chứng.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} ${manrope.variable}`}>{children}</body>
    </html>
  );
}
