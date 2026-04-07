import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, DM_Sans, Noto_Sans_JP } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Espoir Basketball Stats",
  description: "Espoir バスケットボールチームのシーズンスタッツダッシュボード",
  robots: {
    index: false,
    follow: false,
  },
  other: {
    "theme-color": "#06060c",
    "color-scheme": "dark",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark" style={{ colorScheme: "dark" }}>
      <body
        className={`${barlowCondensed.variable} ${dmSans.variable} ${notoSansJP.variable} antialiased`}
      >
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent-purple focus:text-white focus:rounded-lg">
          メインコンテンツへ
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
