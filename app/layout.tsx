import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import "./workbench.css";
import "./launch.css";
import "./strategy.css";
import "./precision.css";
import { LocaleProvider } from "@/components/locale";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-sans" });
const manrope = Manrope({ subsets: ["latin", "vietnamese"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "TrendBridge AI — Product Intelligence & Launch Platform",
  description: "Market intelligence and go-to-market planning. Connect customer segments, competitive evidence, channel economics and launch decisions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable}`}><LocaleProvider>{children}</LocaleProvider></body>
    </html>
  );
}
