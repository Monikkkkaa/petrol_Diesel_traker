import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fuel Price Tracker | Daily Petrol & Diesel Prices in India",
  description: "Track live daily-updated fuel prices (Petrol & Diesel) for major cities in India, with price change indicators and historical differences.",
  keywords: ["fuel price tracker", "petrol price india", "diesel price india", "daily fuel price", "cardekho scraper"],
  authors: [{ name: "Fuel Price Tracker" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
